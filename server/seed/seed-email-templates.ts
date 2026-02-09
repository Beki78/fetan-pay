import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const datasourceUrl = process.env.DATABASE_URL;
if (!datasourceUrl) {
  throw new Error('DATABASE_URL is not set for Prisma connection');
}

const adapter = new PrismaPg(new pg.Pool({ connectionString: datasourceUrl }));
const prisma = new PrismaClient({ adapter });

async function seedEmailTemplates() {
  console.info('🌱 Seeding email templates...');

  const defaultTemplates = [
    {
      id: 'seed_template_welcome',
      name: 'Welcome New Merchant',
      category: 'WELCOME',
      subject: 'Welcome to FetanPay! Your journey starts here 🚀',
      content: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #5CFFCE 0%, #4F46E5 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to FetanPay!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your payment journey starts here</p>
          </div>
          
          <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #0f172a; margin: 0 0 20px 0; font-size: 22px;">Hello {{merchantName}}! 👋</h2>
            
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #475569;">
              Congratulations! Your merchant account has been approved and is now active. You're ready to start accepting payments and growing your business.
            </p>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #5CFFCE;">
              <h3 style="margin: 0 0 15px 0; color: #0f172a; font-size: 18px;">What's next?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #475569;">
                <li style="margin-bottom: 8px;">🏦 Set up your payment accounts</li>
                <li style="margin-bottom: 8px;">🎨 Configure your branding</li>
                <li style="margin-bottom: 8px;">👥 Add team members</li>
                <li style="margin-bottom: 8px;">💳 Start accepting payments</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{loginUrl}}" style="background: linear-gradient(135deg, #5CFFCE 0%, #4F46E5 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Access Your Dashboard
              </a>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b;">
                Need help getting started? Our support team is here for you:
              </p>
              <p style="margin: 0; font-size: 14px; color: #64748b;">
                📧 Email: {{supportEmail}}<br>
                📞 Phone: {{supportPhone}}
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 14px; color: #94a3b8;">
                Best regards,<br>
                <strong style="color: #0f172a;">The FetanPay Team</strong>
              </p>
            </div>
          </div>
        </div>
      `,
      variables: ['merchantName', 'loginUrl', 'supportEmail', 'supportPhone'],
      isActive: true,
    },
    {
      id: 'seed_template_approval',
      name: 'Account Approved',
      category: 'APPROVAL',
      subject: '✅ Your FetanPay account has been approved!',
      content: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto;">
          <div style="background: #10b981; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">🎉 Account Approved!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="margin: 0 0 20px 0; font-size: 16px;">Hello {{merchantName}},</p>
            
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #475569;">
              Great news! Your FetanPay merchant account has been approved and is now active.
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="{{loginUrl}}" style="background: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Login to Your Account
              </a>
            </div>
            
            <p style="margin: 20px 0 0 0; font-size: 14px; color: #64748b;">
              If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      `,
      variables: ['merchantName', 'loginUrl'],
      isActive: true,
    },
    {
      id: 'seed_template_security',
      name: 'Security Alert',
      category: 'SECURITY',
      subject: '🔒 Security Alert: {{alertType}} detected',
      content: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto;">
          <div style="background: #ef4444; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">🔒 Security Alert</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="margin: 0 0 20px 0; font-size: 16px;">Hello {{merchantName}},</p>
            
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #475569;">
              We detected {{alertType}} on your FetanPay account:
            </p>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <ul style="margin: 0; padding-left: 20px; color: #475569;">
                <li><strong>Time:</strong> {{alertTime}}</li>
                <li><strong>Location:</strong> {{alertLocation}}</li>
                <li><strong>Device:</strong> {{alertDevice}}</li>
              </ul>
            </div>
            
            <p style="margin: 20px 0; font-size: 16px; color: #475569;">
              If this was you, no action is needed. If this wasn't you:
            </p>
            
            <ol style="margin: 0 0 20px 0; padding-left: 20px; color: #475569;">
              <li>Change your password immediately</li>
              <li>Review your account activity</li>
              <li>Contact our support team</li>
            </ol>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="{{securityUrl}}" style="background: #ef4444; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Secure My Account
              </a>
            </div>
          </div>
        </div>
      `,
      variables: [
        'merchantName',
        'alertType',
        'alertTime',
        'alertLocation',
        'alertDevice',
        'securityUrl',
      ],
      isActive: true,
    },
  ];

  for (const template of defaultTemplates) {
    await (prisma as any).emailTemplate.upsert({
      where: { id: template.id },
      update: {
        name: template.name,
        category: template.category,
        subject: template.subject,
        content: template.content,
        variables: template.variables,
        isActive: template.isActive,
      },
      create: template,
    });
  }

  console.info('✅ Email templates seeded successfully!', {
    count: defaultTemplates.length,
    templates: defaultTemplates.map((t) => ({
      name: t.name,
      category: t.category,
    })),
  });
}

seedEmailTemplates()
  .catch((e) => {
    console.error('❌ Email template seed failed', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
