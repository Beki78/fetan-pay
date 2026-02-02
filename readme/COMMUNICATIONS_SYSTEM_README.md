# FetanPay Communications System Implementation Guide

## 📋 **Overview**

This document outlines the implementation of a comprehensive email and SMS communication system for the FetanPay admin panel, enabling administrators to send targeted messages to users, merchants, and specific user segments.

---

## 🎯 **Business Use Cases**

### **Why This System is Needed**
- **User Onboarding**: Welcome emails for new merchants
- **Status Notifications**: Approval/rejection notifications
- **Security Alerts**: Account security notifications, password changes
- **Marketing Campaigns**: Feature announcements, promotional offers
- **Operational Updates**: System maintenance, policy changes
- **Payment Reminders**: Overdue payments, wallet balance alerts
- **Compliance Communications**: Regulatory updates, terms changes

### **Target Audiences**
- **All Users**: System-wide announcements
- **Pending Merchants**: Approval status updates
- **Active Merchants**: Feature updates, tips
- **Banned Users**: Account restoration information
- **High-Value Merchants**: VIP communications
- **Inactive Users**: Re-engagement campaigns

---

## 🏗️ **System Architecture**

### **Backend Structure**
```
server/src/modules/communications/
├── communications.module.ts           # Main module
├── communications.controller.ts       # Admin API endpoints
├── communications.service.ts          # Core business logic
├── providers/
│   ├── email/
│   │   ├── email-provider.interface.ts
│   │   ├── resend.provider.ts         # Resend integration
│   │   ├── mailgun.provider.ts        # Mailgun integration
│   │   └── sendgrid.provider.ts       # SendGrid integration
│   └── sms/
│       ├── sms-provider.interface.ts
│       ├── afromessage.provider.ts    # AfroMessage integration
│       ├── geezsms.provider.ts        # GeezSMS integration
│       └── twilio.provider.ts         # Twilio fallback
├── templates/
│   ├── email/
│   │   ├── welcome-merchant.html
│   │   ├── approval-notification.html
│   │   ├── security-alert.html
│   │   └── payment-reminder.html
│   └── sms/
│       ├── otp-verification.txt
│       ├── approval-notification.txt
│       └── security-alert.txt
├── dto/
│   ├── send-message.dto.ts 
│   ├── create-campaign.dto.ts
│   ├── target-audience.dto.ts
│   └── message-template.dto.ts
├── entities/
│   ├── campaign.entity.ts
│   ├── message.entity.ts
│   └── delivery-log.entity.ts
└── utils/
    ├── message-validator.ts
    ├── template-engine.ts
    └── audience-segmentation.ts
```

### **Frontend Structure**
```
admin/src/components/communications/
├── CommunicationsPage.tsx            # Main page
├── MessageComposer/
│   ├── EmailComposer.tsx             # Rich email editor
│   ├── SMSComposer.tsx               # SMS message editor
│   ├── TemplateSelector.tsx          # Template picker
│   └── MessagePreview.tsx            # Preview component
├── AudienceSelector/
│   ├── AudienceSelector.tsx          # Target selection
│   ├── FilterBuilder.tsx             # Advanced filters
│   └── RecipientPreview.tsx          # Show selected users
├── CampaignManagement/
│   ├── CampaignList.tsx              # Past campaigns
│   ├── CampaignDetail.tsx            # Campaign analytics
│   ├── ScheduleModal.tsx             # Schedule sending
│   └── DeliveryStatus.tsx            # Real-time tracking
├── Templates/
│   ├── TemplateLibrary.tsx           # Template management
│   ├── TemplateEditor.tsx            # Create/edit templates
│   └── TemplatePreview.tsx           # Template preview
└── Analytics/
    ├── DeliveryAnalytics.tsx         # Delivery rates
    ├── EngagementMetrics.tsx         # Open/click rates
    └── CostAnalysis.tsx              # Spending analysis
```

---

## 🛠️ **Technical Implementation Steps**

