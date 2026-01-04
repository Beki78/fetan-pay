import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from '../auth';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from '../config/database.config';
import { EmailService } from './modules/email/email.service';
import { VerifierModule } from './modules/verifier/verifier.module';
import { PrismaModule } from '../database/prisma.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { MerchantsModule } from './modules/merchants/merchants.module';
import { MerchantUsersModule } from './modules/merchant-users/merchant-users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    BetterAuthModule.forRoot({ auth }),
    VerifierModule,
    PrismaModule,
    TransactionsModule,
    MerchantsModule,
    MerchantUsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, EmailService],
})
export class AppModule {}
