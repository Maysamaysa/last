// src/database/models/match.model.ts
import {
  Table, Column, Model, DataType, Default, ForeignKey,
  BelongsTo, HasMany,
} from 'sequelize-typescript';
import { League } from './league.model';
import { Team } from './team.model';
import { MatchEvent } from './match-event.model';

export enum MatchStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Table({
  tableName: 'matches',
  timestamps: true,
  indexes: [
    { fields: ['league_id'] },
    { fields: ['status'] },
    { fields: ['match_date'] },
    { fields: ['home_team_id', 'away_team_id'] },
  ],
  validate: {
    homeAndAwayDifferent() {
      if (this.home_team_id === this.away_team_id) {
        throw new Error('Home team and away team must be different');
      }
    },
    validScores() {
      if (this.home_score < 0 || this.away_score < 0) {
        throw new Error('Scores cannot be negative');
      }
    },
  },
})
export class Match extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id: string;

  @ForeignKey(() => League)
  @Column({ type: DataType.UUID, allowNull: false })
  league_id: string;

  @ForeignKey(() => Team)
  @Column({ type: DataType.UUID, allowNull: false })
  home_team_id: string;

  @ForeignKey(() => Team)
  @Column({ type: DataType.UUID, allowNull: false })
  away_team_id: string;

  @Column({ type: DataType.DATE, allowNull: false })
  match_date: Date;

  @Default(0)
  @Column({ type: DataType.INTEGER })
  home_score: number;

  @Default(0)
  @Column({ type: DataType.INTEGER })
  away_score: number;

  @Default(MatchStatus.SCHEDULED)
  @Column({ type: DataType.ENUM(...Object.values(MatchStatus)) })
  status: MatchStatus;

  @BelongsTo(() => League, 'league_id')
  league: League;

  @BelongsTo(() => Team, 'home_team_id')
  homeTeam: Team;

  @BelongsTo(() => Team, 'away_team_id')
  awayTeam: Team;

  @HasMany(() => MatchEvent, 'match_id')
  events: MatchEvent[];
}
