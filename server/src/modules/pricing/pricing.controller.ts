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
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { AssignPlanDto } from './dto/assign-plan.dto';
import { CreateBillingTransactionDto } from './dto/create-billing-transaction.dto';
import { PlanQueryDto } from './dto/plan-query.dto';
import { TransactionStatus } from '@prisma/client';

@ApiTags('pricing')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

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
}
