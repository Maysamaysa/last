// src/modules/players/players.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { Player } from '../../database/models/player.model';
import { Team } from '../../database/models/team.model';

@Module({
  imports: [SequelizeModule.forFeature([Player, Team])],
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}
