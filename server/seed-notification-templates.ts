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
