
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.tenantId) {
            console.warn(`[TenantGuard] Access Denied. User or TenantID missing. User: ${user ? JSON.stringify(user) : 'UNDEFINED'}`);
            throw new ForbiddenException('Tenant ID is missing in context');
        }
        console.log(`[TenantGuard] Access Granted. Tenant: ${user.tenantId}`);

        return true;
    }
}
