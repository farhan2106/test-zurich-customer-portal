import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RoleMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RoleMiddleware.name);

  use(req: Request, _res: Response, next: NextFunction) {
    const user = req.user;
    const { method, originalUrl } = req;

    if (user) {
      this.logger.log(`[${method}] ${originalUrl} — user=${user.sub} role=${user.role}`);
    } else {
      this.logger.log(`[${method}] ${originalUrl} — unauthenticated`);
    }

    next();
  }
}
