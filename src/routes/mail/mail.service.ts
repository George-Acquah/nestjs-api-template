import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailtrapClient } from 'mailtrap';
import { mailtrapConfigKey } from 'src/shared/constants/mail.constants';
import {
  _IMailConfig,
  _IMailRecipient,
  _IMailSender
} from 'src/shared/interfaces/mail.interface';

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
  constructor(private readonly configService: ConfigService) {
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

  /**
   * sendTest Method
   *
   * Sends a test email to a predefined recipient using a specific email template.
   *
   * This method utilizes the Mailtrap API client to send an email with variables
   * injected into the template, providing a realistic test of the email sending functionality.
   */
  async sendTest() {
    // Define the recipient's email address.
    const recipient: _IMailRecipient = {
      email: this.RECIPIENT_EMAIL
    };

    // Use the MailtrapClient to send the email.
    this.client
      .send({
        from: this.sender, // Sender information
        to: [recipient], // Recipient list (currently a single recipient)
        template_uuid: '1c385f98-9854-410e-a06e-c0d114e51d1e', // UUID of the email template in Mailtrap
        template_variables: {
          user_name: 'Random Tests', // Example variable for the template
          verify_link: 'Test_Verify_link', // Example variable for the template
          get_started_link: 'Test_Get_started_link', // Example variable for the template
          onboarding_video_link: 'Test_Onboarding_video_link', // Example variable for the template
          next_step_link: 'Test_Next_step_link' // Example variable for the template
        }
      })
      .then(console.log, console.error); // Log the result or any error to the console.
  }
}
