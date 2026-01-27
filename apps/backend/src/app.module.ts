import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from './supabase/supabase.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { IssuesModule } from './issues/issues.module';
import { ConfigModule } from '@nestjs/config';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    SupabaseModule,
    UsersModule,
    ConfigModule.forRoot(),
    IssuesModule,
    NotificationsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
