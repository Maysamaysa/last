// src/database/models/player-stat.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Player } from './player.model';
import { League } from './league.model';

@Table({
  tableName: 'player_stats',
  timestamps: true,
  indexes: [
    { fields: ['player_id'] },
    { fields: ['league_id'] },
  ],
})
export class PlayerStat extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @ForeignKey(() => Player)
  @Column({ type: DataType.UUID, allowNull: false })
  player_id: string;

  @ForeignKey(() => League)
  @Column({ type: DataType.UUID, allowNull: false })
  league_id: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  goals: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  assists: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  yellow_cards: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  red_cards: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  matches_played: number;

  @BelongsTo(() => Player, 'player_id')
  player: Player;

  @BelongsTo(() => League, 'league_id')
  league: League;
}
