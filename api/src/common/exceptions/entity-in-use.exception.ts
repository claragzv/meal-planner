import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception.js';

export type DependencyReference = {
  type: string;
  id: string;
  name: string;
};

export class EntityInUseException extends AppException {
  constructor(entityType: string, id: string, name: string, dependencies: DependencyReference[]) {
    super(
      HttpStatus.CONFLICT,
      'ENTITY_IN_USE',
      `Cannot delete ${entityType} "${name}" because it is still used by other records.`,
      { entityType, id, dependencies },
    );
  }
}
