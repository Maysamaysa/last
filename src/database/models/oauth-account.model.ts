// src/database/models/oauth-account.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';

@Table({
  tableName: 'oauth_accounts',
  timestamps: true,
  indexes: [
    { fields: ['provider', 'provider_account_id'], unique: true },
    { fields: ['user_id'] },
  ],
})
export class OauthAccount extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  user_id: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  provider: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  provider_account_id: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  access_token: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  refresh_token: string;

  @BelongsTo(() => User, 'user_id')
  user: User;
}
