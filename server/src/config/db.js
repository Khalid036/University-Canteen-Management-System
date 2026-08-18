import { PrismaClient } from '../../generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from './env.js';

const adapter = new PrismaPg({ connectionString: config.databaseUrl });

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({ adapter });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      adapter,
      log: ['error', 'warn']
    });
  }
  prisma = global.prisma;
}

export default prisma;