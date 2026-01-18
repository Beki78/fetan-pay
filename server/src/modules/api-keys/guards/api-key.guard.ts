import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiKeysService } from '../api-keys.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    // Extract Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid Authorization header format');
    }

    const apiKey = parts[1];

    try {
      // Validate API key and get merchant info
      const validation = await this.apiKeysService.validateApiKey(apiKey);

      // Attach merchant context to request
      // This mimics the session-based auth structure
      (request as any).merchantId = validation.merchantId;
      (request as any).apiKeyId = validation.apiKeyId;
      (request as any).apiKeyScopes = validation.scopes;
      (request as any).authType = 'api_key'; // Flag to distinguish from session auth

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid API key');
    }
  }
}
