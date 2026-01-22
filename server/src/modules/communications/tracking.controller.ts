import { Controller, Get, Post, Query, Param, Req, Res, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import type { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';

@ApiTags('email-tracking')
@Controller('tracking')
export class TrackingController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('open/:trackingId')
  @AllowAnonymous()
  @ApiOperation({
    summary: 'Track email open',
    description: 'Track when an email is opened via pixel tracking. Returns a 1x1 transparent pixel.',
  })
  @ApiParam({
    name: 'trackingId',
    description: 'Unique tracking ID for the email',
    example: 'abc123def456',
  })
  @ApiResponse({
    status: 200,
    description: 'Tracking pixel returned',
  })
  async trackOpen(
    @Param('trackingId') trackingId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Extract client info
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Track the open event asynchronously
    this.analyticsService.trackEmailOpen(trackingId, userAgent, ipAddress).catch(error => {
      console.error('Failed to track email open:', error);
    });

    // Return 1x1 transparent pixel
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': pixel.length.toString(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });

    res.send(pixel);
  }

  @Get('click/:trackingId')
  @AllowAnonymous()
  @ApiOperation({
    summary: 'Track email click and redirect',
    description: 'Track when a link in an email is clicked and redirect to the target URL.',
  })
  @ApiParam({
    name: 'trackingId',
    description: 'Unique tracking ID for the email',
    example: 'abc123def456',
  })
  @ApiQuery({
    name: 'url',
    description: 'Target URL to redirect to',
    example: 'https://admin.fetanpay.et',
  })
  @ApiQuery({
    name: 'text',
    description: 'Link text that was clicked',
    required: false,
    example: 'Login to Dashboard',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to target URL',
  })
  async trackClick(
    @Param('trackingId') trackingId: string,
    @Query('url') url: string,
    @Query('text') linkText: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Extract client info
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Track the click event asynchronously
    this.analyticsService.trackEmailClick(trackingId, url, linkText, userAgent, ipAddress).catch(error => {
      console.error('Failed to track email click:', error);
    });

    // Redirect to the target URL
    res.redirect(302, url);
  }

  @Get('unsubscribe/:trackingId')
  @AllowAnonymous()
  @ApiOperation({
    summary: 'Unsubscribe page',
    description: 'Display unsubscribe confirmation page.',
  })
  @ApiParam({
    name: 'trackingId',
    description: 'Unique tracking ID for the email',
    example: 'abc123def456',
  })
  @ApiResponse({
    status: 200,
    description: 'Unsubscribe page HTML',
  })
  async showUnsubscribePage(
    @Param('trackingId') trackingId: string,
    @Res() res: Response,
  ) {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unsubscribe - FetanPay</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .container { text-align: center; }
          .logo { font-size: 24px; font-weight: bold; color: #4F46E5; margin-bottom: 30px; }
          .form { background: #f8fafc; padding: 30px; border-radius: 8px; margin: 20px 0; }
          .button { background: #ef4444; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; }
          .button:hover { background: #dc2626; }
          .reason { margin: 20px 0; }
          .reason textarea { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">FetanPay</div>
          <h1>Unsubscribe from Email Communications</h1>
          <p>We're sorry to see you go. You can unsubscribe from our email communications below.</p>
          
          <div class="form">
            <form id="unsubscribeForm">
              <div class="reason">
                <label for="reason">Reason for unsubscribing (optional):</label><br>
                <textarea id="reason" name="reason" rows="3" placeholder="Help us improve by telling us why you're unsubscribing..."></textarea>
              </div>
              <button type="submit" class="button">Unsubscribe</button>
            </form>
          </div>
          
          <p><small>You will no longer receive marketing emails from FetanPay. You may still receive important account-related notifications.</small></p>
        </div>

        <script>
          document.getElementById('unsubscribeForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const reason = document.getElementById('reason').value;
            
            try {
              const response = await fetch('/api/v1/tracking/unsubscribe/${trackingId}', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
              });
              
              if (response.ok) {
                document.querySelector('.form').innerHTML = '<h2 style="color: #10b981;">Successfully Unsubscribed</h2><p>You have been removed from our mailing list.</p>';
              } else {
                alert('Failed to unsubscribe. Please try again.');
              }
            } catch (error) {
              alert('Failed to unsubscribe. Please try again.');
            }
          });
        </script>
      </body>
      </html>
    `;

    res.set('Content-Type', 'text/html');
    res.send(html);
  }

  @Post('unsubscribe/:trackingId')
  @AllowAnonymous()
  @ApiOperation({
    summary: 'Process unsubscribe request',
    description: 'Process an unsubscribe request and add email to suppression list.',
  })
  @ApiParam({
    name: 'trackingId',
    description: 'Unique tracking ID for the email',
    example: 'abc123def456',
  })
  @ApiResponse({
    status: 200,
    description: 'Unsubscribe processed successfully',
  })
  async processUnsubscribe(
    @Param('trackingId') trackingId: string,
    @Body() body: { reason?: string },
    @Req() req: Request,
  ) {
    // Extract client info
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Process the unsubscribe
    await this.analyticsService.handleUnsubscribe(trackingId, body.reason, userAgent, ipAddress);

    return { success: true, message: 'Successfully unsubscribed' };
  }
}