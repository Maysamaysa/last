// src/modules/leagues/leagues.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LeaguesService } from './leagues.service';
import { LeaguesController } from './leagues.controller';
import { League } from '../../database/models/league.model';
import { PlayerStat } from '../../database/models/player-stat.model';
import { LeagueStanding } from '../../database/models/league-standing.model';
import { User } from '../../database/models/user.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      League,
      User,
      PlayerStat,
      LeagueStanding,
    ]),
  ],
  controllers: [LeaguesController],
  providers: [LeaguesService],
  exports: [LeaguesService],
})
export class LeaguesModule {}
