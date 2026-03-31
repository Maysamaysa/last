// src/database/models/league.model.ts
import { Table, Column, Model, DataType, Default, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.model';
import { Team } from './team.model';
import { Match } from './match.model';
import { LeagueStanding } from './league-standing.model';

export enum LeagueStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

@Table({
  tableName: 'leagues',
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['created_by'] },
    { fields: ['status', 'created_at'] },
  ],
})
export class League extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id: string;

  @Column({ type: DataType.STRING(200), allowNull: false })
  @ApiProperty({ example: 'Bangkok Premier League' })
  name: string;

  @Column({ type: DataType.STRING(20), allowNull: false })
  @ApiProperty({ example: '2025' })
  season: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  created_by: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  start_date: Date;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  end_date: Date;

  @Default(LeagueStatus.DRAFT)
  @Column({ type: DataType.ENUM(...Object.values(LeagueStatus)) })
  status: LeagueStatus;

  @BelongsTo(() => User, 'created_by')
  creator: User;

  @HasMany(() => Team, 'league_id')
  teams: Team[];

  @HasMany(() => Match, 'league_id')
  matches: Match[];

  @HasMany(() => LeagueStanding, 'league_id')
  standings: LeagueStanding[];
}
