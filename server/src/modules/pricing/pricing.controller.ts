import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';

// Extend Request type to include user from Better Auth
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    name?: string;
  };
}
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { PricingService } from './pricing.service';
import { PricingCleanupService } from './pricing-cleanup.service';
import { SubscriptionExpiryService } from './subscription-expiry.service';
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
import { TransactionStatus } from '@prisma/client';

@ApiTags('pricing')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('pricing')
export class PricingController {
  constructor(
    private readonly pricingService: PricingService,
    private readonly pricingCleanupService: PricingCleanupService,
    private readonly subscriptionExpiryService: SubscriptionExpiryService,
  ) {}

  // Plan Management Endpoints
  @Post('plans')
  @ApiOperation({ summary: 'Create a new pricing plan' })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Plan name already exists' })
  async createPlan(
    @Body() createPlanDto: CreatePlanDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id || 'system'; // Get from Better Auth session
    return this.pricingService.createPlan(createPlanDto, userId);
  }

  @Get('plans')
  @ApiOperation({
    summary: 'Get all pricing plans with filtering and pagination',
  })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  async getPlans(@Query() query: PlanQueryDto) {
    return this.pricingService.getPlans(query);
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get a specific plan by ID' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Plan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async getPlanById(@Param('id') id: string) {
    return this.pricingService.getPlanById(id);
  }

