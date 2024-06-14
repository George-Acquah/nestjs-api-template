import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { MailtrapClient } from 'mailtrap';
import { Model } from 'mongoose';
import { mailtrapConfigKey } from 'src/shared/constants/mail.constants';
import {
  _IMailConfig,
  _IMailRecipient,
  _IMailSender
} from 'src/shared/interfaces/mail.interface';
import { _IDbAccountVerification } from 'src/shared/interfaces/users.interface';

/**
 * MailService Class
 *
 * This service handles email sending using Mailtrap. It is configured with the necessary
 * Mailtrap credentials and settings, which are fetched from the application's configuration.
 *
 * @class
 
 * Example Usage:
 *
 * To use this service in your application:
 *
 * 1. Import and include `MailService` in the providers array of your module.
 * 2. Inject the `MailService` into your controller or another service.
 * 3. Call `sendTest` or other methods as needed to send emails.
 *
 * Example:
 *
 * import { MailService } from 'src/mail/mail.service';
 *
 * @Controller('notification')
 * export class NotificationController {
 *   constructor(private readonly mailService: MailService) {}
 *
 *   @Get ('send-test-email')
 *   sendTestEmail() {
 * 
 *     return this.mailService.sendTest();
 * 
 *   }
 * }
 */

@Injectable()
export class MailService {
  private client: MailtrapClient;
  private sender: _IMailSender;
  private MAIL_TOKEN: string;
  private TEST_INBOX_ID: number;
  private ACCOUNT_ID: number;
  private SENDER_EMAIL: string;
  private SENDER_NAME: string;
  private RECIPIENT_EMAIL: string;

  /**
   * Constructor
   *
   * @param {ConfigService} configService - Service to access environment-specific configuration.
   */
  constructor(
    @InjectModel('AccountVerification')
    private accountVerificationModel: Model<_IDbAccountVerification>,
    private readonly configService: ConfigService
  ) {
    // Extract Mailtrap configuration from the environment variables using the ConfigService.
    const {
      token,
      sender_email,
      sender_name,
      recipient_email,
      test_id,
      account_id
    } = this.configService.get<_IMailConfig>(mailtrapConfigKey);

    // Initialize class properties with the extracted configuration values.
    this.RECIPIENT_EMAIL = recipient_email;
    this.SENDER_EMAIL = sender_email;
    this.SENDER_NAME = sender_name;
    this.MAIL_TOKEN = token;
    this.ACCOUNT_ID = account_id;
    this.TEST_INBOX_ID = test_id;

    // Create a new instance of the MailtrapClient with the provided credentials and settings.
    this.client = new MailtrapClient({
      token: this.MAIL_TOKEN,
      testInboxId: this.TEST_INBOX_ID,
      accountId: this.ACCOUNT_ID
    });

    // Define the sender's email and name to be used in the 'from' field of the emails.
    this.sender = {
      email: this.SENDER_EMAIL,
      name: this.SENDER_NAME
    };
  }

  async findAccountVerificationRecord(token: string, email: string) {
    return await this.accountVerificationModel.findOne({
      verification_token: token,
      email
    });
  }

  async deleteAccountVerificationRecord(_id: any) {
    await this.accountVerificationModel.deleteOne({
      _id
    });
  }

  /**
   * verifyAccountToken Method
   *
   * Sends an account verification email to the specified recipient using a predefined email template.
   *
   * This method uses the Mailtrap API client to send an email with dynamically injected variables,
   * which are used to personalize the email content for the recipient.
   *
   * @param email - The recipient's email address.
   * @param userName - The name of the user to be included in the email.
   * @param verificationLink - The unique link for the user to verify their account.
   */
  async verifyAccountToken(email: string, userName: string) {
    try {
      // Generate a secure verification token
      const verificationToken = randomBytes(16).toString('hex');

      // Save the verification token and email to the AccountVerification collection
      const accountVerification = new this.accountVerificationModel({
        verificationToken,
        email
      });
      await accountVerification.save();

      // Construct the verification link
      const verificationLink = `https://yourapp.com/verify?token=${verificationToken}`;

      // Define the recipient's email address
      const recipient: _IMailRecipient = {
        email: email
      };

      // Send the email using the MailtrapClient
      const response = await this.client.send({
        from: this.sender, // Sender information, e.g., { email: 'no-reply@example.com', name: 'Your App' }
        to: [recipient], // Recipient list, currently sending to the single recipient defined above
        template_uuid: '1c385f98-9854-410e-a06e-c0d114e51d1e', // UUID of the email template in Mailtrap
        template_variables: {
          user_name: userName, // Inject the dynamic user name into the template
          verify_link: verificationLink, // Inject the dynamic verification link into the template
          get_started_link: 'https://yourapp.com/get-started', // Static example link for getting started
          onboarding_video_link: 'https://yourapp.com/onboarding', // Static example link for an onboarding video
          next_step_link: 'https://yourapp.com/next-steps' // Static example link for the next steps
        }
      });

      console.log('Email sent successfully:', response); // Log success message
      return {
        message: 'Verification email sent successfully.',
        verificationToken: verificationToken // Optionally return the token for further use or logging
      };
    } catch (error) {
      console.error('Error in verifyAccountToken:', error); // Log any errors that occur
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }
}
