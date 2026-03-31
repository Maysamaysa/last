// src/modules/players/dto/update-player.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreatePlayerDto } from './create-player.dto';

export class UpdatePlayerDto extends PartialType(CreatePlayerDto) {}
