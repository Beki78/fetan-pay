import { ApiPropertyOptional } from '@nestjs/swagger';
import * as PrismaClient from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const paymentVerificationStatuses = ['PENDING', 'VERIFIED', 'UNVERIFIED'] as const;
export type PaymentVerificationStatus = (typeof paymentVerificationStatuses)[number];

export class ListVerificationHistoryDto {
	@ApiPropertyOptional({ enum: PrismaClient.TransactionProvider })
	@IsOptional()
	@IsEnum(PrismaClient.TransactionProvider)
	provider?: PrismaClient.TransactionProvider;

		@ApiPropertyOptional({ enum: paymentVerificationStatuses })
	@IsOptional()
		@IsIn(paymentVerificationStatuses)
		status?: PaymentVerificationStatus;

	@ApiPropertyOptional({ description: 'Exact transaction reference' })
	@IsOptional()
	@IsString()
	reference?: string;

	@ApiPropertyOptional({ description: 'ISO date string (inclusive)' })
	@IsOptional()
	@IsString()
	from?: string;

	@ApiPropertyOptional({ description: 'ISO date string (inclusive)' })
	@IsOptional()
	@IsString()
	to?: string;

	@ApiPropertyOptional({ default: 1, minimum: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	pageSize?: number = 20;
}