### **Phase 1: Foundation (Week 1)**

#### **1.1 Database Schema**
```sql
-- Add to Prisma schema
model Campaign {
  id          String   @id @default(cuid())
  name        String
  type        CampaignType  // EMAIL, SMS, BOTH
  status      CampaignStatus // DRAFT, SCHEDULED, SENDING, SENT, FAILED
  subject     String?        // Email subject
  content     String         // Message content
  template    String?        // Template ID
  targetType  TargetType     // ALL_USERS, BY_STATUS, BY_ROLE, CUSTOM
  targetCriteria Json?        // Filter criteria
  scheduledAt DateTime?      // When to send
  sentAt      DateTime?      // When actually sent
  createdBy   String         // Admin user ID
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  messages    Message[]
  @@map("campaigns")
}

model Message {
  id         String @id @default(cuid())
  campaignId String
  campaign   Campaign @relation(fields: [campaignId], references: [id])
  
  recipientType String  // USER, MERCHANT_USER
  recipientId   String  // User/MerchantUser ID
  recipientEmail String?
  recipientPhone String?
  
  type       MessageType   // EMAIL, SMS
  status     MessageStatus // PENDING, SENT, DELIVERED, FAILED, BOUNCED
  content    String        // Final message content
  sentAt     DateTime?
  deliveredAt DateTime?
  errorMessage String?
  
  providerMessageId String? // External provider message ID
  cost              Decimal? // Cost in ETB
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("messages")
}

model MessageTemplate {
  id          String @id @default(cuid())
  name        String
  type        MessageType // EMAIL, SMS
  category    String      // WELCOME, APPROVAL, SECURITY, MARKETING
  subject     String?     // Email subject template
  content     String      // Message template with variables
  variables   Json        // Available variables
  isActive    Boolean @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("message_templates")
}

enum CampaignType {
  EMAIL
  SMS
  BOTH
}

enum CampaignStatus {
  DRAFT
  SCHEDULED
  SENDING
  SENT
  FAILED
}

enum MessageType {
  EMAIL
  SMS
}

enum MessageStatus {
  PENDING
  SENT
  DELIVERED
  FAILED
  BOUNCED
  OPENED     // Email only
  CLICKED    // Email only
}

enum TargetType {
  ALL_USERS
  ALL_MERCHANTS
  BY_STATUS
  BY_ROLE
  BY_ACTIVITY
  CUSTOM
}
```

#### **1.2 Backend Services**
```typescript
// communications.service.ts
@Injectable()
export class CommunicationsService {
  constructor(
    private prisma: PrismaService,
    private emailProvider: EmailProviderService,
    private smsProvider: SMSProviderService,
    private templateEngine: TemplateEngineService,
    private audienceService: AudienceSegmentationService,
  ) {}

  async createCampaign(dto: CreateCampaignDto): Promise<Campaign> {
    // Create campaign record
    // Validate template and content
    // Calculate target audience size
  }

  async sendCampaign(campaignId: string): Promise<void> {
    // Get campaign and recipients
    // Process messages in batches
    // Track delivery status
  }

  async getTargetAudience(criteria: TargetAudienceDto): Promise<User[]> {
    // Build dynamic Prisma query based on criteria
    // Return filtered user list
  }

  async trackDelivery(messageId: string, status: MessageStatus): Promise<void> {
    // Update message status
    // Record delivery metrics
  }
}
```

### **Phase 2: Provider Integration (Week 2)**

#### **2.1 Email Provider (Resend)**
```typescript
// providers/email/resend.provider.ts
@Injectable()
export class ResendEmailProvider implements EmailProvider {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendEmail(to: string[], subject: string, content: string): Promise<SendResult> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'FetanPay <noreply@fetanpay.et>',
        to,
        subject,
        html: content,
      });

      return {
        success: !error,
        messageId: data?.id,
        error: error?.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
```