  @Put('plans/:id')
  @ApiOperation({ summary: 'Update a pricing plan' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Plan updated successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({ status: 409, description: 'Plan name already exists' })
  async updatePlan(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    return this.pricingService.updatePlan(id, updatePlanDto);
  }

  @Delete('plans/:id')
  @ApiOperation({ summary: 'Delete a pricing plan' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({ status: 204, description: 'Plan deleted successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete plan with active subscriptions',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePlan(@Param('id') id: string) {
    await this.pricingService.deletePlan(id);
  }

  // Plan Assignment Endpoints
  @Post('plans/assign')
  @ApiOperation({ summary: 'Assign a plan to a merchant' })
  @ApiResponse({ status: 201, description: 'Plan assigned successfully' })
  @ApiResponse({ status: 404, description: 'Merchant or plan not found' })
  @ApiResponse({ status: 400, description: 'Invalid assignment data' })
  async assignPlan(
    @Body() assignPlanDto: AssignPlanDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id || 'system'; // Get from Better Auth session
    return this.pricingService.assignPlan(assignPlanDto, userId);
  }

  @Post('plans/assignments/:id/apply')
  @ApiOperation({ summary: 'Apply a scheduled plan assignment' })
  @ApiParam({ name: 'id', description: 'Plan assignment ID' })
  @ApiResponse({
    status: 200,
    description: 'Plan assignment applied successfully',
  })
  @ApiResponse({ status: 404, description: 'Plan assignment not found' })
  @ApiResponse({ status: 400, description: 'Plan assignment already applied' })
  async applyPlanAssignment(@Param('id') id: string) {
    await this.pricingService.applyPlanAssignment(id);
    return { message: 'Plan assignment applied successfully' };
  }

  // Billing Transaction Endpoints
  @Post('billing/transactions')
  @ApiOperation({ summary: 'Create a billing transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 404, description: 'Merchant or plan not found' })
  async createBillingTransaction(
    @Body() createBillingTransactionDto: CreateBillingTransactionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id || 'system'; // Get from Better Auth session
    return this.pricingService.createBillingTransaction(
      createBillingTransactionDto,
      userId,
    );
  }

  @Get('billing/transactions')
  @ApiOperation({ summary: 'Get billing transactions with pagination' })
  @ApiQuery({
    name: 'merchantId',
    required: false,
    description: 'Filter by merchant ID',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
  })
  async getBillingTransactions(
    @Query('merchantId') merchantId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.pricingService.getBillingTransactions(merchantId, page, limit);
  }

  @Put('billing/transactions/:transactionId/status')
  @ApiOperation({ summary: 'Update billing transaction status' })
  @ApiParam({ name: 'transactionId', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async updateTransactionStatus(
    @Param('transactionId') transactionId: string,
    @Body() body: { status: TransactionStatus },
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id || 'system'; // Get from Better Auth session
    return this.pricingService.updateTransactionStatus(
      transactionId,
      body.status,
      userId,
    );
  }

  // Subscription Endpoints
  @Get('merchants/:merchantId/subscription')
  @ApiOperation({ summary: 'Get merchant current subscription' })
  @ApiParam({ name: 'merchantId', description: 'Merchant ID' })
  @ApiResponse({
    status: 200,
    description:
      'Subscription retrieved successfully (includes virtual free plan for merchants without explicit subscriptions)',
  })
  async getMerchantSubscription(@Param('merchantId') merchantId: string) {
    const subscription =
      await this.pricingService.getMerchantSubscription(merchantId);
    return { subscription };
  }

  @Post('merchants/:merchantId/upgrade')
  @ApiOperation({ summary: 'Upgrade merchant subscription plan' })
  @ApiParam({ name: 'merchantId', description: 'Merchant ID' })
  @ApiResponse({
    status: 201,
    description: 'Plan upgrade initiated successfully',
  })
  async upgradeMerchantPlan(
    @Param('merchantId') merchantId: string,
    @Body()
    body: { planId: string; paymentReference?: string; paymentMethod?: string },
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id || 'system';

    try {
      // Use the new direct upgrade method for better reliability
      const result = await this.pricingService.upgradeSubscriptionDirect(
        merchantId,
        body.planId,
        body.paymentReference,
        body.paymentMethod,
        userId,
      );

      return {
        message: 'Plan upgrade completed successfully',
        subscription: result.subscription,
        billingTransaction: result.billingTransaction,
      };
    } catch (error) {
      // If direct upgrade fails, fall back to assignment method for admin users
      if (
        req.user?.id &&
        error.message.includes('already has an active subscription')
      ) {
        // For same plan upgrades, just return success
        const currentSubscription =
          await this.pricingService.getMerchantSubscription(merchantId);
        if (currentSubscription?.planId === body.planId) {
          return {
            message: 'Merchant already has this plan active',
            subscription: currentSubscription,
          };
        }
      }
      throw error;
    }
  }

  @Get('merchants/:merchantId/trial-status')
  @ApiOperation({ summary: 'Get merchant trial status and remaining days' })
  @ApiParam({ name: 'merchantId', description: 'Merchant ID' })
  @ApiResponse({
    status: 200,
    description: 'Trial status retrieved successfully',
  })
  async getMerchantTrialStatus(@Param('merchantId') merchantId: string) {
    const subscription =
      await this.pricingService.getMerchantSubscription(merchantId);
    const isInTrial =
      subscription?.plan?.name === 'Free' &&
      subscription?.endDate !== null &&
      subscription?.status === 'ACTIVE';

    let daysRemaining: number | null = null;
    if (subscription?.endDate) {
      const now = new Date();
      const endDate = new Date(subscription.endDate);
      const diffTime = endDate.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    const isExpired =
      subscription?.status === 'EXPIRED' ||
      (subscription?.endDate && new Date(subscription.endDate) <= new Date());

    return {
      isInTrial,
      isExpired,
      daysRemaining,
      trialEndDate: subscription?.endDate,
      planName: subscription?.plan?.name,
      subscriptionStatus: subscription?.status,
    };
  }

  @Get('plans/:planId/merchants')
  @ApiOperation({ summary: 'Get merchants for a specific plan' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Merchants retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async getMerchantsForPlan(
    @Param('planId') planId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.pricingService.getMerchantsForPlan(planId, pageNum, limitNum);
  }

  // Statistics Endpoints
  @Get('statistics')
  @ApiOperation({ summary: 'Get pricing system statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getPlanStatistics() {
    return this.pricingService.getPlanStatistics();
  }

  @Get('merchants/:merchantId/usage')
  @ApiOperation({ summary: 'Get merchant usage statistics' })
  @ApiParam({ name: 'merchantId', description: 'Merchant ID' })
  @ApiResponse({
    status: 200,
    description: 'Usage statistics retrieved successfully',
  })
  async getMerchantUsage(@Param('merchantId') merchantId: string) {
    return this.pricingService.getMerchantUsageStatistics(merchantId);
  }

  // Assignment Management Endpoints
  @Get('assignments/pending')
  @ApiOperation({ summary: 'Get pending plan assignments' })
  @ApiQuery({
    name: 'merchantId',
    required: false,
    description: 'Filter by merchant ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Pending assignments retrieved successfully',
  })
  async getPendingAssignments(@Query('merchantId') merchantId?: string) {
    return this.pricingService.getPendingAssignments(merchantId);
  }

  // Pricing Receiver Accounts Management
  @Post('receivers')
  @ApiOperation({ summary: 'Create pricing receiver account' })
  @ApiResponse({
    status: 201,
    description: 'Receiver account created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - receiver account already exists',
  })
  async createPricingReceiver(
    @Body() createPricingReceiverDto: CreatePricingReceiverDto,
  ) {
    return this.pricingService.createPricingReceiver(createPricingReceiverDto);
  }

  @Get('receivers')
  @ApiOperation({ summary: 'Get all pricing receiver accounts' })
  @ApiResponse({
    status: 200,
    description: 'Receiver accounts retrieved successfully',
  })
  async getPricingReceivers() {
    return this.pricingService.getPricingReceivers();
  }

  @Get('receivers/active')
  @AllowAnonymous() // Allow public access for billing modal
  @ApiOperation({ summary: 'Get all active pricing receivers' })
  @ApiResponse({
    status: 200,
    description: 'All active receiver accounts retrieved successfully',
  })
  async getAllActivePricingReceivers() {
    return this.pricingService.getAllActivePricingReceivers();
  }

  @Get('receivers/provider/:provider')
  @ApiOperation({ summary: 'Get active pricing receivers by provider' })
  @ApiResponse({
    status: 200,
    description: 'Receiver accounts retrieved successfully',
  })
  async getActivePricingReceiversByProvider(
    @Param('provider') provider: string,
  ) {
    return this.pricingService.getActivePricingReceiversByProvider(provider);
  }

  @Get('receivers/:id')
  @ApiOperation({ summary: 'Get pricing receiver account by ID' })
  @ApiResponse({
    status: 200,
    description: 'Receiver account retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Receiver account not found' })
  async getPricingReceiver(@Param('id') id: string) {
    return this.pricingService.getPricingReceiver(id);
  }

  @Put('receivers/:id')
  @ApiOperation({ summary: 'Update pricing receiver account' })
  @ApiResponse({
    status: 200,
    description: 'Receiver account updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Receiver account not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - receiver account already exists',
  })
  async updatePricingReceiver(
    @Param('id') id: string,
    @Body() updatePricingReceiverDto: UpdatePricingReceiverDto,
  ) {
    return this.pricingService.updatePricingReceiver(
      id,
      updatePricingReceiverDto,
    );
  }

  @Delete('receivers/:id')
  @ApiOperation({ summary: 'Delete pricing receiver account' })
  @ApiResponse({
    status: 200,
    description: 'Receiver account deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Receiver account not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - receiver account is in use',
  })
  async deletePricingReceiver(@Param('id') id: string) {
    return this.pricingService.deletePricingReceiver(id);
  }

  @Post('verify-payment')
  @ApiOperation({ summary: 'Verify pricing payment' })
  @ApiResponse({ status: 200, description: 'Payment verified successfully' })
  @ApiResponse({
    status: 404,
    description: 'Transaction or receiver account not found',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - invalid transaction status or provider mismatch',
  })
  async verifyPricingPayment(
    @Body() verifyPricingPaymentDto: VerifyPricingPaymentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id || 'system';
    return this.pricingService.verifyPricingPayment(
      verifyPricingPaymentDto,
      userId,
    );
  }

  @Delete('assignments/:assignmentId')
  @ApiOperation({ summary: 'Cancel a pending plan assignment' })
  @ApiParam({ name: 'assignmentId', description: 'Assignment ID' })
  @ApiResponse({
    status: 200,
    description: 'Assignment cancelled successfully',
  })
  async cancelPendingAssignment(
    @Param('assignmentId') assignmentId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id || 'system';
    return this.pricingService.cancelPendingAssignment(assignmentId, userId);
  }

  // Cleanup Endpoints
  @Post('cleanup/assignments')
  @ApiOperation({ summary: 'Manually cleanup stale assignments' })
  @ApiQuery({
    name: 'merchantId',
    required: false,
    description: 'Filter by merchant ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Cleanup completed successfully',
  })
  async manualCleanupAssignments(@Query('merchantId') merchantId?: string) {
    return this.pricingCleanupService.manualCleanup(merchantId);
  }

  // Public Endpoints (for landing page)
  @Get('public/plans')
  @AllowAnonymous() // Allow public access without authentication
  @ApiOperation({
    summary: 'Get active plans for public display (landing page)',
  })
  @ApiResponse({
    status: 200,
    description: 'Public plans retrieved successfully',
  })
  async getPublicPlans() {
    return this.pricingService.getPlans({
      status: 'ACTIVE' as any,
      page: 1,
      limit: 100,
      sortBy: 'displayOrder',
      sortOrder: 'asc',
    });
  }

  // Manual Test Endpoints for Subscription Expiry Notifications
  @Post('test/check-expiring-subscriptions')
  @ApiOperation({
    summary: 'Manually trigger check for expiring subscriptions (for testing)',
  })
  @ApiResponse({
    status: 200,
    description: 'Expiring subscriptions check completed',
  })
  async testCheckExpiringSubscriptions() {
    await this.subscriptionExpiryService.manualCheckExpiringSubscriptions();
    return { message: 'Expiring subscriptions check completed' };
  }

  @Post('test/check-expired-subscriptions')
  @ApiOperation({
    summary: 'Manually trigger check for expired subscriptions (for testing)',
  })
  @ApiResponse({
    status: 200,
    description: 'Expired subscriptions check completed',
  })
  async testCheckExpiredSubscriptions() {
    await this.subscriptionExpiryService.manualCheckExpiredSubscriptions();
    return { message: 'Expired subscriptions check completed' };
  }
}
