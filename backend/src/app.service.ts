import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot() {
    return {
      name: 'AI Interviewer Backend',
      status: 'ok',
    };
  }
}
