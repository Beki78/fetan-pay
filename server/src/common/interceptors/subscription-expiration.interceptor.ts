import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SubscriptionService } from '../services/subscription.service';

@Injectable()
export class SubscriptionExpirationInterceptor implements NestInterceptor {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    // Only run for HTTP requests
    if (context.getType() === 'http') {
      // Update expired subscriptions in the background
      // This runs asynchronously and doesn't block the request
      this.subscriptionService.updateExpiredSubscriptions().catch((error) => {
        console.error('Error updating expired subscriptions:', error);
      });
    }

    return next.handle().pipe(
      tap(() => {
        // Optional: Add any post-processing logic here
      }),
    );
  }
}
