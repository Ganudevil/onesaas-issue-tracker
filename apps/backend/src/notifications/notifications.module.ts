
import { Module } from '@nestjs/common';
import { NovuService } from './novu.service';

import { NotificationsController } from './notifications.controller';

@Module({
    controllers: [NotificationsController],
    providers: [NovuService],
    exports: [NovuService],
})
export class NotificationsModule { }
