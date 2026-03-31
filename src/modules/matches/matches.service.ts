// src/modules/matches/matches.service.ts
import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { Match, MatchStatus } from '../../database/models/match.model';
import { Team } from '../../database/models/team.model';
import { MatchEvent, EventType } from '../../database/models/match-event.model';
import { PlayerStat } from '../../database/models/player-stat.model';
import { LeagueStanding } from '../../database/models/league-standing.model';
import { Redis } from 'ioredis';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchEventDto } from './dto/match-event.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { getPaginationOptions, buildPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(Match) private matchModel: typeof Match,
    @InjectModel(MatchEvent) private eventModel: typeof MatchEvent,
    @InjectModel(PlayerStat) private playerStatModel: typeof PlayerStat,
    @InjectModel(LeagueStanding) private standingModel: typeof LeagueStanding,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async create(dto: CreateMatchDto) {
    const { scheduled_at, ...data } = dto;
    return this.matchModel.create({
      ...data,
      match_date: new Date(scheduled_at),
    } as any);
  }

  async findAll(dto: PaginationDto, leagueId?: string) {
    const where = leagueId ? { league_id: leagueId } : {};
    const { rows, count } = await this.matchModel.findAndCountAll({
      where,
      ...getPaginationOptions(dto),
      include: [
        { model: Team, as: 'homeTeam', attributes: ['name', 'logo_url'] },
        { model: Team, as: 'awayTeam', attributes: ['name', 'logo_url'] },
      ],
      order: [['scheduled_at', 'ASC']],
    });
    return buildPaginatedResponse(rows, count, dto);
  }

  async update(id: string, dto: UpdateMatchDto) {
    const match = await this.matchModel.findByPk(id);
    if (!match) throw new NotFoundException('Match not found');
    
    const previousStatus = match.status;
    const { scheduled_at, ...data } = dto;
    
    const updateData: any = { ...data };
    if (scheduled_at) {
      updateData.match_date = new Date(scheduled_at);
    }

    await match.update(updateData);

    // If status changed to COMPLETED, update league standings
    if (previousStatus !== MatchStatus.COMPLETED && match.status === MatchStatus.COMPLETED) {
      await this.updateLeagueStandings(match);
    }

    // Publish update to Redis for real-time SSE
    await this.redis.publish(`match:${id}`, JSON.stringify({
      type: 'update',
      match: {
        id: match.id,
        home_score: match.home_score,
        away_score: match.away_score,
        status: match.status,
      },
    }));

    return match;
  }

  async addEvent(matchId: string, dto: MatchEventDto) {
    const match = await this.matchModel.findByPk(matchId);
    if (!match) throw new NotFoundException('Match not found');

    const event = await this.eventModel.create({
      ...dto,
      match_id: matchId,
    } as any);

    // If goal, update score
    if (dto.type === EventType.GOAL || dto.type === EventType.OWN_GOAL) {
      if (dto.type === EventType.GOAL) {
        if (dto.team_id === match.home_team_id) {
          await match.increment('home_score');
        } else if (dto.team_id === match.away_team_id) {
          await match.increment('away_score');
        }
      } else { // OWN_GOAL
        if (dto.team_id === match.home_team_id) {
          await match.increment('away_score');
        } else {
          await match.increment('home_score');
        }
      }
      
      // Re-fetch match to get updated scores for publishing
      await match.reload();
      await this.redis.publish(`match:${matchId}`, JSON.stringify({
        type: 'goal',
        event,
        match: {
          home_score: match.home_score,
          away_score: match.away_score,
        },
      }));
    }

    // Update player statistics if applicable
    if (dto.player_id && [EventType.GOAL, EventType.ASSIST, EventType.YELLOW_CARD, EventType.RED_CARD].includes(dto.type)) {
      await this.updatePlayerStats(match.league_id, dto.player_id, dto.type);
    }

    return event;
  }

  private async updatePlayerStats(leagueId: string, playerId: string, type: EventType) {
    const [stats] = await this.playerStatModel.findOrCreate({
      where: { league_id: leagueId, player_id: playerId },
    });

    const fieldMap: Partial<Record<EventType, string>> = {
      [EventType.GOAL]: 'goals',
      [EventType.ASSIST]: 'assists',
      [EventType.YELLOW_CARD]: 'yellow_cards',
      [EventType.RED_CARD]: 'red_cards',
    };

    const field = fieldMap[type];
    if (field) {
      await stats.increment(field);
    }
  }

  private async updateLeagueStandings(match: Match) {
    const { league_id, home_team_id, away_team_id, home_score, away_score } = match;

    const [homeStanding] = await this.standingModel.findOrCreate({
      where: { league_id, team_id: home_team_id },
    });
    const [awayStanding] = await this.standingModel.findOrCreate({
      where: { league_id, team_id: away_team_id },
    });

    // Update goals
    await homeStanding.increment({
      played: 1,
      goals_for: home_score,
      goals_against: away_score,
    });
    await awayStanding.increment({
      played: 1,
      goals_for: away_score,
      goals_against: home_score,
    });

    // Update win/draw/loss & points
    if (home_score > away_score) {
      await homeStanding.increment({ won: 1, points: 3 });
      await awayStanding.increment({ lost: 1 });
    } else if (home_score < away_score) {
      await awayStanding.increment({ won: 1, points: 3 });
      await homeStanding.increment({ lost: 1 });
    } else {
      await homeStanding.increment({ drawn: 1, points: 1 });
      await awayStanding.increment({ drawn: 1, points: 1 });
    }

    // Update goal difference (manual update as it's a computed field)
    await homeStanding.reload();
    await awayStanding.reload();
    await homeStanding.update({ goal_difference: homeStanding.goals_for - homeStanding.goals_against });
    await awayStanding.update({ goal_difference: awayStanding.goals_for - awayStanding.goals_against });
  }

  getLiveScoreStream(matchId: string): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      let redisSubscriber: Redis;

      const setup = async () => {
        const match = await this.matchModel.findByPk(matchId, {
          attributes: ['id', 'status', 'home_score', 'away_score'],
          include: [
            { model: Team, as: 'homeTeam', attributes: ['name'] },
            { model: Team, as: 'awayTeam', attributes: ['name'] },
          ],
        });

        if (!match) {
          subscriber.error(new NotFoundException('Match not found'));
          return;
        }

        subscriber.next({
          data: JSON.stringify({ type: 'init', match: match.toJSON() }),
          event: 'connected',
        } as MessageEvent);

        redisSubscriber = this.redis.duplicate();
        await redisSubscriber.subscribe(`match:${matchId}`);

        redisSubscriber.on('message', (channel: string, message: string) => {
          subscriber.next({
            data: message,
            event: 'score_update',
          } as MessageEvent);
        });

        const heartbeatInterval = setInterval(() => {
          subscriber.next({
            data: JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }),
            event: 'heartbeat',
          } as MessageEvent);
        }, 30000);

        return () => {
          clearInterval(heartbeatInterval);
          redisSubscriber?.unsubscribe(`match:${matchId}`);
          redisSubscriber?.disconnect();
        };
      };

      let cleanup: (() => void) | undefined;
      setup().then((fn) => { cleanup = fn; });

      return () => { cleanup?.(); };
    });
  }
}
