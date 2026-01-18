import { Controller, Get, Req, ForbiddenException } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { SystemMonitoringService } from './system-monitoring.service';

@ApiTags('system-monitoring')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('system-monitoring')
export class SystemMonitoringController {
  constructor(
    private readonly systemMonitoringService: SystemMonitoringService,
  ) {}

  @Get('metrics')
  @ApiOperation({
    summary: 'Get system metrics (Admin only)',
    description:
      'Retrieves comprehensive system metrics including CPU, memory, disk, network, and process information. Requires admin authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'System metrics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getMetrics(@Req() req: Request) {
    this.requireAdmin(req);
    const metrics = await this.systemMonitoringService.getSystemMetrics();

    // Format the response with human-readable values
    return {
      ...metrics,
      formatted: {
        memory: {
          total: this.systemMonitoringService.formatBytes(metrics.memory.total),
          free: this.systemMonitoringService.formatBytes(metrics.memory.free),
          used: this.systemMonitoringService.formatBytes(metrics.memory.used),
          percentage: `${metrics.memory.percentage.toFixed(2)}%`,
        },
        disk: {
          total: this.systemMonitoringService.formatBytes(metrics.disk.total),
          free: this.systemMonitoringService.formatBytes(metrics.disk.free),
          used: this.systemMonitoringService.formatBytes(metrics.disk.used),
          percentage: `${metrics.disk.percentage.toFixed(2)}%`,
        },
        system: {
          ...metrics.system,
          uptime: this.systemMonitoringService.formatUptime(
            metrics.system.uptime,
          ),
          processUptime: this.systemMonitoringService.formatUptime(
            metrics.system.processUptime,
          ),
        },
        process: {
          ...metrics.process,
          memoryUsage: {
            rss: this.systemMonitoringService.formatBytes(
              metrics.process.memoryUsage.rss,
            ),
            heapTotal: this.systemMonitoringService.formatBytes(
              metrics.process.memoryUsage.heapTotal,
            ),
            heapUsed: this.systemMonitoringService.formatBytes(
              metrics.process.memoryUsage.heapUsed,
            ),
            external: this.systemMonitoringService.formatBytes(
              metrics.process.memoryUsage.external,
            ),
          },
        },
      },
    };
  }

  private requireAdmin(req: Request) {
    interface RequestWithUser extends Request {
      user?: {
        role?: string;
      };
    }
    const requestWithUser = req as RequestWithUser;
    const role = requestWithUser.user?.role;
    if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
      throw new ForbiddenException('Admin role required');
    }
  }
}
