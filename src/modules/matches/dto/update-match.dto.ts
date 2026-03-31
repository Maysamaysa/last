// src/modules/matches/dto/update-match.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateMatchDto } from './create-match.dto';

export class UpdateMatchDto extends PartialType(CreateMatchDto) {}
