import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
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
        // If API key auth fails, fall through to session auth
        // Better Auth will handle session authentication
      }
    }

    // Fall back to session authentication (handled by Better Auth middleware)
    // If no session exists, Better Auth will return 401
    return true;
  }
}
