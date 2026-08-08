import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

// El Controller recibe la petición y decide que hacer con ella
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
