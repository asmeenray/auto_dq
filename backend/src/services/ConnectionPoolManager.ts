import { Pool } from 'pg';
import * as snowflake from 'snowflake-sdk';
import { DatabaseConnection } from './DatabaseConnector';

interface PoolKey {
  type: string;
  host: string;
  port: number;
  database: string;
  username: string;
}

class ConnectionPoolManager {
  private static instance: ConnectionPoolManager;
  private pgPools = new Map<string, Pool>();
  private snowflakeConnections = new Map<string, any>();

  static getInstance(): ConnectionPoolManager {
    if (!this.instance) {
      this.instance = new ConnectionPoolManager();
    }
    return this.instance;
  }

  private createPoolKey(config: DatabaseConnection): string {
    return `${config.type}:${config.host}:${config.port}:${config.database}:${config.username}`;
  }

  async getPostgresPool(config: DatabaseConnection): Promise<Pool> {
    const key = this.createPoolKey(config);
    
    if (!this.pgPools.has(key)) {
      const pool = new Pool({
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.username,
        password: config.password,
        max: 5, // Maximum connections in pool
        idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
        connectionTimeoutMillis: 10000, // Timeout for new connections
        ssl: {
          rejectUnauthorized: false
        }
      });

      // Handle pool errors
      pool.on('error', (err) => {
        console.error('💥 PostgreSQL pool error:', err);
        this.pgPools.delete(key);
      });

      this.pgPools.set(key, pool);
      console.log(`📦 Created PostgreSQL pool for ${key}`);
    }

    return this.pgPools.get(key)!;
  }

  async closeAllPools(): Promise<void> {
    console.log('🧹 Closing all database connection pools...');
    
    // Close PostgreSQL pools
    for (const [key, pool] of this.pgPools.entries()) {
      try {
        await pool.end();
        console.log(`✅ Closed PostgreSQL pool: ${key}`);
      } catch (error) {
        console.error(`❌ Error closing PostgreSQL pool ${key}:`, error);
      }
    }
    this.pgPools.clear();

    // Close Snowflake connections
    for (const [key, connection] of this.snowflakeConnections.entries()) {
      try {
        connection.destroy();
        console.log(`✅ Closed Snowflake connection: ${key}`);
      } catch (error) {
        console.error(`❌ Error closing Snowflake connection ${key}:`, error);
      }
    }
    this.snowflakeConnections.clear();
  }
}

export const connectionPoolManager = ConnectionPoolManager.getInstance();
