// src/database/models/user.model.ts
import {
  Table, Column, Model, DataType, Default, Unique,
  HasMany, HasOne, BeforeCreate, BeforeUpdate,
} from 'sequelize-typescript';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OauthAccount } from './oauth-account.model';
import { Team } from './team.model';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  PLAYER = 'player',
  VIEWER = 'viewer',
}

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: false,
  indexes: [
    { fields: ['email'] },
    { fields: ['role'] },
  ],
})
export class User extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  @ApiProperty({ example: 'Somchai Jaidee' })
  name: string;

  @Unique
  @Column({ type: DataType.STRING(255), allowNull: false })
  @ApiProperty({ example: 'somchai@example.com' })
  email: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  @Exclude()
  password_hash: string;

  @Default(UserRole.VIEWER)
  @Column({ type: DataType.ENUM(...Object.values(UserRole)), allowNull: false })
  @ApiProperty({ enum: UserRole, example: UserRole.VIEWER })
  role: UserRole;

  @Default(true)
  @Column({ type: DataType.BOOLEAN })
  is_active: boolean;

  @HasMany(() => OauthAccount, 'user_id')
  oauthAccounts: OauthAccount[];

  @HasOne(() => Team, 'manager_id')
  team: Team;

  @BeforeCreate
  @BeforeUpdate
  static async validateNoPlainPassword(user: User) {
    if (user.changed('password_hash') && user.password_hash) {
      if (!user.password_hash.startsWith('$argon2')) {
        throw new Error('Password must be hashed with Argon2id before saving');
      }
    }
  }
}
