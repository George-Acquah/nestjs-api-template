import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AggregationService } from 'src/shared/services/aggregation.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GCPStorageConfig } from 'src/configs/storage.config';
import { User, UserSchema } from 'src/shared/schemas/user.schema';
import { Profile, ProfileSchema } from 'src/shared/schemas/profile.schema';
import {
  UserImage,
  UserImageSchema
} from 'src/shared/schemas/user-image.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema
      },
      { name: Profile.name, schema: ProfileSchema },
      { name: UserImage.name, schema: UserImageSchema }
    ]),
    ConfigModule.forFeature(GCPStorageConfig)
  ],
  controllers: [UsersController],
  providers: [UsersService, AggregationService],
  exports: [UsersService]
})
export class UsersModule {}
