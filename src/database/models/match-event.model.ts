// src/database/models/match-event.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Match } from './match.model';
import { Player } from './player.model';
import { Team } from './team.model';

export enum EventType {
  GOAL = 'goal',
  ASSIST = 'assist',
  YELLOW_CARD = 'yellow_card',
  RED_CARD = 'red_card',
  OWN_GOAL = 'own_goal',
}

@Table({
  tableName: 'match_events',
  timestamps: true,
  indexes: [
    { fields: ['match_id'] },
    { fields: ['player_id'] },
    { fields: ['team_id'] },
  ],
})
export class MatchEvent extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @ForeignKey(() => Match)
  @Column({ type: DataType.UUID, allowNull: false })
  match_id: string;

  @ForeignKey(() => Team)
  @Column({ type: DataType.UUID, allowNull: false })
  team_id: string;

  @ForeignKey(() => Player)
  @Column({ type: DataType.UUID, allowNull: true })
  player_id: string;

  @Column({ type: DataType.ENUM(...Object.values(EventType)), allowNull: false })
  event_type: EventType;

  @Column({ type: DataType.INTEGER, allowNull: false })
  minute: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  commentary: string;

  @BelongsTo(() => Match, 'match_id')
  match: Match;

  @BelongsTo(() => Team, 'team_id')
  team: Team;

  @BelongsTo(() => Player, 'player_id')
  player: Player;
}
