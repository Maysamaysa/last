// src/modules/teams/teams.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { Team } from '../../database/models/team.model';
import { User } from '../../database/models/user.model';

@Module({
  imports: [SequelizeModule.forFeature([Team, User])],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
