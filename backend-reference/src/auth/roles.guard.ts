
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true; // No roles required
        }

        const { user } = context.switchToHttp().getRequest();

        // "Member = CRUD issues". "admin = users...". "Viewer = read-only"
        // Ideally we check if user.role is in requiredRoles
        // We should allow hierarchy: Admin > Member > Viewer

        if (!user || !user.role) return false;

        // Simple matching for now as per prompt "RBAC enforced at API layer"
        // "if (req.user.role === 'viewer' && req.method !== 'GET') throw Forbidden"

        // Check if the user's role is in the allowed roles
        const hasRole = requiredRoles.includes(user.role);
        if (!hasRole) {
            console.log(`[RolesGuard] Access Denied. User Role: ${user.role}, Required: ${JSON.stringify(requiredRoles)}`);
        }
        return hasRole;
    }
}
