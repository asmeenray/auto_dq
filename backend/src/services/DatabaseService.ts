import mysql from 'mysql2/promise';
import { Client as PgClient } from 'pg';

export interface DatabaseConnection {
  id: string;
  type: 'mysql' | 'postgresql' | 'redshift';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export class DatabaseService {
  private connections: Map<string, any> = new Map();

  async testConnection(connection: DatabaseConnection): Promise<boolean> {
    try {
      switch (connection.type) {
        case 'mysql':
          return await this.testMySQLConnection(connection);
        case 'postgresql':
        case 'redshift':
          return await this.testPostgreSQLConnection(connection);
        default:
          throw new Error(`Unsupported database type: ${connection.type}`);
      }
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  async executeQuery(connectionId: string, query: string): Promise<any[]> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    try {
      if (connection.type === 'mysql') {
        const [rows] = await connection.client.execute(query);
        return Array.isArray(rows) ? rows : [];
      } else {
        const result = await connection.client.query(query);
        return result.rows || [];
      }
    } catch (error) {
      console.error(`Query execution failed for connection ${connectionId}:`, error);
      throw error;
    }
  }

  async getConnection(connectionConfig: DatabaseConnection): Promise<any> {
    const existingConnection = this.connections.get(connectionConfig.id);
    if (existingConnection) {
      return existingConnection;
    }

    let client;
    try {
      switch (connectionConfig.type) {
        case 'mysql':
          client = await mysql.createConnection({
            host: connectionConfig.host,
            port: connectionConfig.port,
            user: connectionConfig.username,
            password: connectionConfig.password,
            database: connectionConfig.database,
            connectTimeout: 10000
          });
          break;
        case 'postgresql':
        case 'redshift':
          client = new PgClient({
            host: connectionConfig.host,
            port: connectionConfig.port,
            user: connectionConfig.username,
            password: connectionConfig.password,
            database: connectionConfig.database,
            connectionTimeoutMillis: 10000
          });
          await client.connect();
          break;
        default:
          throw new Error(`Unsupported database type: ${connectionConfig.type}`);
      }

      const connection = {
        client,
        type: connectionConfig.type,
        config: connectionConfig
      };

      this.connections.set(connectionConfig.id, connection);
      return connection;
    } catch (error) {
      console.error('Failed to create database connection:', error);
      throw error;
    }
  }

  async closeConnection(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (connection) {
      try {
        if (connection.type === 'mysql') {
          await connection.client.end();
        } else {
          await connection.client.end();
        }
        this.connections.delete(connectionId);
      } catch (error) {
        console.error(`Failed to close connection ${connectionId}:`, error);
      }
    }
  }

  private async testMySQLConnection(connection: DatabaseConnection): Promise<boolean> {
    let client;
    try {
      client = await mysql.createConnection({
        host: connection.host,
        port: connection.port,
        user: connection.username,
        password: connection.password,
        database: connection.database,
        connectTimeout: 5000
      });

      // Simple test query
      await client.execute('SELECT 1 as test');
      await client.end();
      
      console.log('MySQL connection test successful:', connection.host);
      return true;
    } catch (error) {
      console.error('MySQL connection test failed:', error);
      if (client) {
        try {
          await client.end();
        } catch (closeError) {
          console.error('Error closing failed MySQL connection:', closeError);
        }
      }
      return false;
    }
  }

  private async testPostgreSQLConnection(connection: DatabaseConnection): Promise<boolean> {
    let client;
    try {
      client = new PgClient({
        host: connection.host,
        port: connection.port,
        user: connection.username,
        password: connection.password,
        database: connection.database,
        connectionTimeoutMillis: 5000
      });

      await client.connect();
      
      // Simple test query
      await client.query('SELECT 1 as test');
      await client.end();
      
      console.log('PostgreSQL connection test successful:', connection.host);
      return true;
    } catch (error) {
      console.error('PostgreSQL connection test failed:', error);
      if (client) {
        try {
          await client.end();
        } catch (closeError) {
          console.error('Error closing failed PostgreSQL connection:', closeError);
        }
      }
      return false;
    }
  }
}
