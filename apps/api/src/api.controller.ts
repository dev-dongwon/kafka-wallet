import { Controller, Get, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ApiService } from './api.service';

@Controller('api')
export class ApiController {
  constructor(
    private readonly apiService: ApiService,
    @Inject('WALLET_SERVICE') private readonly client: ClientKafka,
  ) {}

  @Get('hello')
  sayHello(): string {
    return this.apiService.sayHello();
  }

  @Get('kafka-test')
  testKafka() {
    return this.client.emit('medium.rocks', { foo: 'bar' });
  }
}
