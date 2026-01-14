import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: pg.Pool;

  constructor(private configService: ConfigService) {
    const connectionString =
      configService.get<string>('database.url') ?? process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is not set for Prisma connection');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });

    this.pool = pool;

    // Log queries in development
    // Commented out to reduce log noise - uncomment if needed for debugging
    // if (this.configService.get('database.logging')) {
    //   // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    //   (this.$on as any)('query', (e: Prisma.QueryEvent) => {
    //     this.logger.debug(`Query: ${e.query}`);
    //     this.logger.debug(`Params: ${e.params}`);
    //     this.logger.debug(`Duration: ${e.duration}ms`);
    //   });
    // }
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Database connection established successfully');
    } catch (error) {
      this.logger.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    if (this.pool) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await this.pool.end();
    }
    this.logger.log('Database connection closed');
  }

  async cleanDatabase(): Promise<any[]> {
    if (process.env.NODE_ENV === 'production') {
      return [];
    }

    const models = Reflect.ownKeys(this).filter((key) => key[0] !== '_');

    return Promise.all(
      models.map((modelKey) =>
        (
          this[modelKey as string] as { deleteMany: () => Promise<any> }
        ).deleteMany(),
      ),
    );
  }
}
