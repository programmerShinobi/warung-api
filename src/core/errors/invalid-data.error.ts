export class InvalidDataError extends Error {
  constructor(columnName: string, reason: string) {
    super(`Column ${columnName}*, ${reason}`);
    this.name = 'InvalidDataError';
  }
}

export class MessagesInvalidDataError extends Error {
  errors: { sheetName: string; invalidColumn: { [key: string]: string }[] }[];

  constructor(
    errors: { sheetName: string; invalidColumn: { [key: string]: string }[] }[],
  ) {
    const errorMessage = 'Invalid data in one or more sheets';
    super(errorMessage);
    this.name = 'MessagesInvalidDataError';
    this.errors = errors;
  }
}
