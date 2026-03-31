// src/database/models/league-standing.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Default } from 'sequelize-typescript';
import { League } from './league.model';
import { Team } from './team.model';

@Table({
  tableName: 'league_standings',
  timestamps: true,
  indexes: [
    { fields: ['league_id'] },
    { fields: ['team_id'] },
    { fields: ['points', 'goal_difference'], order: ['DESC', 'DESC'] },
  ],
})
export class LeagueStanding extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id: string;

  @ForeignKey(() => League)
  @Column({ type: DataType.UUID, allowNull: false })
  league_id: string;

  @ForeignKey(() => Team)
  @Column({ type: DataType.UUID, allowNull: false })
  team_id: string;

  @Default(0)
  @Column({ type: DataType.INTEGER })
  played: number;

  @Default(0)
  @Column({ type: DataType.INTEGER })
  won: number;

  @Default(0)
  @Column({ type: DataType.INTEGER })
  drawn: number;

  @Default(0)
  @Column({ type: DataType.INTEGER })
  lost: number;

  @Default(0)
  @Column({ type: DataType.INTEGER })
  goals_for: number;

  @Default(0)
  @Column({ type: DataType.INTEGER })
  goals_against: number;

  @Default(0)
  @Column({ type: DataType.INTEGER })
  goal_difference: number;

  @Default(0)
  @Column({ type: DataType.INTEGER })
  points: number;

  @BelongsTo(() => League, 'league_id')
  league: League;

  @BelongsTo(() => Team, 'team_id')
  team: Team;
}
