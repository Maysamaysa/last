// src/modules/me/me.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../database/models/user.model';
import { Team } from '../../database/models/team.model';

@Injectable()
export class MeService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userModel.findByPk(userId, {
      include: [
        { model: Team, as: 'team' },
      ],
      attributes: { exclude: ['password_hash'] },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
