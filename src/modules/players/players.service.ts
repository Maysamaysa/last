// src/modules/players/players.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Player } from '../../database/models/player.model';
import { Team } from '../../database/models/team.model';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { getPaginationOptions, buildPaginatedResponse } from '../../common/utils/pagination.util';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(Player) private playerModel: typeof Player,
  ) {}

  async create(dto: CreatePlayerDto) {
    return this.playerModel.create(dto as any);
  }

  async findAll(dto: PaginationDto, teamId?: string) {
    const where = teamId ? { team_id: teamId } : {};
    const { rows, count } = await this.playerModel.findAndCountAll({
      where,
      ...getPaginationOptions(dto),
      include: [{ model: Team, as: 'team', attributes: ['id', 'name'] }],
    });
    return buildPaginatedResponse(rows, count, dto);
  }

  async findOne(id: string) {
    const player = await this.playerModel.findByPk(id, {
      include: ['team', 'stats'],
    });
    if (!player) throw new NotFoundException('Player not found');
    return player;
  }

  async update(id: string, dto: UpdatePlayerDto) {
    const player = await this.findOne(id);
    return player.update(dto);
  }

  async remove(id: string) {
    const player = await this.findOne(id);
    await player.destroy();
    return { success: true };
  }
}
