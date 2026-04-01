// src/modules/teams/teams.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Team } from '../../database/models/team.model';
import { User, UserRole } from '../../database/models/user.model';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { getPaginationOptions, buildPaginatedResponse } from '../../common/utils/pagination.util';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team) private readonly teamModel: typeof Team,
  ) {}

  async create(dto: CreateTeamDto) {
    return this.teamModel.create(dto as any);
  }

  async findAll(dto: PaginationDto, leagueId?: string) {
    const where = leagueId ? { league_id: leagueId } : {};
    const { rows, count } = await this.teamModel.findAndCountAll({
      where,
      ...getPaginationOptions(dto),
      include: ['league', 'manager'],
    });
    return buildPaginatedResponse(rows, count, dto);
  }

  async findOne(id: string) {
    const team = await this.teamModel.findByPk(id, {
      include: ['league', 'manager', 'players'],
    });
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  async checkOwnership(teamId: string, user: any) {
    const team = await this.findOne(teamId);
    if (user.role !== UserRole.ADMIN && team.manager_id !== user.sub) {
      throw new ForbiddenException('You do not have permission to manage this team');
    }
    return team;
  }

  async uploadLogo(teamId: string, logoBuffer: Buffer, filename: string) {
    // This is a stub for Cloudinary/S3 integration
    // In a real app, you would upload to a storage service here
    const logoUrl = `https://storage.provider.com/logos/${filename}`;
    const team = await this.findOne(teamId);
    await team.update({ logo_url: logoUrl });
    return { logo_url: logoUrl };
  }

  async update(id: string, dto: UpdateTeamDto) {
    const team = await this.findOne(id);
    return team.update(dto);
  }

  async remove(id: string) {
    const team = await this.findOne(id);
    await team.destroy();
    return { success: true };
  }
}