#### **2.2 SMS Provider (AfroMessage)**
```typescript
// providers/sms/afromessage.provider.ts
@Injectable()
export class AfroMessageSMSProvider implements SMSProvider {
  private baseUrl = 'https://api.afromessage.com/api/v1';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.AFROMESSAGE_API_KEY;
  }

  async sendSMS(to: string[], message: string): Promise<SendResult> {
    try {
      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'FetanPay',
          to,
          message,
        }),
      });

      const result = await response.json();
      
      return {
        success: response.ok,
        messageId: result.messageId,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
```

### **Phase 3: Admin Interface (Week 3)**

#### **3.1 Message Composer**
```typescript
// MessageComposer.tsx
export default function MessageComposer() {
  const [messageType, setMessageType] = useState<'email' | 'sms'>('email');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<TargetCriteria>();

  return (
    <div className="space-y-6">
      {/* Message Type Selector */}
      <div className="flex gap-4">
        <button onClick={() => setMessageType('email')}>Email</button>
        <button onClick={() => setMessageType('sms')}>SMS</button>
      </div>

      {/* Audience Selector */}
      <AudienceSelector 
        onSelect={setTargetAudience}
        showPreview={true}
      />

      {/* Content Editor */}
      {messageType === 'email' ? (
        <EmailEditor 
          subject={subject}
          content={content}
          onSubjectChange={setSubject}
          onContentChange={setContent}
        />
      ) : (
        <SMSEditor
          content={content}
          onContentChange={setContent}
          characterLimit={160}
        />
      )}

      {/* Send Options */}
      <SendOptions />
    </div>
  );
}
```

#### **3.2 Audience Selector**
```typescript
// AudienceSelector.tsx
export default function AudienceSelector() {
  return (
    <div className="space-y-4">
      {/* Quick Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <FilterButton 
          label="All Merchants" 
          count={1250}
          onClick={() => setFilter({ type: 'ALL_MERCHANTS' })}
        />
        <FilterButton 
          label="Pending Approval" 
          count={45}
          onClick={() => setFilter({ type: 'BY_STATUS', status: 'PENDING' })}
        />
        <FilterButton 
          label="Active Merchants" 
          count={1180}
          onClick={() => setFilter({ type: 'BY_STATUS', status: 'ACTIVE' })}
        />
        <FilterButton 
          label="Banned Users" 
          count={25}
          onClick={() => setFilter({ type: 'BANNED' })}
        />
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters>
        <FilterGroup label="Status">
          <Checkbox label="Pending" />
          <Checkbox label="Active" />
          <Checkbox label="Banned" />
        </FilterGroup>
        
        <FilterGroup label="Role">
          <Checkbox label="Merchant Owners" />
          <Checkbox label="Admins" />
          <Checkbox label="Waiters" />
        </FilterGroup>
        
        <FilterGroup label="Activity">
          <Checkbox label="Inactive 30+ days" />
          <Checkbox label="High transaction volume" />
          <Checkbox label="New signups (7 days)" />
        </FilterGroup>
      </AdvancedFilters>

      {/* Recipient Preview */}
      <RecipientPreview 
        count={selectedCount}
        sampleUsers={previewUsers}
      />
    </div>
  );
}
```

---

## 📱 **Admin User Experience**

### **How Admins Will Use the System**

#### **1. Quick Send (Simple Use Case)**
1. Navigate to **Communications** → **Send Message**
2. Choose **Email** or **SMS**
3. Select audience: "All Pending Merchants" (45 users)
4. Choose template: "Merchant Approval Status Update"
5. Customize message content
6. Preview and Send

#### **2. Campaign Creation (Advanced Use Case)**
1. Navigate to **Communications** → **Campaigns** → **Create Campaign**
2. Set campaign name: "Q1 Feature Announcement"
3. Choose **Email + SMS** multi-channel
4. Build custom audience:
   - Status: Active merchants
   - Activity: Logged in last 30 days
   - Transaction volume: >100 ETB/month
