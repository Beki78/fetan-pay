import 'dotenv/config';
import { PrismaClient, EmailTemplateCategory } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const datasourceUrl = process.env.DATABASE_URL;
if (!datasourceUrl) {
  throw new Error('DATABASE_URL is not set for Prisma connection');
}

const adapter = new PrismaPg(new pg.Pool({ connectionString: datasourceUrl }));
const prisma = new PrismaClient({ adapter });

async function seedNotificationTemplates() {
  console.log('Seeding notification email templates...');

  const templates = [
    {
      name: 'merchant-registration',
      category: 'NOTIFICATION' as EmailTemplateCategory,
      subject: 'New Merchant Registration - {{merchantName}}',
      content: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto;">
          <div style="background: #5CFFCE; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; color: #0f172a; font-size: 24px;">New Merchant Registration</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e293b; margin-top: 0;">Hello Admin,</h2>
            
            <p style="margin: 16px 0;">A new merchant has registered on FetanPay and is awaiting approval:</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 12px 0; color: #374151;">Merchant Details:</h3>
              <p style="margin: 4px 0;"><strong>Name:</strong> {{merchantName}}</p>
              <p style="margin: 4px 0;"><strong>ID:</strong> {{merchantId}}</p>
            </div>
            
            <p style="margin: 16px 0;">Please review the merchant application and take appropriate action.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
              This is an automated notification from FetanPay Admin System.
            </p>
          </div>
        </div>
      `,
      variables: ['merchantName', 'merchantId'],
      isSystem: true,
    },
    {
      name: 'merchant-approval',
      category: 'APPROVAL' as EmailTemplateCategory,
      subject:
        'Congratulations! Your FetanPay merchant account has been approved',
      content: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto;">
          <div style="background: #10B981; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; color: white; font-size: 24px;">🎉 Account Approved!</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e293b; margin-top: 0;">Congratulations {{merchantName}}!</h2>
            
            <p style="margin: 16px 0;">Great news! Your FetanPay merchant account has been approved and is now active.</p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
              <h3 style="margin: 0 0 12px 0; color: #166534;">What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #166534;">
                <li>Access your merchant dashboard</li>
                <li>Configure your payment providers</li>
                <li>Set up your team members</li>
                <li>Start accepting payments</li>
              </ul>
            </div>
            
            <p style="margin: 16px 0;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
              Welcome to FetanPay! We're excited to have you on board.
            </p>
          </div>
        </div>
      `,
      variables: ['merchantName'],
      isSystem: true,
    },
    {
      name: 'merchant-rejection',
      category: 'NOTIFICATION' as EmailTemplateCategory,
      subject: 'FetanPay Merchant Application Update',
      content: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto;">
          <div style="background: #EF4444; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; color: white; font-size: 24px;">Application Update</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e293b; margin-top: 0;">Hello {{merchantName}},</h2>
            
            <p style="margin: 16px 0;">Thank you for your interest in FetanPay. After reviewing your merchant application, we need to discuss some details before we can proceed with approval.</p>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
              <h3 style="margin: 0 0 12px 0; color: #991b1b;">Reason for Review:</h3>
              <p style="margin: 0; color: #991b1b;">{{reason}}</p>
            </div>
            
            <p style="margin: 16px 0;">We appreciate your understanding and look forward to working with you once any concerns are addressed.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
              This is an automated notification from FetanPay.
            </p>
          </div>
        </div>
      `,
      variables: ['merchantName', 'reason'],
      isSystem: true,
    },
    {
      name: 'merchant-banned',
      category: 'NOTIFICATION' as EmailTemplateCategory,
      subject: 'FetanPay Merchant Account Suspended',
      content: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto;">
          <div style="background: #DC2626; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; color: white; font-size: 24px;">Account Suspended</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e293b; margin-top: 0;">Hello {{merchantName}},</h2>
            
            <p style="margin: 16px 0;">We regret to inform you that your FetanPay merchant account has been suspended.</p>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DC2626;">
              <h3 style="margin: 0 0 12px 0; color: #991b1b;">Reason for Suspension:</h3>
              <p style="margin: 0; color: #991b1b;">{{reason}}</p>
            </div>
            
            <p style="margin: 16px 0;">If you believe this is an error or would like to appeal this decision, please contact our support team immediately.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
              This is an automated notification from FetanPay.
            </p>
          </div>
        </div>
      `,
      variables: ['merchantName', 'reason'],
      isSystem: true,
    },
    {
      name: 'merchant-unbanned',
      category: 'APPROVAL' as EmailTemplateCategory,
      subject: 'FetanPay Merchant Account Reactivated',
      content: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto;">
          <div style="background: #059669; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; color: white; font-size: 24px;">🎉 Account Reactivated!</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e293b; margin-top: 0;">Great news {{merchantName}}!</h2>
            
            <p style="margin: 16px 0;">Your FetanPay merchant account has been reactivated and is now available for use.</p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
              <h3 style="margin: 0 0 12px 0; color: #166534;">You can now:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #166534;">
                <li>Access your merchant dashboard</li>
                <li>Process payments</li>
                <li>Manage your team</li>
                <li>Use all FetanPay features</li>
              </ul>
            </div>
            
            <p style="margin: 16px 0;">Thank you for your patience. We're glad to have you back!</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
              Welcome back to FetanPay!
            </p>
          </div>
        </div>
      `,
      variables: ['merchantName'],
      isSystem: true,
    },
    {
      name: 'wallet-deposit-verified-merchant',
      category: 'NOTIFICATION' as EmailTemplateCategory,
      subject: 'Wallet Deposit Confirmed - {{amount}} ETB',
      content: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto;">
          <div style="background: #10B981; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; color: white; font-size: 24px;">💰 Deposit Confirmed!</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e293b; margin-top: 0;">Hello {{merchantName}},</h2>
            
            <p style="margin: 16px 0;">Great news! Your wallet deposit has been successfully verified and added to your account.</p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
              <h3 style="margin: 0 0 12px 0; color: #166534;">Deposit Details:</h3>
              <p style="margin: 4px 0; color: #166534;"><strong>Amount:</strong> {{amount}} ETB</p>
              <p style="margin: 4px 0; color: #166534;"><strong>Provider:</strong> {{provider}}</p>
              <p style="margin: 4px 0; color: #166534;"><strong>Reference:</strong> {{reference}}</p>
              <p style="margin: 4px 0; color: #166534;"><strong>New Balance:</strong> {{newBalance}} ETB</p>
            </div>
            
            <p style="margin: 16px 0;">Your wallet is now ready for payment processing. You can view your transaction history in your merchant dashboard.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
              This is an automated notification from FetanPay.
            </p>
          </div>
        </div>
      `,
      variables: [
        'merchantName',
        'amount',
        'provider',
        'reference',
        'newBalance',
      ],
      isSystem: true,
    },
    {
      name: 'wallet-deposit-verified-admin',
      category: 'NOTIFICATION' as EmailTemplateCategory,
      subject: 'Merchant Wallet Deposit - {{merchantName}} - {{amount}} ETB',
      content: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto;">
          <div style="background: #3B82F6; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; color: white; font-size: 24px;">💰 Merchant Deposit</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e293b; margin-top: 0;">Hello Admin,</h2>
            
            <p style="margin: 16px 0;">A merchant has successfully deposited funds to their wallet.</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 12px 0; color: #374151;">Deposit Details:</h3>
              <p style="margin: 4px 0;"><strong>Merchant:</strong> {{merchantName}}</p>
              <p style="margin: 4px 0;"><strong>Amount:</strong> {{amount}} ETB</p>
              <p style="margin: 4px 0;"><strong>Provider:</strong> {{provider}}</p>
              <p style="margin: 4px 0;"><strong>Reference:</strong> {{reference}}</p>
              <p style="margin: 4px 0;"><strong>New Balance:</strong> {{newBalance}} ETB</p>
              <p style="margin: 4px 0;"><strong>Merchant ID:</strong> {{merchantId}}</p>
            </div>
            
            <p style="margin: 16px 0;">This deposit has been automatically verified and added to the merchant's wallet balance.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
              This is an automated notification from FetanPay Admin System.
            </p>
          </div>
        </div>
      `,
      variables: [
        'merchantName',
        'merchantId',
        'amount',
        'provider',
        'reference',
        'newBalance',
      ],
      isSystem: true,
    },
    {
      name: 'branding-updated',
      category: 'NOTIFICATION' as EmailTemplateCategory,
      subject: 'Branding Updated Successfully - {{merchantName}}',
      content: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto;">
          <div style="background: #8B5CF6; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; color: white; font-size: 24px;">🎨 Branding Updated!</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e293b; margin-top: 0;">Hello {{merchantName}},</h2>
            
            <p style="margin: 16px 0;">Your merchant branding has been successfully updated! Your new branding settings are now active across all payment pages and customer-facing interfaces.</p>
            
            <div style="background: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B5CF6;">
              <h3 style="margin: 0 0 12px 0; color: #6B21A8;">What was updated:</h3>
              <p style="margin: 0; color: #6B21A8;">{{updatedElements}}</p>
            </div>
            
            <p style="margin: 16px 0;">Your customers will now see your updated branding when making payments. You can preview your branding in the merchant dashboard or make additional changes anytime.</p>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>💡 Tip:</strong> It may take a few minutes for your branding changes to appear across all payment pages.
              </p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
              This is an automated notification from FetanPay.
            </p>
          </div>
        </div>
      `,
      variables: ['merchantName', 'updatedElements'],
      isSystem: true,
    },
    {
      name: 'ip-address-disabled',
      category: 'NOTIFICATION' as EmailTemplateCategory,
      subject: 'IP Address Disabled - Security Alert',
      content: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto;">
          <div style="background: #EF4444; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; color: white; font-size: 24px;">🔒 IP Address Disabled</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e293b; margin-top: 0;">Hello {{merchantName}},</h2>
            
            <p style="margin: 16px 0;">We're writing to inform you that one of your whitelisted IP addresses has been disabled by our administrators.</p>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
              <h3 style="margin: 0 0 12px 0; color: #991b1b;">Disabled IP Address:</h3>
              <p style="margin: 4px 0; color: #991b1b; font-family: monospace; font-size: 16px; font-weight: bold;">{{ipAddress}}</p>
              <h3 style="margin: 16px 0 8px 0; color: #991b1b;">Reason:</h3>
              <p style="margin: 0; color: #991b1b;">{{reason}}</p>
            </div>
            
            <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
              <h3 style="margin: 0 0 12px 0; color: #92400e;">⚠️ Important:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                <li>API requests from this IP address will now be blocked</li>
                <li>This may affect your payment processing if you're using this IP</li>
                <li>Other whitelisted IP addresses remain active</li>
              </ul>
            </div>
            
            <p style="margin: 16px 0;">If you believe this is an error or need to restore access from this IP address, please contact our support team immediately.</p>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>💡 Need Help?</strong> You can view and manage your IP addresses in your merchant dashboard under Security Settings.
              </p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
              This is an automated security notification from FetanPay.
            </p>
          </div>
        </div>
      `,
      variables: ['merchantName', 'ipAddress', 'reason'],
      isSystem: true,
    },
    {
      name: 'ip-address-enabled',
      category: 'NOTIFICATION' as EmailTemplateCategory,
      subject: 'IP Address Enabled - Access Restored',
      content: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto;">
          <div style="background: #10B981; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; color: white; font-size: 24px;">🔓 IP Address Enabled</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e293b; margin-top: 0;">Hello {{merchantName}},</h2>
            
            <p style="margin: 16px 0;">Good news! One of your IP addresses has been enabled by our administrators and is now active for API access.</p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
              <h3 style="margin: 0 0 12px 0; color: #166534;">Enabled IP Address:</h3>
              <p style="margin: 4px 0; color: #166534; font-family: monospace; font-size: 16px; font-weight: bold;">{{ipAddress}}</p>
            </div>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6;">
              <h3 style="margin: 0 0 12px 0; color: #1e40af;">✅ What this means:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
                <li>You can now make API requests from this IP address</li>
                <li>Payment processing from this IP is fully restored</li>
                <li>All FetanPay API endpoints are accessible</li>
              </ul>
            </div>
            
            <p style="margin: 16px 0;">Your API access from this IP address is now fully functional. You can resume normal operations immediately.</p>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #64748b;">
              <p style="margin: 0; color: #475569; font-size: 14px;">
                <strong>💡 Reminder:</strong> You can view and manage all your IP addresses in your merchant dashboard under Security Settings.
              </p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
              This is an automated notification from FetanPay.
            </p>
          </div>
        </div>
      `,
      variables: ['merchantName', 'ipAddress'],
      isSystem: true,
    },
    {
      name: 'subscription-expiring-soon-merchant',
      category: 'NOTIFICATION' as EmailTemplateCategory,
      subject:
        'Subscription Expiring Soon - {{planName}} - {{daysLeft}} Days Left',
      content: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto;">
          <div style="background: #F59E0B; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; color: white; font-size: 24px;">⏰ Subscription Expiring Soon</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e293b; margin-top: 0;">Hello {{merchantName}},</h2>
            
            <p style="margin: 16px 0;">Your <strong>{{planName}}</strong> subscription will expire in <strong>{{daysLeft}} days</strong> on {{expirationDate}}.</p>
            
            <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
              <h3 style="margin: 0 0 12px 0; color: #92400e;">⚠️ Action Required:</h3>
              <p style="margin: 0; color: #92400e;">To continue using premium features without interruption, please renew your subscription before it expires.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{billingUrl}}" style="background: #F59E0B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Renew Subscription
              </a>
            </div>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>💡 Need Help?</strong> Contact our support team if you have any questions about your subscription or renewal process.
              </p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
              This is an automated notification from FetanPay.
            </p>
          </div>
        </div>
      `,
      variables: [
        'merchantName',
        'planName',
        'expirationDate',
        'daysLeft',
        'billingUrl',
      ],
      isSystem: true,
    },
    {
      name: 'subscription-expired-merchant',
      category: 'NOTIFICATION' as EmailTemplateCategory,
      subject: 'Subscription Expired - {{planName}} - Action Required',
      content: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto;">
          <div style="background: #EF4444; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; color: white; font-size: 24px;">🚨 Subscription Expired</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e293b; margin-top: 0;">Hello {{merchantName}},</h2>
            
            <p style="margin: 16px 0;">Your <strong>{{planName}}</strong> subscription has expired on {{expiredDate}}.</p>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
              <h3 style="margin: 0 0 12px 0; color: #991b1b;">🔒 Limited Access:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #991b1b;">
                <li>Premium features are now disabled</li>
                <li>Your account has been downgraded to the free plan</li>
                <li>Some functionality may be restricted</li>
              </ul>
            </div>
            
            <p style="margin: 16px 0;">To restore full access to premium features, please renew your subscription.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{billingUrl}}" style="background: #EF4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Renew Now
              </a>
            </div>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>💡 Questions?</strong> Our support team is here to help you with the renewal process or answer any questions about your account.
              </p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
              This is an automated notification from FetanPay.
            </p>
          </div>
        </div>
      `,
      variables: ['merchantName', 'planName', 'expiredDate', 'billingUrl'],
      isSystem: true,
    },
    {
      name: 'subscription-expiring-soon-admin',
      category: 'NOTIFICATION' as EmailTemplateCategory,
      subject:
        'Merchant Subscription Expiring - {{merchantName}} - {{planName}}',
      content: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto;">
          <div style="background: #F59E0B; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; color: white; font-size: 24px;">⏰ Merchant Subscription Expiring</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e293b; margin-top: 0;">Hello Admin,</h2>
            
            <p style="margin: 16px 0;">A merchant's subscription is expiring soon and may require follow-up.</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 12px 0; color: #374151;">Merchant Details:</h3>
              <p style="margin: 4px 0;"><strong>Merchant:</strong> {{merchantName}}</p>
              <p style="margin: 4px 0;"><strong>Merchant ID:</strong> {{merchantId}}</p>
              <p style="margin: 4px 0;"><strong>Plan:</strong> {{planName}}</p>
              <p style="margin: 4px 0;"><strong>Expiration Date:</strong> {{expirationDate}}</p>
              <p style="margin: 4px 0;"><strong>Days Left:</strong> {{daysLeft}}</p>
            </div>
            
            <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
              <h3 style="margin: 0 0 12px 0; color: #92400e;">📞 Suggested Actions:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                <li>Contact the merchant to discuss renewal</li>
                <li>Offer assistance with the renewal process</li>
                <li>Check if they need plan adjustments</li>
                <li>Provide support for any billing questions</li>
              </ul>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
              This is an automated notification from FetanPay Admin System.
            </p>
          </div>
        </div>
      `,
      variables: [
        'merchantName',
        'merchantId',
        'planName',
        'expirationDate',
        'daysLeft',
      ],
      isSystem: true,
    },
    {
      name: 'subscription-expired-admin',
      category: 'NOTIFICATION' as EmailTemplateCategory,
      subject:
        'Merchant Subscription Expired - {{merchantName}} - {{planName}}',
      content: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto;">
          <div style="background: #EF4444; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; color: white; font-size: 24px;">🚨 Merchant Subscription Expired</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e293b; margin-top: 0;">Hello Admin,</h2>
            
            <p style="margin: 16px 0;">A merchant's subscription has expired and they have been downgraded to the free plan.</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 12px 0; color: #374151;">Merchant Details:</h3>
              <p style="margin: 4px 0;"><strong>Merchant:</strong> {{merchantName}}</p>
              <p style="margin: 4px 0;"><strong>Merchant ID:</strong> {{merchantId}}</p>
              <p style="margin: 4px 0;"><strong>Expired Plan:</strong> {{planName}}</p>
              <p style="margin: 4px 0;"><strong>Expired Date:</strong> {{expiredDate}}</p>
            </div>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
              <h3 style="margin: 0 0 12px 0; color: #991b1b;">📞 Immediate Actions Required:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #991b1b;">
                <li>Contact the merchant immediately</li>
                <li>Discuss renewal options and pricing</li>
                <li>Assist with reactivation if needed</li>
                <li>Monitor for any service disruptions</li>
              </ul>
            </div>
            
            <p style="margin: 16px 0;">The merchant's account is now on the free plan with limited features. Please reach out to help them restore their premium subscription.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
              This is an automated notification from FetanPay Admin System.
            </p>
          </div>
        </div>
      `,
      variables: ['merchantName', 'merchantId', 'planName', 'expiredDate'],
      isSystem: true,
    },
    {
      name: 'subscription-renewed-merchant',
      category: 'APPROVAL' as EmailTemplateCategory,
      subject: 'Subscription Activated - {{planName}} - Welcome Back!',
      content: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto;">
          <div style="background: #10B981; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; color: white; font-size: 24px;">🎉 Subscription Activated!</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e293b; margin-top: 0;">Great news {{merchantName}}!</h2>
            
            <p style="margin: 16px 0;">Your <strong>{{planName}}</strong> subscription has been successfully activated.</p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
              <h3 style="margin: 0 0 12px 0; color: #166534;">📋 Subscription Details:</h3>
              <p style="margin: 4px 0; color: #166534;"><strong>Plan:</strong> {{planName}}</p>
              <p style="margin: 4px 0; color: #166534;"><strong>Start Date:</strong> {{startDate}}</p>
              <p style="margin: 4px 0; color: #166534;"><strong>Valid Until:</strong> {{endDate}}</p>
              <p style="margin: 4px 0; color: #166534;"><strong>Amount:</strong> {{amount}} ETB</p>
            </div>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6;">
              <h3 style="margin: 0 0 12px 0; color: #1e40af;">✅ You now have access to:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
                <li>All premium features</li>
                <li>Enhanced API limits</li>
                <li>Priority support</li>
                <li>Advanced analytics</li>
              </ul>
            </div>
            
            <p style="margin: 16px 0;">Thank you for choosing FetanPay! We're excited to continue supporting your business growth.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
              This is an automated notification from FetanPay.
            </p>
          </div>
        </div>
      `,
      variables: ['merchantName', 'planName', 'startDate', 'endDate', 'amount'],
      isSystem: true,
    },
    {
      name: 'plan-assigned-merchant',
      category: 'APPROVAL' as EmailTemplateCategory,
      subject: 'New Plan Assigned - {{planName}} - By Administrator',
      content: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto;">
          <div style="background: #8B5CF6; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; color: white; font-size: 24px;">🎁 New Plan Assigned!</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e293b; margin-top: 0;">Hello {{merchantName}},</h2>
            
            <p style="margin: 16px 0;">Great news! A new <strong>{{planName}}</strong> plan has been assigned to your account by an administrator.</p>
            
            <div style="background: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B5CF6;">
              <h3 style="margin: 0 0 12px 0; color: #6B21A8;">📋 Assignment Details:</h3>
              <p style="margin: 4px 0; color: #6B21A8;"><strong>Plan:</strong> {{planName}}</p>
              <p style="margin: 4px 0; color: #6B21A8;"><strong>Assigned By:</strong> {{assignedBy}}</p>
              <p style="margin: 4px 0; color: #6B21A8;"><strong>Start Date:</strong> {{startDate}}</p>
              <p style="margin: 4px 0; color: #6B21A8;"><strong>Valid Until:</strong> {{endDate}}</p>
            </div>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
              <h3 style="margin: 0 0 12px 0; color: #166534;">🚀 Your new plan is now active!</h3>
              <p style="margin: 0; color: #166534;">You can immediately start using all the features included in your new plan. Check your merchant dashboard to explore the enhanced capabilities.</p>
            </div>
            
            <p style="margin: 16px 0;">If you have any questions about your new plan or need assistance, please don't hesitate to contact our support team.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
              This is an automated notification from FetanPay.
            </p>
          </div>
        </div>
      `,
      variables: [
        'merchantName',
        'planName',
        'assignedBy',
        'startDate',
        'endDate',
      ],
      isSystem: true,
    },
  ];

  for (const template of templates) {
    // Check if template exists first
    const existing = await prisma.emailTemplate.findFirst({
      where: { name: template.name },
    });

    if (existing) {
      await prisma.emailTemplate.update({
        where: { id: existing.id },
        data: {
          subject: template.subject,
          content: template.content,
          variables: template.variables,
          isActive: true,
          isSystem: template.isSystem,
        },
      });
      console.log(`✅ Updated template: ${template.name}`);
    } else {
      await prisma.emailTemplate.create({
        data: template,
      });
      console.log(`✅ Created template: ${template.name}`);
    }
  }

  console.log('✅ Notification email templates seeded successfully!');
}

seedNotificationTemplates()
  .catch((e) => {
    console.error('❌ Error seeding notification templates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
