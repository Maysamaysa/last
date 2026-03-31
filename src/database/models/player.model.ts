// src/database/models/player.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Team } from './team.model';
import { PlayerStat } from './player-stat.model';
import { MatchEvent } from './match-event.model';

export enum PlayerPosition {
  GK = 'GK',
  DEF = 'DEF',
  MID = 'MID',
  FWD = 'FWD',
}

@Table({
  tableName: 'players',
  timestamps: true,
  indexes: [
    { fields: ['team_id'] },
    { fields: ['position'] },
  ],
})
export class Player extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  @ApiProperty({ example: 'Chanathip Songkrasin' })
  name: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  @ApiProperty({ example: 18 })
  number: number;

  @Column({ type: DataType.ENUM(...Object.values(PlayerPosition)), allowNull: false })
  @ApiProperty({ enum: PlayerPosition, example: PlayerPosition.MID })
  position: PlayerPosition;

  @ForeignKey(() => Team)
  @Column({ type: DataType.UUID, allowNull: false })
  team_id: string;

  @BelongsTo(() => Team, 'team_id')
  team: Team;

  @HasMany(() => PlayerStat, 'player_id')
  stats: PlayerStat[];

  @HasMany(() => MatchEvent, 'player_id')
  events: MatchEvent[];
}
