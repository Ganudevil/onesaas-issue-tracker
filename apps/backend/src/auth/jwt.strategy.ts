import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly databaseService: DatabaseService) {
        super({
            secretOrKeyProvider: passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: process.env.KEYCLOAK_CERTS_URL || `${process.env.KEYCLOAK_URL || 'http://localhost:8080'}/realms/${process.env.KEYCLOAK_REALM || 'onesaas'}/protocol/openid-connect/certs`,
            }),

            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            // audience: process.env.KEYCLOAK_CLIENT_ID || 'issue-tracker', 
            issuer: process.env.KEYCLOAK_ISSUER_URL || `${process.env.KEYCLOAK_URL || 'http://localhost:8080'}/realms/${process.env.KEYCLOAK_REALM || 'onesaas'}`,
            algorithms: ['RS256'],
            ignoreExpiration: false,
            passReqToCallback: true, // Enable accessing request in validate
        });
    }

    private getSafeSchema(tenantId: string) {
        if (!tenantId) return 'public';
        if (tenantId === '11111111-1111-1111-1111-111111111111') return 'tenant1';
        if (!/^[a-z0-9_-]+$/i.test(tenantId)) return 'public';
        return tenantId;
    }

    async validate(req: any, payload: any) {
        const userId = payload.sub; // Keycloak User ID
        const tenantId = req.headers['x-tenant-id'];

        let role = 'viewer'; // Default

        if (tenantId) {
            const schema = this.getSafeSchema(tenantId);
            try {
                // Check RBAC using schema-based tenancy
                // We assume user ID in local DB matches Keycloak SUB (synced by frontend/auth flow)
                console.log(`[JwtStrategy] Checking role for ${userId} in ${schema}`);
                const result = await this.databaseService.query(
                    `SELECT role FROM "${schema}".users WHERE id = $1 AND deleted_at IS NULL`,
                    [userId]
                );

                if (result.rows.length > 0) {
                    role = result.rows[0].role;
                    console.log(`[JwtStrategy] User ${userId} found in ${schema}. Role: ${role}`);
                } else {
                    console.log(`[JwtStrategy] User ${userId} NOT found in ${schema}. Defaulting to viewer.`);
                    // OPTIONAL: Auto-create user here if we TRUST the token? No, let's debug first.
                }
            } catch (e) {
                console.error('[JwtStrategy] RBAC Check Failed', e);
            }
        } else {
            console.log(`[JwtStrategy] No x-tenant-id header. Defaulting to viewer.`);
        }

        console.log(`[JwtStrategy] Final Role Resolved: ${role}`);

        return { userId, tenantId, role, email: payload.email, name: payload.name };
    }
}
