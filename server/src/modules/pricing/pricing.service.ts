import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { SubscriptionService } from '../../common/services/subscription.service';
import { NotificationService } from '../notifications/notification.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { AssignPlanDto } from './dto/assign-plan.dto';
import { CreateBillingTransactionDto } from './dto/create-billing-transaction.dto';
import {
  CreatePricingReceiverDto,
  UpdatePricingReceiverDto,
} from './dto/create-pricing-receiver.dto';
import { VerifyPricingPaymentDto } from './dto/verify-pricing-payment.dto';
import { PlanQueryDto } from './dto/plan-query.dto';
import {
  PlanStatus,
  SubscriptionStatus,
  TransactionStatus,
  PlanAssignmentType,
  BillingCycle,
} from '@prisma/client';

@Injectable()
export class PricingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionService: SubscriptionService,
    private readonly notificationService: NotificationService,
  ) {}

  // Plan Management
  async createPlan(createPlanDto: CreatePlanDto, createdBy?: string) {
    // Check if plan name already exists
    const existingPlan = await this.prisma.plan.findUnique({
      where: { name: createPlanDto.name },
    });

    if (existingPlan) {
      throw new ConflictException('Plan with this name already exists');
    }

    return this.prisma.plan.create({
      data: {
        name: createPlanDto.name,
        description: createPlanDto.description,
        price: createPlanDto.price,
        billingCycle: createPlanDto.billingCycle || BillingCycle.MONTHLY,
        limits: (createPlanDto.limits || {}) as Prisma.InputJsonValue,
        features: createPlanDto.features,
        status: PlanStatus.ACTIVE,
        isPopular: createPlanDto.isPopular || false,
        displayOrder: createPlanDto.displayOrder || 1,
        createdBy,
      },
    });
  }

  async getPlans(query: PlanQueryDto) {
    const {
      status,
      search,
      showOnLanding,
      page = 1,
      limit = 10,
      sortBy = 'displayOrder',
      sortOrder = 'asc',
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (showOnLanding !== undefined) {
      where.showOnLanding = showOnLanding;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [plans, total] = await Promise.all([
      this.prisma.plan.findMany({
        where,
        skip,
        take: limit,
        orderBy:
          sortBy === 'displayOrder'
            ? { displayOrder: sortOrder }
            : sortBy === 'name'
              ? { name: sortOrder }
              : sortBy === 'price'
                ? { price: sortOrder }
                : sortBy === 'createdAt'
                  ? { createdAt: sortOrder }
                  : { displayOrder: sortOrder },
        include: {
          _count: {
            select: {
              subscriptions: {
                where: { status: SubscriptionStatus.ACTIVE },
              },
            },
          },
        },
      }),
      this.prisma.plan.count({ where }),
    ]);

    return {
      data: plans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPlanById(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subscriptions: {
              where: { status: SubscriptionStatus.ACTIVE },
            },
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }

  async updatePlan(id: string, updatePlanDto: UpdatePlanDto) {
    const existingPlan = await this.prisma.plan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      throw new NotFoundException('Plan not found');
    }

    // Check if name is being changed and if it conflicts
    if (updatePlanDto.name && updatePlanDto.name !== existingPlan.name) {
      const nameConflict = await this.prisma.plan.findUnique({
        where: { name: updatePlanDto.name },
      });

      if (nameConflict) {
        throw new ConflictException('Plan with this name already exists');
      }
    }

    return this.prisma.plan.update({
      where: { id },
      data: updatePlanDto,
    });
  }

  async deletePlan(id: string): Promise<void> {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subscriptions: {
              where: { status: SubscriptionStatus.ACTIVE },
            },
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (plan._count.subscriptions > 0) {
      throw new BadRequestException(
        'Cannot delete plan with active subscriptions',
      );
    }

    await this.prisma.plan.delete({
      where: { id },
    });
  }

  // Plan Assignment
  async assignPlan(assignPlanDto: AssignPlanDto, assignedBy: string) {
    const {
      merchantId,
      planId,
      assignmentType,
      scheduledDate,
      durationType,
      endDate,
      notes,
    } = assignPlanDto;

    // Validate merchant exists
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Validate plan exists and is active
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (plan.status !== PlanStatus.ACTIVE) {
      throw new BadRequestException('Cannot assign inactive plan');
    }

    // Validate dates
    if (assignmentType === PlanAssignmentType.SCHEDULED && !scheduledDate) {
      throw new BadRequestException(
        'Scheduled date is required for scheduled assignments',
      );
    }

    // Check if merchant already has this plan active
    const currentSubscription = await this.prisma.subscription.findFirst({
      where: {
        merchantId,
        planId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (currentSubscription) {
      throw new BadRequestException(
        'Merchant already has an active subscription to this plan',
      );
    }

    // Clean up old pending assignments for this merchant and plan (older than 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    await this.prisma.planAssignment.deleteMany({
      where: {
        merchantId,
        planId,
        isApplied: false,
        createdAt: {
          lt: thirtyMinutesAgo,
        },
      },
    });

    // Check for existing recent pending assignments for the same merchant and plan
    const existingAssignment = await this.prisma.planAssignment.findFirst({
      where: {
        merchantId,
        planId,
        isApplied: false, // Only check pending assignments
        createdAt: {
          gte: thirtyMinutesAgo, // Only recent assignments
        },
      },
    });

    if (existingAssignment) {
      // If it's the same assignment type and from the same user, update it instead of creating new
      if (
        existingAssignment.assignedBy === assignedBy &&
        existingAssignment.assignmentType === assignmentType
      ) {
        const updatedAssignment = await this.prisma.planAssignment.update({
          where: { id: existingAssignment.id },
          data: {
            scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
            durationType,
            endDate: endDate ? new Date(endDate) : null,
            notes,
            updatedAt: new Date(),
          },
          include: {
            merchant: true,
            plan: true,
          },
        });

        // If immediate assignment, apply it
        if (assignmentType === PlanAssignmentType.IMMEDIATE) {
          await this.applyPlanAssignment(updatedAssignment.id);

          // Create billing transaction for admin assignment if it's a paid plan
          if (Number(plan.price) > 0) {
            const billingPeriodStart = new Date();
            const billingPeriodEnd = new Date();

            if (plan.billingCycle === BillingCycle.MONTHLY) {
              billingPeriodEnd.setMonth(billingPeriodEnd.getMonth() + 1);
            } else if (plan.billingCycle === BillingCycle.YEARLY) {
              billingPeriodEnd.setFullYear(billingPeriodEnd.getFullYear() + 1);
            }

            await this.createBillingTransaction(
              {
                merchantId,
                planId,
                amount: Number(plan.price),
                paymentMethod: 'Admin Assignment',
                billingPeriodStart: billingPeriodStart.toISOString(),
                billingPeriodEnd: billingPeriodEnd.toISOString(),
                notes: `Admin upgrade by ${assignedBy}`,
              },
              assignedBy,
            );
          }
        }

        return updatedAssignment;
      } else {
        throw new BadRequestException(
          'There is already a pending assignment for this merchant and plan. Please wait a few minutes or contact support to cancel the existing assignment.',
        );
      }
    }

    const assignment = await this.prisma.planAssignment.create({
      data: {
        merchantId,
        planId,
        assignmentType,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        durationType,
        endDate: endDate ? new Date(endDate) : null,
        notes,
        assignedBy,
        isApplied: false, // Always start as false, let applyPlanAssignment handle it
      },
      include: {
        merchant: true,
        plan: true,
      },
    });

    // If immediate assignment, create/update subscription
    if (assignmentType === PlanAssignmentType.IMMEDIATE) {
      await this.applyPlanAssignment(assignment.id);

      // Create billing transaction for admin assignment if it's a paid plan
      if (Number(plan.price) > 0) {
        const billingPeriodStart = new Date();
        const billingPeriodEnd = new Date();

        if (plan.billingCycle === BillingCycle.MONTHLY) {
          billingPeriodEnd.setMonth(billingPeriodEnd.getMonth() + 1);
        } else if (plan.billingCycle === BillingCycle.YEARLY) {
          billingPeriodEnd.setFullYear(billingPeriodEnd.getFullYear() + 1);
        }

        await this.createBillingTransaction(
          {
            merchantId,
            planId,
            amount: Number(plan.price),
            paymentMethod: 'Admin Assignment',
            billingPeriodStart: billingPeriodStart.toISOString(),
            billingPeriodEnd: billingPeriodEnd.toISOString(),
            notes: `Admin upgrade by ${assignedBy}`,
          },
          assignedBy,
        );
      }
    }

    return assignment;
  }

  async applyPlanAssignment(assignmentId: string) {
    const assignment = await this.prisma.planAssignment.findUnique({
      where: { id: assignmentId },
      include: { plan: true, merchant: true },
    });

    if (!assignment) {
      throw new NotFoundException('Plan assignment not found');
    }

    if (assignment.isApplied) {
      throw new BadRequestException('Plan assignment already applied');
    }

    // Calculate dates outside the transaction
    const now = new Date();
    const nextBillingDate = new Date();
    let subscriptionEndDate = assignment.endDate; // Use assignment endDate if specified

    // For paid plans without specific endDate, calculate based on billing cycle
    if (!subscriptionEndDate && Number(assignment.plan.price) > 0) {
      subscriptionEndDate = new Date();
      if (assignment.plan.billingCycle === BillingCycle.MONTHLY) {
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
      } else if (assignment.plan.billingCycle === BillingCycle.YEARLY) {
        subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
      } else if (assignment.plan.billingCycle === BillingCycle.WEEKLY) {
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 7);
      } else if (assignment.plan.billingCycle === BillingCycle.DAILY) {
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 1);
      }
    }

    // Calculate next billing date
    if (assignment.plan.billingCycle === BillingCycle.MONTHLY) {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else if (assignment.plan.billingCycle === BillingCycle.YEARLY) {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    } else if (assignment.plan.billingCycle === BillingCycle.WEEKLY) {
      nextBillingDate.setDate(nextBillingDate.getDate() + 7);
    } else if (assignment.plan.billingCycle === BillingCycle.DAILY) {
      nextBillingDate.setDate(nextBillingDate.getDate() + 1);
    }

    // Use a transaction to ensure atomicity
    await this.prisma.$transaction(async (tx) => {
      // Cancel existing active subscription - be more explicit about the update
      const cancelledSubscriptions = await tx.subscription.updateMany({
        where: {
          merchantId: assignment.merchantId,
          status: SubscriptionStatus.ACTIVE,
        },
        data: {
          status: SubscriptionStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelledBy: assignment.assignedBy,
          cancellationReason: 'Plan changed by admin',
        },
      });

      console.log(
        `Cancelled ${cancelledSubscriptions.count} existing subscriptions for merchant ${assignment.merchantId}`,
      );

      // Also handle any subscriptions that might be in other statuses
      await tx.subscription.updateMany({
        where: {
          merchantId: assignment.merchantId,
          status: {
            in: [SubscriptionStatus.PENDING, SubscriptionStatus.SUSPENDED],
          },
        },
        data: {
          status: SubscriptionStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelledBy: assignment.assignedBy,
          cancellationReason: 'Plan changed by admin',
        },
      });

      // Create new subscription
      await tx.subscription.create({
        data: {
          merchantId: assignment.merchantId,
          planId: assignment.planId,
          status: SubscriptionStatus.ACTIVE,
          startDate: now,
          endDate: subscriptionEndDate,
          nextBillingDate:
            Number(assignment.plan.price) > 0 ? nextBillingDate : null,
          monthlyPrice: assignment.plan.price,
          billingCycle: assignment.plan.billingCycle,
        },
      });
    });

    // Mark assignment as applied
    await this.prisma.planAssignment.update({
      where: { id: assignmentId },
      data: {
        isApplied: true,
        appliedAt: new Date(),
      },
    });

    // Send notifications about plan assignment
    try {
      const merchant = await this.prisma.merchant.findUnique({
        where: { id: assignment.merchantId },
        include: {
          users: {
            include: {
              user: true,
            },
          },
        },
      });

      if (merchant) {
        const ownerUser = merchant.users.find((u) => u.userId);
        if (ownerUser?.userId) {
          await this.notificationService.notifyPlanAssigned(
            assignment.merchantId,
            merchant.name,
            ownerUser.userId,
            {
              planName: assignment.plan.name,
              assignedBy: assignment.assignedBy || 'Administrator',
              startDate: now,
              endDate: subscriptionEndDate,
            },
          );
        } else {
          // Fallback to email if no Better Auth user
          const ownerWithEmail = merchant.users.find((u) => u.email);
          if (ownerWithEmail?.email) {
            await this.notificationService.notifyPlanAssignedByEmail(
              assignment.merchantId,
              merchant.name,
              ownerWithEmail.email,
              {
                planName: assignment.plan.name,
                assignedBy: assignment.assignedBy || 'Administrator',
                startDate: now,
                endDate: subscriptionEndDate,
              },
            );
          }
        }
      }
    } catch (error) {
      console.error('Failed to send plan assignment notification:', error);
    }
  }

  // Billing Transactions
  async createBillingTransaction(
    createBillingTransactionDto: CreateBillingTransactionDto,
    processedBy?: string,
  ) {
    const {
      merchantId,
      planId,
      subscriptionId,
      billingPeriodStart,
      billingPeriodEnd,
      ...rest
    } = createBillingTransactionDto;

    // Generate unique transaction ID
    const transactionId = await this.generateTransactionId();

    return this.prisma.billingTransaction.create({
      data: {
        ...rest,
        transactionId,
        merchantId,
        planId,
        subscriptionId,
        billingPeriodStart: new Date(billingPeriodStart),
        billingPeriodEnd: new Date(billingPeriodEnd),
        status: TransactionStatus.PENDING,
        processedBy,
      },
      include: {
        merchant: true,
        plan: true,
        subscription: true,
      },
    });
  }

  async getBillingTransactions(merchantId?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = merchantId ? { merchantId } : {};

    const [transactions, total] = await Promise.all([
      this.prisma.billingTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          merchant: true,
          plan: true,
          subscription: true,
        },
      }),
      this.prisma.billingTransaction.count({ where }),
    ]);

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus,
    processedBy?: string,
  ) {
    const transaction = await this.prisma.billingTransaction.findUnique({
      where: { transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return this.prisma.billingTransaction.update({
      where: { transactionId },
      data: {
        status,
        processedAt: new Date(),
        processedBy,
      },
      include: {
        merchant: true,
        plan: true,
        subscription: true,
      },
    });
  }

  // Subscription Management
  async getMerchantSubscription(merchantId: string) {
    // First, try to find an active subscription
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        merchantId,
        status: SubscriptionStatus.ACTIVE,
      },
      include: {
        plan: true,
      },
    });

    // Get current usage data for the merchant
    const currentUsage =
      await this.subscriptionService.getCurrentUsage(merchantId);

    if (subscription) {
      return {
        ...subscription,
        currentUsage,
      };
    }

    // If no subscription found, check if merchant exists and is active
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { id: true, status: true },
    });

    if (!merchant || merchant.status !== 'ACTIVE') {
      return null; // Merchant doesn't exist or is not active
    }

    // Find the free plan to use as default
    const freePlan = await this.prisma.plan.findFirst({
      where: {
        name: 'Free',
        status: PlanStatus.ACTIVE,
      },
    });

    if (!freePlan) {
      return null; // No free plan available
    }

    // Return a virtual subscription for the free plan with real usage data
    return {
      id: `virtual-free-${merchantId}`,
      merchantId,
      planId: freePlan.id,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      endDate: null,
      nextBillingDate: null,
      monthlyPrice: 0,
      billingCycle: BillingCycle.MONTHLY,
      currentUsage,
      createdAt: new Date(),
      updatedAt: new Date(),
      cancelledAt: null,
      cancelledBy: null,
      cancellationReason: null,
      plan: freePlan,
    };
  }

  async getPlanStatistics() {
    const plans = await this.prisma.plan.findMany({
      where: { status: PlanStatus.ACTIVE },
      include: {
        _count: {
          select: {
            subscriptions: {
              where: { status: SubscriptionStatus.ACTIVE },
            },
          },
        },
      },
    });

    // Get total active merchants
    const totalActiveMerchants = await this.prisma.merchant.count({
      where: { status: 'ACTIVE' },
    });

    // Get merchants with active subscriptions
    const merchantsWithSubscriptions = await this.prisma.subscription.groupBy({
      by: ['merchantId'],
      where: { status: SubscriptionStatus.ACTIVE },
      _count: true,
    });
    const merchantsWithSubscriptionsCount = merchantsWithSubscriptions.length;

    // Calculate merchants without subscriptions (they use free plan)
    const merchantsWithoutSubscriptions =
      totalActiveMerchants - merchantsWithSubscriptionsCount;

    const totalRevenue = await this.prisma.billingTransaction.aggregate({
      where: { status: TransactionStatus.VERIFIED },
      _sum: { amount: true },
    });

    return {
      plans: plans.map((plan) => {
        const explicitSubscribers = plan._count.subscriptions;
        // Add merchants without subscriptions to the free plan count
        const totalSubscribers =
          plan.name === 'Free'
            ? explicitSubscribers + merchantsWithoutSubscriptions
            : explicitSubscribers;

        return {
          ...plan,
          activeSubscribers: totalSubscribers,
          monthlyRevenue: Number(plan.price) * explicitSubscribers, // Only count paid subscriptions for revenue
        };
      }),
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }

  async getMerchantUsageStatistics(merchantId: string) {
    const subscriptionService =
      new (require('../../common/services/subscription.service').SubscriptionService)(
        this.prisma,
      );
    return subscriptionService.getUsageStatistics(merchantId);
  }

  async getMerchantsForPlan(
    planId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const skip = (page - 1) * limit;

    if (plan.name === 'Free') {
      // For free plan, get merchants with explicit free subscriptions AND merchants without any subscription
      const [
        merchantsWithFreeSubscription,
        merchantsWithoutSubscription,
        totalWithFree,
        totalWithoutSub,
      ] = await Promise.all([
        // Merchants with explicit free plan subscriptions
        this.prisma.merchant.findMany({
          where: {
            status: 'ACTIVE',
            subscriptions: {
              some: {
                planId,
                status: SubscriptionStatus.ACTIVE,
              },
            },
          },
          include: {
            subscriptions: {
              where: {
                planId,
                status: SubscriptionStatus.ACTIVE,
              },
              include: { plan: true },
            },
          },
          skip,
          take: limit,
        }),
        // Merchants without any active subscription
        this.prisma.merchant.findMany({
          where: {
            status: 'ACTIVE',
            subscriptions: {
              none: {
                status: SubscriptionStatus.ACTIVE,
              },
            },
          },
          skip: Math.max(
            0,
            skip -
              (await this.prisma.merchant.count({
                where: {
                  status: 'ACTIVE',
                  subscriptions: {
                    some: {
                      planId,
                      status: SubscriptionStatus.ACTIVE,
                    },
                  },
                },
              })),
          ),
          take: Math.max(
            0,
            limit -
              (await this.prisma.merchant.count({
                where: {
                  status: 'ACTIVE',
                  subscriptions: {
                    some: {
                      planId,
                      status: SubscriptionStatus.ACTIVE,
                    },
                  },
                },
              })),
          ),
        }),
        // Count merchants with explicit free subscriptions
        this.prisma.merchant.count({
          where: {
            status: 'ACTIVE',
            subscriptions: {
              some: {
                planId,
                status: SubscriptionStatus.ACTIVE,
              },
            },
          },
        }),
        // Count merchants without any subscription
        this.prisma.merchant.count({
          where: {
            status: 'ACTIVE',
            subscriptions: {
              none: {
                status: SubscriptionStatus.ACTIVE,
              },
            },
          },
        }),
      ]);

      // Combine and format the results
      const allMerchants = [
        ...merchantsWithFreeSubscription.map((merchant) => ({
          ...merchant,
          subscription: merchant.subscriptions[0] || null,
          subscriptionType: 'explicit' as const,
        })),
        ...merchantsWithoutSubscription.map((merchant) => ({
          ...merchant,
          subscription: {
            id: `virtual-free-${merchant.id}`,
            merchantId: merchant.id,
            planId: plan.id,
            status: SubscriptionStatus.ACTIVE,
            startDate: merchant.createdAt,
            endDate: null,
            nextBillingDate: null,
            monthlyPrice: 0,
            billingCycle: BillingCycle.MONTHLY,
            currentUsage: null,
            createdAt: merchant.createdAt,
            updatedAt: merchant.updatedAt,
            cancelledAt: null,
            cancelledBy: null,
            cancellationReason: null,
            plan,
          },
          subscriptionType: 'virtual' as const,
        })),
      ];

      return {
        data: allMerchants.slice(0, limit),
        pagination: {
          page,
          limit,
          total: totalWithFree + totalWithoutSub,
          totalPages: Math.ceil((totalWithFree + totalWithoutSub) / limit),
        },
      };
    } else {
      // For paid plans, only get merchants with explicit subscriptions
      const [merchants, total] = await Promise.all([
        this.prisma.merchant.findMany({
          where: {
            status: 'ACTIVE',
            subscriptions: {
              some: {
                planId,
                status: SubscriptionStatus.ACTIVE,
              },
            },
          },
          include: {
            subscriptions: {
              where: {
                planId,
                status: SubscriptionStatus.ACTIVE,
              },
              include: { plan: true },
            },
          },
          skip,
          take: limit,
        }),
        this.prisma.merchant.count({
          where: {
            status: 'ACTIVE',
            subscriptions: {
              some: {
                planId,
                status: SubscriptionStatus.ACTIVE,
              },
            },
          },
        }),
      ]);

      return {
        data: merchants.map((merchant) => ({
          ...merchant,
          subscription: merchant.subscriptions[0] || null,
          subscriptionType: 'explicit' as const,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
  }

  // Helper Methods
  private async generateTransactionId() {
    const year = new Date().getFullYear();
    const count = await this.prisma.billingTransaction.count({
      where: {
        transactionId: {
          startsWith: `TXN-${year}-`,
        },
      },
    });

    return `TXN-${year}-${String(count + 1).padStart(3, '0')}`;
  }

  // Direct Subscription Management (Industry Standard Approach)
  async upgradeSubscriptionDirect(
    merchantId: string,
    planId: string,
    paymentReference?: string,
    paymentMethod?: string,
    assignedBy?: string,
  ) {
    // Validate merchant exists
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Validate plan exists and is active
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (plan.status !== PlanStatus.ACTIVE) {
      throw new BadRequestException('Cannot upgrade to inactive plan');
    }

    // Check if merchant already has this plan active
    const currentSubscription = await this.prisma.subscription.findFirst({
      where: {
        merchantId,
        status: SubscriptionStatus.ACTIVE,
      },
      include: {
        plan: true,
      },
    });

    if (currentSubscription && currentSubscription.planId === planId) {
      throw new BadRequestException(
        'Merchant already has an active subscription to this plan',
      );
    }

    // Calculate dates
    const now = new Date();
    const nextBillingDate = new Date();
    let subscriptionEndDate: Date | null = null;

    // For paid plans, calculate based on billing cycle
    if (Number(plan.price) > 0) {
      subscriptionEndDate = new Date();
      if (plan.billingCycle === BillingCycle.MONTHLY) {
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      } else if (plan.billingCycle === BillingCycle.YEARLY) {
        subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      } else if (plan.billingCycle === BillingCycle.WEEKLY) {
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 7);
        nextBillingDate.setDate(nextBillingDate.getDate() + 7);
      } else if (plan.billingCycle === BillingCycle.DAILY) {
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 1);
        nextBillingDate.setDate(nextBillingDate.getDate() + 1);
      }
    }

    // Use atomic transaction to ensure consistency
    const result = await this.prisma.$transaction(async (tx) => {
      // Cancel existing active subscription
      if (currentSubscription) {
        await tx.subscription.update({
          where: { id: currentSubscription.id },
          data: {
            status: SubscriptionStatus.CANCELLED,
            cancelledAt: new Date(),
            cancelledBy: assignedBy || 'system',
            cancellationReason: 'Upgraded to new plan',
          },
        });
      }

      // Create new subscription
      const newSubscription = await tx.subscription.create({
        data: {
          merchantId,
          planId,
          status: SubscriptionStatus.ACTIVE,
          startDate: now,
          endDate: subscriptionEndDate,
          nextBillingDate: Number(plan.price) > 0 ? nextBillingDate : null,
          monthlyPrice: plan.price,
          billingCycle: plan.billingCycle,
        },
        include: {
          plan: true,
        },
      });

      // Create billing transaction if it's a paid plan
      let billingTransaction: any = null;
      if (Number(plan.price) > 0) {
        const billingPeriodStart = now;
        const billingPeriodEnd = subscriptionEndDate || nextBillingDate;

        // Generate unique transaction ID within transaction context
        const year = new Date().getFullYear();
        const count = await tx.billingTransaction.count({
          where: {
            transactionId: {
              startsWith: `TXN-${year}-`,
            },
          },
        });
        const transactionId = `TXN-${year}-${String(count + 1).padStart(3, '0')}`;

        // Create billing transaction within the same transaction context
        billingTransaction = await tx.billingTransaction.create({
          data: {
            transactionId,
            merchantId,
            planId,
            subscriptionId: newSubscription.id,
            amount: Number(plan.price),
            paymentReference: paymentReference || undefined,
            paymentMethod:
              paymentMethod ||
              (assignedBy ? 'Admin Assignment' : 'Self Upgrade'),
            billingPeriodStart: billingPeriodStart,
            billingPeriodEnd: billingPeriodEnd,
            status: TransactionStatus.PENDING,
            processedBy: assignedBy || 'system',
            notes: assignedBy
              ? `Admin upgrade by ${assignedBy}`
              : 'Merchant self-upgrade',
          },
          include: {
            merchant: true,
            plan: true,
            subscription: true,
          },
        });
      }

      return {
        subscription: newSubscription,
        billingTransaction,
        previousSubscription: currentSubscription,
      };
    });

    // Send notifications about subscription renewal/upgrade
    try {
      const merchant = await this.prisma.merchant.findUnique({
        where: { id: merchantId },
        include: {
          users: {
            include: {
              user: true,
            },
          },
        },
      });

      if (merchant) {
        const ownerUser = merchant.users.find((u) => u.userId);
        if (ownerUser?.userId) {
          await this.notificationService.notifySubscriptionRenewed(
            merchantId,
            merchant.name,
            ownerUser.userId,
            {
              planName: plan.name,
              startDate: now,
              endDate: subscriptionEndDate,
              amount: Number(plan.price),
            },
          );
        } else {
          // Fallback to email if no Better Auth user
          const ownerWithEmail = merchant.users.find((u) => u.email);
          if (ownerWithEmail?.email) {
            await this.notificationService.notifySubscriptionRenewedByEmail(
              merchantId,
              merchant.name,
              ownerWithEmail.email,
              {
                planName: plan.name,
                startDate: now,
                endDate: subscriptionEndDate,
                amount: Number(plan.price),
              },
            );
          }
        }
      }
    } catch (error) {
      console.error('Failed to send subscription renewal notification:', error);
    }

    return result;
  }

  // Get pending assignments for a merchant (for admin interface)
  async getPendingAssignments(merchantId?: string) {
    const where: any = {
      isApplied: false,
    };

    if (merchantId) {
      where.merchantId = merchantId;
    }

    return this.prisma.planAssignment.findMany({
      where,
      include: {
        merchant: true,
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Pricing Receiver Accounts Management
  async createPricingReceiver(
    createPricingReceiverDto: CreatePricingReceiverDto,
  ) {
    const { provider, receiverAccount, receiverName, receiverLabel, status } =
      createPricingReceiverDto;

    // Check if receiver account already exists for this provider
    const existingReceiver =
      await this.prisma.pricingReceiverAccount.findUnique({
        where: {
          pricing_receiver_unique: {
            provider,
            receiverAccount,
          },
        },
      });

    if (existingReceiver) {
      throw new BadRequestException(
        `Receiver account ${receiverAccount} already exists for ${provider}`,
      );
    }

    return this.prisma.pricingReceiverAccount.create({
      data: {
        provider,
        receiverAccount,
        receiverName,
        receiverLabel,
        status: status || 'ACTIVE',
      },
    });
  }

  async getPricingReceivers() {
    return this.prisma.pricingReceiverAccount.findMany({
      orderBy: [
        { status: 'asc' }, // ACTIVE first
        { provider: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async getPricingReceiver(id: string) {
    const receiver = await this.prisma.pricingReceiverAccount.findUnique({
      where: { id },
    });

    if (!receiver) {
      throw new NotFoundException('Pricing receiver account not found');
    }

    return receiver;
  }

  async updatePricingReceiver(
    id: string,
    updatePricingReceiverDto: UpdatePricingReceiverDto,
  ) {
    const receiver = await this.getPricingReceiver(id);

    const { provider, receiverAccount, receiverName, receiverLabel, status } =
      updatePricingReceiverDto;

    // Check if the new combination already exists (if changed)
    if (
      provider !== receiver.provider ||
      receiverAccount !== receiver.receiverAccount
    ) {
      const existingReceiver =
        await this.prisma.pricingReceiverAccount.findUnique({
          where: {
            pricing_receiver_unique: {
              provider,
              receiverAccount,
            },
          },
        });

      if (existingReceiver && existingReceiver.id !== id) {
        throw new BadRequestException(
          `Receiver account ${receiverAccount} already exists for ${provider}`,
        );
      }
    }

    return this.prisma.pricingReceiverAccount.update({
      where: { id },
      data: {
        provider,
        receiverAccount,
        receiverName,
        receiverLabel,
        status,
      },
    });
  }

  async deletePricingReceiver(id: string) {
    const receiver = await this.getPricingReceiver(id);

    // Check if receiver is being used by any billing transactions
    const transactionCount = await this.prisma.billingTransaction.count({
      where: { receiverAccountId: id },
    });

    if (transactionCount > 0) {
      throw new BadRequestException(
        `Cannot delete receiver account. It is referenced by ${transactionCount} billing transaction(s)`,
      );
    }

    await this.prisma.pricingReceiverAccount.delete({
      where: { id },
    });

    return { success: true };
  }

  // Get active pricing receivers for a specific provider
  async getActivePricingReceiversByProvider(provider: string) {
    return this.prisma.pricingReceiverAccount.findMany({
      where: {
        provider: provider as any,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get all active pricing receivers
  async getAllActivePricingReceivers() {
    return this.prisma.pricingReceiverAccount.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: [{ provider: 'asc' }, { createdAt: 'desc' }],
    });
  }

  // Verify pricing payment
  async verifyPricingPayment(
    verifyPricingPaymentDto: VerifyPricingPaymentDto,
    verifiedBy?: string,
  ) {
    const {
      transactionId,
      provider,
      paymentReference,
      receiverAccountId,
      notes,
    } = verifyPricingPaymentDto;

    // Find the billing transaction
    const billingTransaction = await this.prisma.billingTransaction.findUnique({
      where: { transactionId },
      include: {
        merchant: true,
        plan: true,
        subscription: true,
      },
    });

    if (!billingTransaction) {
      throw new NotFoundException('Billing transaction not found');
    }

    if (billingTransaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Transaction is not in pending status');
    }

    // Verify receiver account exists and is active
    const receiverAccount = await this.prisma.pricingReceiverAccount.findUnique(
      {
        where: { id: receiverAccountId },
      },
    );

    if (!receiverAccount) {
      throw new NotFoundException('Receiver account not found');
    }

    if (receiverAccount.status !== 'ACTIVE') {
      throw new BadRequestException('Receiver account is not active');
    }

    if (receiverAccount.provider !== provider) {
      throw new BadRequestException('Provider mismatch with receiver account');
    }

    // TODO: Integrate with actual bank verification API
    // For now, we'll simulate verification based on reference format
    let verificationResult = {
      success: false,
      amount: 0,
      reference: paymentReference,
      receiverAccount: receiverAccount.receiverAccount,
      message: 'Verification failed',
    };

    // Simple validation for CBE references (starts with FT)
    if (provider === 'CBE' && paymentReference.startsWith('FT')) {
      verificationResult = {
        success: true,
        amount: Number(billingTransaction.amount),
        reference: paymentReference,
        receiverAccount: receiverAccount.receiverAccount,
        message: 'Payment verified successfully',
      };
    }

    // Update billing transaction with verification result
    const updatedTransaction = await this.prisma.billingTransaction.update({
      where: { id: billingTransaction.id },
      data: {
        status: verificationResult.success
          ? TransactionStatus.VERIFIED
          : TransactionStatus.FAILED,
        paymentReference,
        receiverAccountId,
        verifiedAt: verificationResult.success ? new Date() : null,
        verificationPayload: verificationResult,
        mismatchReason: verificationResult.success
          ? null
          : verificationResult.message,
        processedAt: new Date(),
        processedBy: verifiedBy || 'system',
        notes:
          notes ||
          (verificationResult.success
            ? 'Payment verified successfully'
            : 'Payment verification failed'),
      },
      include: {
        merchant: true,
        plan: true,
        subscription: true,
        receiverAccount: true,
      },
    });

    // If verification successful, activate the subscription
    if (verificationResult.success && billingTransaction.subscriptionId) {
      await this.prisma.subscription.update({
        where: { id: billingTransaction.subscriptionId },
        data: {
          status: SubscriptionStatus.ACTIVE,
        },
      });
    }

    return {
      transaction: updatedTransaction,
      verification: verificationResult,
    };
  }

  // Cancel pending assignment
  async cancelPendingAssignment(assignmentId: string, cancelledBy: string) {
    const assignment = await this.prisma.planAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.isApplied) {
      throw new BadRequestException('Cannot cancel already applied assignment');
    }

    await this.prisma.planAssignment.delete({
      where: { id: assignmentId },
    });

    return { message: 'Assignment cancelled successfully' };
  }
}
