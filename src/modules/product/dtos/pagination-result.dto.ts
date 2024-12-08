class PaginationMetaDto {
  readonly totalItems: number;
  readonly currentPage: number;
  readonly itemsPerPage: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

export class PaginationResultDto<T> {
  data: T[];
  meta: PaginationMetaDto;
}
