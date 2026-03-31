// src/common/utils/pagination.util.ts
import { PaginationDto } from '../dto/pagination.dto';

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function getPaginationOptions(dto: PaginationDto) {
  return {
    limit: dto.limit,
    offset: (dto.page - 1) * dto.limit,
  };
}

export function buildPaginatedResponse<T>(
  rows: T[],
  count: number,
  dto: PaginationDto,
): PaginatedResult<T> {
  const totalPages = Math.ceil(count / dto.limit);
  return {
    data: rows,
    pagination: {
      page: dto.page,
      limit: dto.limit,
      total: count,
      totalPages,
      hasNext: dto.page < totalPages,
      hasPrev: dto.page > 1,
    },
  };
}
