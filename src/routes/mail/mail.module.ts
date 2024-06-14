import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { ConfigModule } from '@nestjs/config';
import { MailTrapConfig } from 'src/configs/mail.config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AccountVerification,
  AccountVerificationSchema
} from 'src/shared/schemas/account-verification.schema';

@Module({
  imports: [
    ConfigModule.forFeature(MailTrapConfig),
    MongooseModule.forFeature([
      {
        name: AccountVerification.name,
        schema: AccountVerificationSchema
      }
    ])
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {}
