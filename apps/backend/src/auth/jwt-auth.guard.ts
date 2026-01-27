import { Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest();
        console.log('🔍 Incoming Request Headers:', req.headers);
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any) {
        if (err || !user) {
            console.log('❌ JWT Auth Failed:', info);
            if (err) console.log('Error details:', err);
            const errorMsg = (info instanceof Error) ? info.message : (info ? JSON.stringify(info) : 'No Info Provided');
            throw new UnauthorizedException(`Debug Failure: ${errorMsg} | Err: ${err}`);
        }
        return user;
    }
}
