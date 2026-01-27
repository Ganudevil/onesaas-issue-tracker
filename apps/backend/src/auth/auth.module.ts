import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        DatabaseModule
    ],
    providers: [JwtStrategy],
    exports: [PassportModule],
})
export class AuthModule { }
