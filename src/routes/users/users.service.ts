import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { _IDbUserImage } from 'src/shared/interfaces/images.interface';
import { _IDbProfile, _IDbUser } from 'src/shared/interfaces/users.interface';

@Injectable()
export class UsersService {
  private projectCreateFields = ['email', 'userType'];
  constructor(
    @InjectModel('User') private userModel: Model<_IDbUser>,
    @InjectModel('Profile') private profileModel: Model<_IDbProfile>,
    @InjectModel('UserImage') private userImageModel: Model<_IDbUserImage> // private readonly aggregationService: AggregationService,
  ) {}
  /* used by  modules to search user by email */
  async findUser(email: string): Promise<_IDbUser> {
    try {
      const user = await this.userModel.findOne({ email }).exec();

      if (!user) {
        throw new NotFoundException(`User with email ${email} does not exist.`);
      } else {
        return user;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
