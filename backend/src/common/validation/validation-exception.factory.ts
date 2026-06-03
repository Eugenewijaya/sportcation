import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export function createValidationException(errors: ValidationError[]) {
  return new BadRequestException({
    code: 'VALIDATION_ERROR',
    message: 'Request validation failed.',
    details: flattenValidationErrors(errors)
  });
}

function flattenValidationErrors(errors: ValidationError[], parentPath = ''): Array<{ field: string; messages: string[] }> {
  return errors.flatMap((error) => {
    const fieldPath = parentPath ? `${parentPath}.${error.property}` : error.property;
    const current = error.constraints
      ? [{
          field: fieldPath,
          messages: Object.values(error.constraints)
        }]
      : [];
    const children = error.children?.length
      ? flattenValidationErrors(error.children, fieldPath)
      : [];

    return [...current, ...children];
  });
}
