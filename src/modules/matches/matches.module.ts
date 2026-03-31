// src/modules/matches/matches.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { Match } from '../../database/models/match.model';
import { Team } from '../../database/models/team.model';
import { PlayerStat } from '../../database/models/player-stat.model';
import { MatchEvent } from '../../database/models/match-event.model';
import { LeagueStanding } from '../../database/models/league-standing.model';
import Redis from 'ioredis';

@Module({
  imports: [
    SequelizeModule.forFeature([Match, Team, MatchEvent, PlayerStat, LeagueStanding]),
    ConfigModule,
  ],
  controllers: [MatchesController],
  providers: [
    MatchesService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: (config: ConfigService) => {
        return new Redis({
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          password: config.get('REDIS_PASSWORD'),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [MatchesService],
})
export class MatchesModule {}
