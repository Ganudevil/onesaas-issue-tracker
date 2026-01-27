import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [SupabaseModule, DatabaseModule],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
