// src/database/models/team.model.ts
import { Table, Column, Model, DataType, Default, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { League } from './league.model';
import { User } from './user.model';
import { Player } from './player.model';
import { Match } from './match.model';

@Table({
  tableName: 'teams',
  timestamps: true,
  indexes: [
    { fields: ['league_id'] },
    { fields: ['manager_id'] },
  ],
})
export class Team extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  @ApiProperty({ example: 'Bangkok FC' })
  name: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/v1234567/logo.png' })
  logo_url: string;

  @ForeignKey(() => League)
  @Column({ type: DataType.UUID, allowNull: false })
  league_id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  manager_id: string;

  @BelongsTo(() => League, 'league_id')
  league: League;

  @BelongsTo(() => User, 'manager_id')
  manager: User;

  @HasMany(() => Player, 'team_id')
  players: Player[];

  @HasMany(() => Match, 'home_team_id')
  homeMatches: Match[];

  @HasMany(() => Match, 'away_team_id')
  awayMatches: Match[];
}
