// src/modules/leagues/leagues.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { League, LeagueStatus } from '../../database/models/league.model';
import { User } from '../../database/models/user.model';
import { CreateLeagueDto } from './dto/create-league.dto';
import { UpdateLeagueDto } from './dto/update-league.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { getPaginationOptions, buildPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class LeaguesService {
  constructor(
    @InjectModel(League) private leagueModel: typeof League,
  ) {}

  async create(dto: CreateLeagueDto, userId: string) {
    return this.leagueModel.create({
      ...dto,
      created_by: userId,
    } as any);
  }

  async findAll(dto: PaginationDto, status?: LeagueStatus) {
    const where = status ? { status } : {};
    const { rows, count } = await this.leagueModel.findAndCountAll({
      where,
      ...getPaginationOptions(dto),
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
    });
    return buildPaginatedResponse(rows, count, dto);
  }

  async findOne(id: string) {
    const league = await this.leagueModel.findByPk(id, {
      include: ['creator', 'teams'],
    });
    if (!league) throw new NotFoundException('League not found');
    return league;
  }

  async update(id: string, dto: UpdateLeagueDto) {
    const league = await this.findOne(id);
    return league.update(dto);
  }

  async remove(id: string) {
    const league = await this.findOne(id);
    await league.destroy();
    return { success: true };
  }
}
