import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Import services
import { DatabaseService } from './services/DatabaseService';
import { ExecutionService } from './services/ExecutionService';
import { DatabaseConnector } from './services/DatabaseConnector';

async function initializePrisma() {
  console.log('🔄 Generating Prisma client...');
  try {
    await execAsync('npx prisma generate');
    console.log('✅ Prisma client generated successfully');
  } catch (error) {
    console.warn('⚠️ Prisma generation failed, trying to continue...', error);
  }
}

async function startServer() {
  // Initialize Prisma first
  // await initializePrisma();

  // const prisma = new PrismaClient();
  const app = express();

  // Initialize services
  const databaseService = new DatabaseService();
  const executionService = new ExecutionService();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'autoDQ Backend' });
});

// API Routes
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from autoDQ Backend!' });
});

// Data Sources routes
app.get('/api/data-sources', async (req, res) => {
  try {
    // Mock data for testing (replace with actual database call once DB is working)
    const dataSources = [
      {
        id: '1',
        name: 'Demo Redshift',
        type: 'redshift',
        host: 'demo-cluster.redshift.amazonaws.com',
        port: 5439,
        database: 'demo_db',
        username: 'demo_user',
        createdAt: new Date().toISOString(),
        user: { id: '1', name: 'Demo User', email: 'demo@example.com' },
        indicators: []
      }
    ];
    res.json({ dataSources });
  } catch (error) {
    console.error('Error fetching data sources:', error);
    res.status(500).json({ error: 'Failed to fetch data sources' });
  }
});

app.post('/api/data-sources/test-connection', async (req, res) => {
  try {
    const { type, host, port, database, schema, username, password, warehouse, role, account } = req.body;
    
    // Validate required fields
    if (!type || !host || !port || !database || !username || !password) {
      return res.status(400).json({ error: 'Missing required connection fields' });
    }

    // Test connection using new DatabaseConnector
    const result = await DatabaseConnector.testConnection({
      type: type as 'redshift' | 'snowflake',
      host,
      port: parseInt(port),
      database,
      schema,
      username,
      password,
      warehouse,
      role,
      account
    });

    res.json(result);
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/data-sources', async (req, res) => {
  try {
    const { name, type, host, port, database, schema, username, password, userId, warehouse, role, account } = req.body;
    
    // Validate required fields
    if (!name || !type || !host || !port || !database || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Test connection before saving using new DatabaseConnector
    const connectionTest = await DatabaseConnector.testConnection({
      type: type as 'redshift' | 'snowflake',
      host,
      port: parseInt(port),
      database,
      schema,
      username,
      password,
      warehouse,
      role,
      account
    });

    if (!connectionTest.success) {
      return res.status(400).json({ 
        error: 'Failed to connect to database',
        message: connectionTest.message,
        details: connectionTest.error
      });
    }

    // Mock response for testing (replace with actual database save once DB is working)
    const dataSource = {
      id: Date.now().toString(),
      name,
      type,
      host,
      port: parseInt(port),
      database,
      username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: { id: userId || '1', name: 'Demo User', email: 'demo@example.com' }
    };

    res.status(201).json({ dataSource });
  } catch (error) {
    console.error('Error creating data source:', error);
    res.status(500).json({ error: 'Failed to create data source' });
  }
});

app.put('/api/data-sources/:id', async (req, res) => {
  // Temporarily disabled for testing
  res.status(501).json({ error: 'Database not configured yet' });
});

/*
app.put('/api/data-sources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, host, port, database, username, password } = req.body;

    const dataSource = await prisma.dataSource.update({
      where: { id },
      data: {
        name,
        type,
        host,
        port: port ? parseInt(port) : undefined,
        database,
        username,
        password
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({ dataSource });
  } catch (error) {
    console.error('Error updating data source:', error);
    res.status(500).json({ error: 'Failed to update data source' });
  }
});
*/

app.delete('/api/data-sources/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.dataSource.delete({
      where: { id }
    });

    res.json({ message: 'Data source deleted successfully' });
  } catch (error) {
    console.error('Error deleting data source:', error);
    res.status(500).json({ error: 'Failed to delete data source' });
  }
});

app.post('/api/data-sources/:id/test', async (req, res) => {
  try {
    const { id } = req.params;

    const dataSource = await prisma.dataSource.findUnique({
      where: { id }
    });

    if (!dataSource) {
      return res.status(404).json({ error: 'Data source not found' });
    }

    const success = await databaseService.testConnection({
      id: dataSource.id,
      type: dataSource.type as 'mysql' | 'postgresql' | 'redshift',
      host: dataSource.host,
      port: dataSource.port,
      database: dataSource.database,
      username: dataSource.username,
      password: dataSource.password
    });

    res.json({ success, message: success ? 'Connection successful' : 'Connection failed' });
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({ error: 'Failed to test connection' });
  }
});