5. Design email with rich content and images
6. Create shorter SMS version for same message
7. Schedule for optimal time (Tuesday 10 AM)
8. Set up A/B testing for subject lines
9. Launch campaign

#### **3. Automated Workflows (Enterprise Use Case)**
1. Navigate to **Communications** → **Automation**
2. Create workflow: "New Merchant Onboarding"
3. Trigger: Merchant status changes to "ACTIVE"
4. Actions:
   - Send welcome email immediately
   - Send SMS with login instructions (2 hours later)
   - Send feature guide email (1 day later)
   - Send feedback request (7 days later)

---

## 🔧 **Technical Implementation Guide**

### **Step 1: Backend Setup**

#### **1.1 Install Dependencies**
```bash
cd server
npm install @resendmail/resend axios node-cron
npm install -D @types/node-cron
```

#### **1.2 Environment Variables**
```env
# Email Providers
RESEND_API_KEY=your_resend_api_key
MAILGUN_API_KEY=your_mailgun_api_key
SENDGRID_API_KEY=your_sendgrid_api_key

# SMS Providers  
AFROMESSAGE_API_KEY=your_afromessage_api_key
AFROMESSAGE_SENDER_ID=FetanPay
GEEZSMS_API_KEY=your_geezsms_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token

# Configuration
DEFAULT_EMAIL_PROVIDER=resend
DEFAULT_SMS_PROVIDER=afromessage
ENABLE_SMS_FALLBACK=true
MAX_BULK_SIZE=100
```

#### **1.3 Create Communications Module**
```bash
# Generate NestJS module
cd server/src/modules
nest generate module communications
nest generate service communications
nest generate controller communications
```

#### **1.4 Update Database Schema**
```prisma
// Add to server/prisma/schema.prisma
model Campaign {
  id              String        @id @default(cuid())
  name            String
  type            CampaignType
  status          CampaignStatus @default(DRAFT)
  subject         String?       // Email subject
  content         String        // Message content  
  templateId      String?       // Reference to template
  targetType      TargetType
  targetCriteria  Json?         // Filter criteria
  scheduledAt     DateTime?     // When to send
  sentAt          DateTime?     // When actually sent
  totalRecipients Int?          // Total target count
  sentCount       Int           @default(0)
  deliveredCount  Int           @default(0)
  failedCount     Int           @default(0)
  cost            Decimal?      // Total cost in ETB
  createdBy       String        // Admin user ID
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  messages        Message[]
  
  @@map("campaigns")
}

model Message {
  id                String        @id @default(cuid())
  campaignId        String
  campaign          Campaign      @relation(fields: [campaignId], references: [id])
  
  recipientType     RecipientType // USER, MERCHANT_USER
  recipientId       String        // User/MerchantUser ID
  recipientEmail    String?
  recipientPhone    String?
  recipientName     String?
  
  type              MessageType   // EMAIL, SMS
  status            MessageStatus @default(PENDING)
  content           String        // Final rendered content
  subject           String?       // Email subject
  
  sentAt            DateTime?
  deliveredAt       DateTime?
  openedAt          DateTime?     // Email only
  clickedAt         DateTime?     // Email only
  
  providerMessageId String?       // External provider ID
  providerResponse  Json?         // Provider response data
  errorMessage      String?       // Error details
  cost              Decimal?      // Cost in ETB
  
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  
  @@map("messages")
}

model MessageTemplate {
  id          String      @id @default(cuid())
  name        String
  category    String      // WELCOME, APPROVAL, SECURITY, MARKETING
  type        MessageType // EMAIL, SMS
  subject     String?     // Email subject template
  content     String      // Content with variables {{name}}, {{status}}
  variables   Json        // Available variables definition
  isActive    Boolean     @default(true)
  usageCount  Int         @default(0)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  @@map("message_templates")
}

enum CampaignType {
  EMAIL
  SMS
  BOTH
}

enum CampaignStatus {
  DRAFT
  SCHEDULED
  SENDING
  SENT
  FAILED
}

enum MessageType {
  EMAIL
  SMS
}

enum MessageStatus {
  PENDING
  SENT
  DELIVERED
  FAILED
  BOUNCED
  OPENED
  CLICKED
}

enum TargetType {
  ALL_USERS
  ALL_MERCHANTS
  BY_STATUS
  BY_ROLE
  BY_ACTIVITY
  CUSTOM
}

enum RecipientType {
  USER
  MERCHANT_USER
}
```

