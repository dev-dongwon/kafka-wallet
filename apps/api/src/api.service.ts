import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiService {
  constructor() {}

  sayHello() {
    return 'hello';
  }
}
