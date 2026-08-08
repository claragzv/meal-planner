import { Injectable } from '@nestjs/common';

// Define que cosas se pueden hacer y el controller las usa
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
