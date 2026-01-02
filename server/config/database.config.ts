import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  logging: process.env.NODE_ENV === 'development',
}));
