// src/modules/leagues/dto/update-league.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateLeagueDto } from './create-league.dto';

export class UpdateLeagueDto extends PartialType(CreateLeagueDto) {}
