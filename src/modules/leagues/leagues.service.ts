// src/modules/leagues/leagues.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { League, LeagueStatus } from '../../database/models/league.model';
import { User } from '../../database/models/user.model';
import { Team } from '../../database/models/team.model';
import { Player } from '../../database/models/player.model';
import { PlayerStat } from '../../database/models/player-stat.model';
import { LeagueStanding } from '../../database/models/league-standing.model';
import { CreateLeagueDto } from './dto/create-league.dto';
import { UpdateLeagueDto } from './dto/update-league.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { getPaginationOptions, buildPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class LeaguesService {
  constructor(
    @InjectModel(League) private readonly leagueModel: typeof League,
    @InjectModel(LeagueStanding) private readonly standingModel: typeof LeagueStanding,
    @InjectModel(PlayerStat) private readonly playerStatModel: typeof PlayerStat,
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

  async getStandings(leagueId: string) {
    await this.findOne(leagueId); // verify league exists
    return this.standingModel.findAll({
      where: { league_id: leagueId },
      include: [{ model: Team, as: 'team', attributes: ['name', 'logo_url'] }],
      order: [
        ['points', 'DESC'],
        ['goal_difference', 'DESC'],
        ['goals_for', 'DESC'],
      ],
    });
  }

  async getTopScorers(leagueId: string) {
    await this.findOne(leagueId); // verify league exists
    return this.playerStatModel.findAll({
      where: { league_id: leagueId },
      include: [
        { 
          model: Player, 
          as: 'player', 
          attributes: ['name'],
          include: [{ model: Team, as: 'team', attributes: ['name'] }]
        }
      ],
      order: [
        ['goals', 'DESC'],
        ['assists', 'DESC'],
      ],
      limit: 20,
    });
  }
}
