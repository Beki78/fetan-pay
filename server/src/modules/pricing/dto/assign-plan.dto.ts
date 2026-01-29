import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { PlanAssignmentType, PlanDurationType } from '@prisma/client';

export class AssignPlanDto {
  @ApiProperty({ description: 'Merchant ID to assign plan to' })
  @IsString()
  merchantId: string;

  @ApiProperty({ description: 'Plan ID to assign' })
  @IsString()
  planId: string;

  @ApiProperty({
    description: 'Assignment type',
    enum: PlanAssignmentType,
    example: PlanAssignmentType.IMMEDIATE,
    required: false,
  })
  @IsEnum(PlanAssignmentType)
  @IsOptional()
  assignmentType?: PlanAssignmentType = PlanAssignmentType.IMMEDIATE;

  @ApiProperty({
    description:
      'Scheduled date for plan application (required for SCHEDULED type)',
    example: '2024-02-01T00:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  scheduledDate?: string;

  @ApiProperty({
    description: 'Duration type',
    enum: PlanDurationType,
    example: PlanDurationType.PERMANENT,
    required: false,
  })
  @IsEnum(PlanDurationType)
  @IsOptional()
  durationType?: PlanDurationType = PlanDurationType.PERMANENT;

  @ApiProperty({
    description: 'End date for temporary assignments',
    example: '2024-12-31T23:59:59Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: 'Admin notes about the assignment',
    example: 'Special promotional plan for Q1',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
