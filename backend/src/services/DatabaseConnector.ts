import { Pool, PoolClient } from 'pg'
import * as snowflake from 'snowflake-sdk'
import { connectionPoolManager } from './ConnectionPoolManager'

export interface DatabaseConnection {
  type: 'redshift' | 'snowflake' | 'bigquery';
  host: string;
  port: number;
  database: string;
  schema?: string;
  username: string;
  password: string;
  // Snowflake specific
  warehouse?: string;
  role?: string;
  account?: string;
  // BigQuery specific
  projectId?: string;
  keyFile?: string;
  location?: string;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  error?: string;
}

export class DatabaseConnector {
  /**
   * Test a database connection
   */
  static async testConnection(config: DatabaseConnection): Promise<TestConnectionResult> {
    console.log(`🔌 DatabaseConnector: Testing ${config.type} connection`);
    console.log('Connection config (password hidden):', {
      ...config,
      password: '***'
    });
    
    try {
      if (config.type === 'redshift') {
        return await this.testRedshiftConnection(config)
      } else if (config.type === 'snowflake') {
        return await this.testSnowflakeConnection(config)
      } else if (config.type === 'bigquery') {
        return await this.testBigQueryConnection(config)
      } else {
        return {
          success: false,
          message: 'Unsupported database type',
          error: `Database type "${config.type}" is not supported`
        }
      }
    } catch (error) {
      console.error('💥 DatabaseConnector: Unexpected error:', error);
      return {
        success: false,
        message: 'Connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Test Redshift connection using PostgreSQL driver
   */
  private static async testRedshiftConnection(config: DatabaseConnection): Promise<TestConnectionResult> {
    console.log('🔴 Testing Redshift connection...');
    let pool: Pool | null = null
    let client: PoolClient | null = null

    try {
      console.log('📦 Creating PostgreSQL pool for Redshift...');
      
      // Create connection pool
      pool = new Pool({
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.username,
        password: config.password,
        max: 1, // Only one connection for testing
        idleTimeoutMillis: 5000,
        connectionTimeoutMillis: 10000,
        ssl: {
          rejectUnauthorized: false // Redshift typically uses SSL
        }
      })

      console.log('🔗 Attempting to connect to pool...');
      // Get a client from the pool
      client = await pool.connect()
      console.log('✅ Connected to pool successfully');

      console.log('📊 Executing test query...');
      // Test query
      const result = await client.query('SELECT 1 as test')
      console.log('📋 Query result:', result.rows);
      
      if (result.rows && result.rows.length > 0) {
        console.log('✅ Redshift connection test successful');
        return {
          success: true,
          message: 'Redshift connection successful'
        }
      } else {
        console.log('❌ No data returned from test query');
        return {
          success: false,
          message: 'Connection established but test query failed',
          error: 'No data returned from test query'
        }
      }
    } catch (error) {
      console.error('💥 Redshift connection error:', error);
      return {
        success: false,
        message: 'Redshift connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    } finally {
      // Clean up
      console.log('🧹 Cleaning up connection resources...');
      if (client) {
        client.release()
      }
      if (pool) {
        await pool.end()
      }
    }
  }

  /**
   * Test Snowflake connection
   */
  private static async testSnowflakeConnection(config: DatabaseConnection): Promise<TestConnectionResult> {
    return new Promise((resolve) => {
      try {
        // Create Snowflake connection
        const connection = snowflake.createConnection({
          account: config.account || '',
          username: config.username,
          password: config.password,
          database: config.database,
          schema: config.schema || 'PUBLIC',
          warehouse: config.warehouse || '',
          role: config.role || '',
          // Client session keep alive
          clientSessionKeepAlive: false
        })

        // Connect to Snowflake
        connection.connect((err, conn) => {
          if (err) {
            resolve({
              success: false,
              message: 'Snowflake connection failed',
              error: err.message || 'Connection error'
            })
            return
          }

          // Test query
          conn.execute({
            sqlText: 'SELECT 1 as test',
            complete: (err, stmt, rows) => {
              // Always destroy the connection
              connection.destroy((destroyErr) => {
                if (destroyErr) {
                  console.warn('Warning: Error destroying Snowflake connection:', destroyErr.message)
                }
              })

              if (err) {
                resolve({
                  success: false,
                  message: 'Snowflake test query failed',
                  error: err.message || 'Query error'
                })
                return
              }

              if (rows && rows.length > 0) {
                resolve({
                  success: true,
                  message: 'Snowflake connection successful'
                })
              } else {
                resolve({
                  success: false,
                  message: 'Connection established but test query returned no data',
                  error: 'No data returned from test query'
                })
              }
            }
          })
        })
      } catch (error) {
        resolve({
          success: false,
          message: 'Snowflake connection setup failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    })
  }

  /**
   * Execute a query on a database
   */
  static async executeQuery(config: DatabaseConnection, query: string): Promise<any[]> {
    if (config.type === 'redshift') {
      return await this.executeRedshiftQuery(config, query)
    } else if (config.type === 'snowflake') {
      return await this.executeSnowflakeQuery(config, query)
    } else {
      throw new Error(`Unsupported database type: ${config.type}`)
    }
  }

  /**
   * Execute query on Redshift using connection pool
   */
  private static async executeRedshiftQuery(config: DatabaseConnection, query: string): Promise<any[]> {
    let client: PoolClient | null = null

    try {
      // Get pool from connection manager
      const pool = await connectionPoolManager.getPostgresPool(config);
      client = await pool.connect()
      
      // Set schema if provided
      if (config.schema) {
        await client.query(`SET search_path TO ${config.schema}`)
      }

      const result = await client.query(query)
      return result.rows || []
    } finally {
      if (client) {
        client.release() // Return connection to pool
      }
      // Don't end the pool here - let it be managed by the pool manager
    }
  }

  /**
   * Execute query on Snowflake
   */
  private static async executeSnowflakeQuery(config: DatabaseConnection, query: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const connection = snowflake.createConnection({
        account: config.account || '',
        username: config.username,
        password: config.password,
        database: config.database,
        schema: config.schema || 'PUBLIC',
        warehouse: config.warehouse || '',
        role: config.role || '',
        clientSessionKeepAlive: false
      })

      connection.connect((err, conn) => {
        if (err) {
          reject(new Error(`Snowflake connection failed: ${err.message}`))
          return
        }

        conn.execute({
          sqlText: query,
          complete: (err, stmt, rows) => {
            connection.destroy((destroyErr) => {
              if (destroyErr) {
                console.warn('Warning: Error destroying Snowflake connection:', destroyErr.message)
              }
            })

            if (err) {
              reject(new Error(`Snowflake query failed: ${err.message}`))
              return
            }

            resolve(rows || [])
          }
        })
      })
    })
  }

  /**
   * Test BigQuery connection
   */
  static async testBigQueryConnection(config: DatabaseConnection): Promise<TestConnectionResult> {
    console.log('🔌 DatabaseConnector: Testing BigQuery connection');
    
    try {
      // For now, we'll do basic validation since BigQuery client setup is complex
      // In a real implementation, you'd use @google-cloud/bigquery package
      
      if (!config.projectId) {
        return {
          success: false,
          message: 'BigQuery connection failed',
          error: 'Project ID is required for BigQuery connections'
        }
      }

      if (!config.keyFile) {
        return {
          success: false,
          message: 'BigQuery connection failed',
          error: 'Service Account Key (JSON) is required for BigQuery connections'
        }
      }

      // Validate JSON key format
      try {
        const keyData = JSON.parse(config.keyFile)
        if (!keyData.type || !keyData.project_id || !keyData.private_key_id) {
          throw new Error('Invalid service account key format')
        }
      } catch (parseError) {
        return {
          success: false,
          message: 'BigQuery connection failed',
          error: 'Invalid service account key JSON format'
        }
      }

      // TODO: Implement actual BigQuery connection test
      // const { BigQuery } = require('@google-cloud/bigquery');
      // const bigquery = new BigQuery({
      //   projectId: config.projectId,
      //   keyFilename: config.keyFile, // or credentials: JSON.parse(config.keyFile)
      //   location: config.location || 'US'
      // });
      // await bigquery.getDatasets();

      console.log('✅ DatabaseConnector: BigQuery connection validation passed (basic validation only)');
      return {
        success: true,
        message: 'BigQuery connection parameters validated successfully'
      }

    } catch (error) {
      console.error('💥 DatabaseConnector: BigQuery connection failed:', error);
      return {
        success: false,
        message: 'BigQuery connection failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}
