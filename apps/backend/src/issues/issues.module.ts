import { Module } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { IssuesController } from './issues.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { DatabaseModule } from '../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [SupabaseModule, DatabaseModule, NotificationsModule],
  controllers: [IssuesController],
  providers: [IssuesService],
})
export class IssuesModule { }