### **Step 2: Provider Integration**

#### **2.1 Email Provider Interface**
```typescript
// providers/email/email-provider.interface.ts
export interface EmailProvider {
  sendEmail(params: SendEmailParams): Promise<SendEmailResult>;
  sendBulkEmail(params: BulkEmailParams): Promise<BulkEmailResult>;
  getDeliveryStatus(messageId: string): Promise<DeliveryStatus>;
}

export interface SendEmailParams {
  to: string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}
```

#### **2.2 SMS Provider Interface**
```typescript
// providers/sms/sms-provider.interface.ts
export interface SMSProvider {
  sendSMS(params: SendSMSParams): Promise<SendSMSResult>;
  sendBulkSMS(params: BulkSMSParams): Promise<BulkSMSResult>;
  getDeliveryStatus(messageId: string): Promise<DeliveryStatus>;
}

export interface SendSMSParams {
  to: string[];
  message: string;
  senderId?: string;
  scheduledAt?: Date;
}
```

### **Step 3: Frontend Implementation**

#### **3.1 Communications API Service**
```typescript
// admin/src/lib/services/communicationsApi.ts
export const communicationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCampaigns: build.query<Campaign[], CampaignFilters>({
      query: (filters) => ({
        url: '/communications/campaigns',
        params: filters,
      }),
      providesTags: ['Campaign'],
    }),
    
    createCampaign: build.mutation<Campaign, CreateCampaignDto>({
      query: (data) => ({
        url: '/communications/campaigns',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Campaign'],
    }),
    
    sendCampaign: build.mutation<void, string>({
      query: (campaignId) => ({
        url: `/communications/campaigns/${campaignId}/send`,
        method: 'POST',
      }),
      invalidatesTags: ['Campaign'],
    }),
    
    getTargetAudience: build.query<TargetAudiencePreview, TargetCriteria>({
      query: (criteria) => ({
        url: '/communications/target-audience',
        params: criteria,
      }),
    }),
    
    getTemplates: build.query<MessageTemplate[], { type?: MessageType }>({
      query: (filters) => ({
        url: '/communications/templates',
        params: filters,
      }),
      providesTags: ['Template'],
    }),
  }),
});
```

#### **3.2 Main Communications Page**
```typescript
// admin/src/app/(admin)/communications/page.tsx
export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState<'send' | 'campaigns' | 'templates' | 'analytics'>('send');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Communications
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Send emails and SMS to your users and merchants
          </p>
        </div>
        
        <Button 
          onClick={() => setActiveTab('send')}
          className="bg-blue-600 text-white"
        >
          <PaperPlaneIcon className="w-4 h-4 mr-2" />
          Send Message
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <TabButton active={activeTab === 'send'} onClick={() => setActiveTab('send')}>
            Send Message
          </TabButton>
          <TabButton active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')}>
            Campaigns
          </TabButton>
          <TabButton active={activeTab === 'templates'} onClick={() => setActiveTab('templates')}>
            Templates
          </TabButton>
          <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}>
            Analytics
          </TabButton>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'send' && <MessageComposer />}
      {activeTab === 'campaigns' && <CampaignManagement />}
      {activeTab === 'templates' && <TemplateLibrary />}
      {activeTab === 'analytics' && <CommunicationAnalytics />}
    </div>
  );
}
```

---

## 📊 **Audience Targeting System**

