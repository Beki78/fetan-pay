import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import {
  NotificationService,
  NotificationFilters,
} from './notification.service';
import type { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user?: { id: string };
}

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({
    summary: 'Get notifications for current user',
    description:
      'Retrieve paginated list of notifications for the authenticated user',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20)',
  })
  @ApiQuery({
    name: 'unread_only',
    required: false,
    type: Boolean,
    description: 'Show only unread notifications',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    description: 'Filter by notification type',
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    type: String,
    description: 'Filter by priority',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  async getNotifications(
    @Request() req: RequestWithUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('unread_only') unreadOnly?: boolean,
    @Query('type') type?: string,
    @Query('priority') priority?: string,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const filters: NotificationFilters = {};
    if (unreadOnly) filters.unreadOnly = true;
    if (type) filters.type = type as any;
    if (priority) filters.priority = priority as any;

    return this.notificationService.getNotifications(userId, filters, {
      page,
      limit,
    });
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Get unread notification count',
    description:
      'Get the count of unread notifications for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' },
      },
    },
  })
  async getUnreadCount(@Request() req: RequestWithUser) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({
    summary: 'Mark notification as read',
    description:
      'Mark a specific notification as read for the authenticated user',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read successfully',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(@Param('id') id: string, @Request() req: RequestWithUser) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    return this.notificationService.markAsRead(id, userId);
  }

  @Patch('mark-all-read')
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description:
      'Mark all unread notifications as read for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read successfully',
  })
  async markAllAsRead(@Request() req: RequestWithUser) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    return this.notificationService.markAllAsRead(userId);
  }
}
