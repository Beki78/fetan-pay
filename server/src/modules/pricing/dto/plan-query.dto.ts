import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { PlanStatus } from '@prisma/client';

export class PlanQueryDto {
  @ApiProperty({
    description: 'Filter by plan status',
    enum: PlanStatus,
    required: false,
  })
  @IsEnum(PlanStatus)
  @IsOptional()
  status?: PlanStatus;

  @ApiProperty({
    description: 'Search by plan name or description',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @IsOptional()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    description: 'Sort by field',
    example: 'displayOrder',
    required: false,
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'displayOrder';

  @ApiProperty({
    description: 'Sort order',
    example: 'asc',
    required: false,
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'asc';
}
