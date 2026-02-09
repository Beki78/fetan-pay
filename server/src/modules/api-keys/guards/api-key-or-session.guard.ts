import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard';
import { ApiKeysService } from '../api-keys.service';

/**
 * Guard that allows either API key authentication OR session authentication
 * Checks for API key first, then falls back to session auth (handled by Better Auth)
 */
@Injectable()
export class ApiKeyOrSessionGuard implements CanActivate {
  private apiKeyGuard: ApiKeyGuard;

  constructor(apiKeysService: ApiKeysService) {
    this.apiKeyGuard = new ApiKeyGuard(apiKeysService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // If Authorization header with Bearer token exists, try API key auth
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        // Try API key authentication
        return await this.apiKeyGuard.canActivate(context);
      } catch (error) {
        // If it's an IP whitelisting error, don't fall back to session auth
        // Re-throw the ForbiddenException so the user gets the proper error message
        if (error instanceof ForbiddenException) {
          throw error;
        }
        // For other API key errors, fall through to session auth
        // Better Auth will handle session authentication
      }
    }

    // Fall back to session authentication (handled by Better Auth middleware)
    // Better Auth populates req.user when there's a valid session
    // Check if session exists
    if (!request.user || !request.user.id) {
      throw new UnauthorizedException('Unauthorized');
    }

    return true;
  }
}
