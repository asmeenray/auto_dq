import { PrismaClient } from '@prisma/client';

// Singleton Prisma client
class DatabaseManager {
  private static instance: PrismaClient | null = null;

  static getInstance(): PrismaClient {
    if (!this.instance) {
      this.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
      });
    }
    return this.instance;
  }

  static async disconnect(): Promise<void> {
    if (this.instance) {
      await this.instance.$disconnect();
      this.instance = null;
    }
  }
}

export const prisma = DatabaseManager.getInstance();
export const disconnectDatabase = DatabaseManager.disconnect;
