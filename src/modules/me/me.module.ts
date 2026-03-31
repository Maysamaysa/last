// src/modules/me/me.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MeService } from './me.service';
import { MeController } from './me.controller';
import { User } from '../../database/models/user.model';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [MeController],
  providers: [MeService],
})
export class MeModule {}
