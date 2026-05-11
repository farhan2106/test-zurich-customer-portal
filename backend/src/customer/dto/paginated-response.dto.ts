export class PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: PaginationMeta;
}
