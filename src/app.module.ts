import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './routes/auth/auth.module';
import { UsersModule } from './routes/users/users.module';
import { RootMongooseModule } from './modules/mongo.module';
import { MailModule } from './routes/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    RootMongooseModule,
    AuthModule,
    UsersModule,
    MailModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
