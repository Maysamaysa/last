// src/modules/matches/matches.service.ts
import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { Match, MatchStatus } from '../../database/models/match.model';
import { Team } from '../../database/models/team.model';
import { MatchEvent } from '../../database/models/match-event.model';
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
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async create(dto: CreateMatchDto) {
    return this.matchModel.create(dto as any);
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
    
    await match.update(dto);

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
    if (dto.type === 'goal') {
      const player = await event.$get('player', { include: [Team] }) as any;
      if (player?.team_id === match.home_team_id) {
        await match.increment('home_score');
      } else if (player?.team_id === match.away_team_id) {
        await match.increment('away_score');
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

    return event;
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