### **Predefined Audience Segments**
```typescript
export const AUDIENCE_SEGMENTS = {
  // Status-based
  ALL_MERCHANTS: {
    name: "All Merchants",
    description: "Every merchant in the system",
    query: { type: 'merchant' }
  },
  
  PENDING_MERCHANTS: {
    name: "Pending Approval",
    description: "Merchants awaiting admin approval", 
    query: { type: 'merchant', status: 'PENDING' }
  },
  
  ACTIVE_MERCHANTS: {
    name: "Active Merchants",
    description: "Approved and active merchants",
    query: { type: 'merchant', status: 'ACTIVE' }
  },
  
  BANNED_USERS: {
    name: "Banned Users", 
    description: "Users who have been banned",
    query: { type: 'user', banned: true }
  },

  // Activity-based
  INACTIVE_MERCHANTS: {
    name: "Inactive Merchants",
    description: "No login in last 30 days",
    query: { 
      type: 'merchant', 
      status: 'ACTIVE',
      lastLogin: { before: '30 days ago' }
    }
  },
  
  HIGH_VOLUME_MERCHANTS: {
    name: "High Volume Merchants",
    description: "1000+ ETB transactions last month",
    query: {
      type: 'merchant',
      status: 'ACTIVE', 
      transactionVolume: { min: 1000, period: '30 days' }
    }
  },
  
  NEW_SIGNUPS: {
    name: "New Signups",
    description: "Registered in last 7 days",
    query: {
      type: 'merchant',
      createdAt: { after: '7 days ago' }
    }
  },

  // Role-based
  MERCHANT_OWNERS: {
    name: "Merchant Owners",
    description: "Business owners only",
    query: { type: 'merchantUser', role: 'MERCHANT_OWNER' }
  },
  
  WAITERS: {
    name: "Waiters",
    description: "Restaurant/cafe staff",
    query: { type: 'merchantUser', role: 'WAITER' }
  }
};
```

---

## 📋 **Message Templates**

### **Email Templates**
```html
<!-- Welcome Merchant Template -->
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #5CFFCE 0%, #4F46E5 100%); padding: 40px; text-align: center;">
    <h1 style="color: white; margin: 0;">Welcome to FetanPay!</h1>
  </div>
  
  <div style="padding: 40px;">
    <h2>Hello {{merchantName}},</h2>
    
    <p>Congratulations! Your merchant account has been approved and is now active.</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>What's Next?</h3>
      <ul>
        <li>Set up your payment accounts</li>
        <li>Configure your branding</li>
        <li>Add team members</li>
        <li>Start accepting payments</li>
      </ul>
    </div>
    
    <a href="{{loginUrl}}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
      Access Your Dashboard
    </a>
  </div>
</div>
```

### **SMS Templates**
```text
<!-- Approval Notification SMS -->
🎉 Congratulations {{merchantName}}! Your FetanPay account is approved. 
Login: {{loginUrl}}
Need help? Reply HELP

<!-- Security Alert SMS -->
🔒 Security Alert: {{alertType}} detected on your FetanPay account. 
If this wasn't you, secure your account immediately: {{secureUrl}}

<!-- Payment Reminder SMS -->
💰 Reminder: You have {{amount}} ETB pending in your wallet. 
Withdraw now: {{withdrawUrl}}
```

---

## 📈 **Analytics & Monitoring**

### **Key Metrics to Track**
1. **Delivery Metrics**:
   - Email delivery rate (>95% target)
   - SMS delivery rate (>98% target)
   - Bounce rates (<2% target)
   - Failed delivery reasons

2. **Engagement Metrics**:
   - Email open rates (25-35% target)
   - Email click rates (3-5% target)
   - SMS response rates (if applicable)
   - Unsubscribe rates (<0.5% target)

3. **Cost Analysis**:
   - Cost per email (~$0.001)
   - Cost per SMS (~0.25 ETB)
   - Monthly communication budget
   - ROI on marketing campaigns

4. **Compliance Metrics**:
   - Opt-out requests processed
   - Consent audit trail
   - Failed delivery handling

---

## 💰 **Cost Structure & Scalability**

