import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class KeycloakAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(KeycloakAuthGuard.name);

    handleRequest(err: any, user: any, info: any) {
        if (err || !user) {
            this.logger.error(`Authentication Failed. Err: ${err}, Info: ${info}`);
            if (info && info.message) {
                this.logger.error(`JWT Error Message: ${info.message}`);
            }
            throw err || new UnauthorizedException();
        }
        return user;
    }
}
