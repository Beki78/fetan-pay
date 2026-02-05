import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { CreatePlanDto } from './create-plan.dto';
import { PlanStatus } from '@prisma/client';

export class UpdatePlanDto extends PartialType(CreatePlanDto) {
  @ApiProperty({
    description: 'Plan status',
    enum: PlanStatus,
    example: PlanStatus.ACTIVE,
    required: false,
  })
  @IsEnum(PlanStatus)
  @IsOptional()
  status?: PlanStatus;
}