// Indicators routes
app.get('/api/indicators', async (req, res) => {
  try {
    const { dataSourceId } = req.query;
    
    const where = dataSourceId ? { dataSourceId: dataSourceId as string } : {};
    
    const indicators = await prisma.indicator.findMany({
      where,
      include: {
        dataSource: {
          select: { id: true, name: true, type: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        },
        executions: {
          orderBy: { executedAt: 'desc' },
          take: 5,
          select: {
            id: true,
            value: true,
            passed: true,
            executedAt: true,
            error: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ indicators });
  } catch (error) {
    console.error('Error fetching indicators:', error);
    res.status(500).json({ error: 'Failed to fetch indicators' });
  }
});

app.post('/api/indicators', async (req, res) => {
  try {
    const { name, description, query, threshold, operator, dataSourceId, userId } = req.body;
    
    // Validate required fields
    if (!name || !query || !dataSourceId || !userId || !operator) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate that the data source exists
    const dataSource = await prisma.dataSource.findUnique({
      where: { id: dataSourceId }
    });

    if (!dataSource) {
      return res.status(404).json({ error: 'Data source not found' });
    }

    const indicator = await prisma.indicator.create({
      data: {
        name,
        description,
        query,
        threshold: threshold ? parseFloat(threshold) : null,
        operator,
        dataSourceId,
        userId
      },
      include: {
        dataSource: {
          select: { id: true, name: true, type: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({ indicator });
  } catch (error) {
    console.error('Error creating indicator:', error);
    res.status(500).json({ error: 'Failed to create indicator' });
  }
});

app.put('/api/indicators/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, query, threshold, operator } = req.body;

    const indicator = await prisma.indicator.update({
      where: { id },
      data: {
        name,
        description,
        query,
        threshold: threshold ? parseFloat(threshold) : null,
        operator
      },
      include: {
        dataSource: {
          select: { id: true, name: true, type: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({ indicator });
  } catch (error) {
    console.error('Error updating indicator:', error);
    res.status(500).json({ error: 'Failed to update indicator' });
  }
});

app.delete('/api/indicators/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete related executions first
    await prisma.execution.deleteMany({
      where: { indicatorId: id }
    });

    // Delete the indicator
    await prisma.indicator.delete({
      where: { id }
    });

    res.json({ message: 'Indicator deleted successfully' });
  } catch (error) {
    console.error('Error deleting indicator:', error);
    res.status(500).json({ error: 'Failed to delete indicator' });
  }
});

// Execute indicator
app.post('/api/indicators/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;

    // Get the indicator with its data source
    const indicator = await prisma.indicator.findUnique({
      where: { id },
      include: {
        dataSource: true
      }
    });

    if (!indicator) {
      return res.status(404).json({ error: 'Indicator not found' });
    }

    // Execute the indicator using ExecutionService
    const result = await executionService.executeRule(
      {
        id: indicator.dataSource.id,
        type: indicator.dataSource.type as 'mysql' | 'postgresql' | 'redshift',
        host: indicator.dataSource.host,
        port: indicator.dataSource.port,
        database: indicator.dataSource.database,
        username: indicator.dataSource.username,
        password: indicator.dataSource.password
      },
      {
        id: indicator.id,
        name: indicator.name,
        description: indicator.description || '',
        query: indicator.query,
        threshold: indicator.threshold || undefined,
        operator: indicator.operator as 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
      }
    );

    // Save execution result to database
    const execution = await prisma.execution.create({
      data: {
        value: result.value,
        passed: result.passed,
        error: result.error,
        indicatorId: indicator.id
      }
    });

    res.json({ execution: { ...execution, result } });
  } catch (error) {
    console.error('Error executing indicator:', error);
    res.status(500).json({ error: 'Failed to execute indicator' });
  }
});

// Get execution history for an indicator
app.get('/api/indicators/:id/executions', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const executions = await prisma.execution.findMany({
      where: { indicatorId: id },
      orderBy: { executedAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.execution.count({
      where: { indicatorId: id }
    });

    res.json({ executions, total, limit: parseInt(limit as string), offset: parseInt(offset as string) });
  } catch (error) {
    console.error('Error fetching executions:', error);
    res.status(500).json({ error: 'Failed to fetch executions' });
  }
});

// Users routes (basic CRUD for demo)
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            dataSources: true,
            indicators: true
          }
        }
      }
    });

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // In production, hash the password
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password // TODO: Hash password in production
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    res.status(201).json({ user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Dashboard stats endpoint
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [
      totalDataSources,
      totalIndicators,
      totalExecutions,
      recentExecutions
    ] = await Promise.all([
      prisma.dataSource.count(),
      prisma.indicator.count(),
      prisma.execution.count(),
      prisma.execution.findMany({
        take: 10,
        orderBy: { executedAt: 'desc' },
        include: {
          indicator: {
            select: { name: true }
          }
        }
      })
    ]);

    const passedExecutions = await prisma.execution.count({
      where: { passed: true }
    });

    const failedExecutions = totalExecutions - passedExecutions;

    res.json({
      stats: {
        totalDataSources,
        totalIndicators,
        totalExecutions,
        passedExecutions,
        failedExecutions,
        successRate: totalExecutions > 0 ? (passedExecutions / totalExecutions) * 100 : 0
      },
      recentExecutions
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

const PORT = process.env.PORT || 3001;

  app.listen(PORT, () => {
    console.log(`🚀 autoDQ Backend ready at http://localhost:${PORT}`);
    console.log(`📊 Health check at http://localhost:${PORT}/health`);
    console.log(`🔗 API endpoints at http://localhost:${PORT}/api`);
  });
}

// Start the server
startServer().catch(console.error);
