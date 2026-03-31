// src/modules/matches/matches.service.ts
import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { Match, MatchStatus } from '../../database/models/match.model';
import { Team } from '../../database/models/team.model';
import { Redis } from 'ioredis';

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(Match) private matchModel: typeof Match,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

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
