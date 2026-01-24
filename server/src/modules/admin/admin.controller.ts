import { Controller, Get, Query, Req, ForbiddenException } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AdminService, type UnifiedPayment } from './admin.service';
import { ListAllPaymentsDto } from './dto/list-all-payments.dto';

@ApiTags('admin')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('payments')
  @ApiOperation({
    summary: 'List all payments and transactions (Admin only)',
    description:
      'Retrieves a unified list of all payments and transactions across all merchants. Combines data from both Transaction (QR payments) and Payment (cash/bank logged) tables. Requires admin authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Payments retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string', enum: ['transaction', 'payment'] },
              paymentType: { type: 'string', enum: ['QR', 'cash', 'bank'] },
              merchantId: { type: 'string' },
              merchant: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
              provider: { type: 'string', nullable: true },
              reference: { type: 'string' },
              amount: { type: 'number' },
              tipAmount: { type: 'number', nullable: true },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              verifiedAt: { type: 'string', format: 'date-time', nullable: true },
              verifiedBy: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string' },
                },
              },
              payerName: { type: 'string', nullable: true },
              receiverAccount: { type: 'string', nullable: true },
              receiverName: { type: 'string', nullable: true },
              qrUrl: { type: 'string', nullable: true },
              note: { type: 'string', nullable: true },
              receiptUrl: { type: 'string', nullable: true },
            },
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        pageSize: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async listAllPayments(
    @Query() query: ListAllPaymentsDto,
    @Req() req: Request,
  ): Promise<{
    data: UnifiedPayment[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    return this.adminService.listAllPayments(query, req);
  }
}