### **Provider Pricing (Ethiopia)**

#### **Email (Resend - Recommended)**
- **Free Tier**: 3,000 emails/month
- **Paid Tier**: $20/month for 50,000 emails
- **Cost per Email**: ~$0.0004

#### **SMS (AfroMessage + GeezSMS)**
- **AfroMessage**: ~0.25 ETB per SMS
- **GeezSMS**: ~0.20 ETB per SMS (local)
- **Twilio** (fallback): ~$0.34 per SMS

#### **Monthly Cost Estimates**
| Users | Email Cost | SMS Cost | Total (ETB) |
|-------|------------|----------|-------------|
| 1,000 | Free | 250 ETB | 250 ETB |
| 5,000 | $10 | 1,250 ETB | ~1,800 ETB |
| 10,000 | $20 | 2,500 ETB | ~3,600 ETB |
| 50,000 | $40 | 12,500 ETB | ~15,000 ETB |

---

## 🔐 **Security & Compliance**

### **Data Protection**
- **Opt-in Consent**: Record explicit consent for marketing messages
- **Opt-out Handling**: Honor unsubscribe requests immediately
- **Data Encryption**: Encrypt stored message content and recipient data
- **Audit Logging**: Track all communication activities

### **Ethiopian Regulatory Compliance**
- **SMS Sender ID**: Register "FetanPay" with ECA
- **Content Approval**: Review templates for compliance
- **Opt-out Keywords**: Support "STOP", "UNSUBSCRIBE" in Amharic/English
- **Sending Hours**: 8 AM - 8 PM EAT only

### **Rate Limiting & Abuse Prevention**
- **Bulk Sending Limits**: Max 1,000 messages per campaign
- **Frequency Limits**: Max 3 marketing messages per user per week
- **Content Validation**: Block spam keywords and excessive punctuation
- **Admin Approval**: Require approval for large campaigns (>500 recipients)

---

## 🚀 **Implementation Timeline**

### **Week 1: Foundation**
- [ ] Create database schema and migrations
- [ ] Set up communications module structure
- [ ] Integrate Resend for email
- [ ] Create basic admin UI components

### **Week 2: Core Features**
- [ ] Implement message composer (email + SMS)
- [ ] Build audience selector with basic filters
- [ ] Add template system
- [ ] Create send functionality

### **Week 3: Advanced Features**
- [ ] Add SMS provider integration (AfroMessage/GeezSMS)
- [ ] Implement scheduling system
- [ ] Build campaign management
- [ ] Add delivery tracking

### **Week 4: Analytics & Polish**
- [ ] Create analytics dashboard
- [ ] Add cost tracking
- [ ] Implement compliance features
- [ ] Performance optimization

---

## 🎯 **Success Metrics**

### **Technical KPIs**
- **System Uptime**: >99.9%
- **Message Delivery**: >95% success rate
- **API Response Time**: <500ms average
- **Error Rate**: <1%

### **Business KPIs**
- **User Engagement**: 30% email open rate
- **Cost Efficiency**: <1 ETB per user per month
- **Admin Productivity**: 50% reduction in manual communication time
- **Compliance Score**: 100% (no violations)

---

## 🔄 **Future Enhancements**

### **Phase 2 Features (Month 2)**
- **Multi-language Support**: Amharic + English templates
- **Rich Email Editor**: Drag-and-drop email builder
- **Advanced Segmentation**: ML-based user clustering
- **A/B Testing**: Automated subject line testing

### **Phase 3 Features (Month 3)**
- **Automation Workflows**: Drip campaigns, trigger-based messaging
- **Integration APIs**: Webhook endpoints for external systems
- **White-label Options**: Custom branding for enterprise clients
- **Advanced Analytics**: Predictive engagement modeling

---

This comprehensive system will transform how you communicate with merchants and users, providing professional, scalable, and compliant messaging capabilities that match enterprise standards while remaining cost-effective for the Ethiopian market.

Would you like me to start implementing any specific component of this system?
