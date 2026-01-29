import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { AssignPlanDto } from './dto/assign-plan.dto';
import { CreateBillingTransactionDto } from './dto/create-billing-transaction.dto';
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
  constructor(private readonly prisma: PrismaService) {}

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
        ...createPlanDto,
        createdBy,
        status: PlanStatus.ACTIVE,
      },
    });
  }

  async getPlans(query: PlanQueryDto) {
    const {
      status,
      search,
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
        isApplied: assignmentType === PlanAssignmentType.IMMEDIATE,
      },
      include: {
        merchant: true,
        plan: true,
      },
    });

    // If immediate assignment, create/update subscription
    if (assignmentType === PlanAssignmentType.IMMEDIATE) {
      await this.applyPlanAssignment(assignment.id);
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

    // Cancel existing active subscription
    await this.prisma.subscription.updateMany({
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

    // Create new subscription
    const nextBillingDate = new Date();
    if (assignment.plan.billingCycle === BillingCycle.MONTHLY) {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else if (assignment.plan.billingCycle === BillingCycle.YEARLY) {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }

    await this.prisma.subscription.create({
      data: {
        merchantId: assignment.merchantId,
        planId: assignment.planId,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        endDate: assignment.endDate,
        nextBillingDate:
          Number(assignment.plan.price) > 0 ? nextBillingDate : null,
        monthlyPrice: assignment.plan.price,
        billingCycle: assignment.plan.billingCycle,
      },
    });

    // Mark assignment as applied
    await this.prisma.planAssignment.update({
      where: { id: assignmentId },
      data: {
        isApplied: true,
        appliedAt: new Date(),
      },
    });
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

    if (subscription) {
      return subscription;
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

    // Return a virtual subscription for the free plan
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
      currentUsage: null,
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
}
