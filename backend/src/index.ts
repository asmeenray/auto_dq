import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

// Import services
import { DatabaseConnector } from './services/DatabaseConnector';
import { appDb } from './services/AppDatabaseService';
import { disconnectDatabase } from './services/DatabaseManager';
import { connectionPoolManager } from './services/ConnectionPoolManager';

// Import API routes
import indicatorsRouter from './api/indicators';

// Middleware for JWT authentication
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'dev_jwt_secret', (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

async function startServer() {
  const app = express();

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

  // Mount API routers
  app.use('/api/indicators', indicatorsRouter);

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, name, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Check if user already exists
      const existingUser = await appDb.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      const user = await appDb.createUser({ email, name, password });
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'dev_jwt_secret',
        { expiresIn: '7d' }
      );

      res.json({ user, token });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await appDb.validateUser(email, password);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'dev_jwt_secret',
        { expiresIn: '7d' }
      );

      res.json({ user, token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  });

  // Data Sources routes
  app.get('/api/data-sources', authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const dataSources = await appDb.getDataSourcesByUserId(userId);
      res.json({ dataSources });
    } catch (error) {
      console.error('Error fetching data sources:', error);
      res.status(500).json({ error: 'Failed to fetch data sources' });
    }
  });

  app.post('/api/data-sources', authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const dataSourceData = { ...req.body, userId };
      
      const dataSource = await appDb.createDataSource(dataSourceData);
      res.json({ dataSource });
    } catch (error) {
      console.error('Error creating data source:', error);
      res.status(500).json({ error: 'Failed to create data source' });
    }
  });

  app.get('/api/data-sources/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const dataSource = await appDb.getDataSourceById(id);
      
      if (!dataSource) {
        return res.status(404).json({ error: 'Data source not found' });
      }

      // Check if user owns this data source
      const userId = (req as any).user.userId;
      if (dataSource.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ dataSource });
    } catch (error) {
      console.error('Error fetching data source:', error);
      res.status(500).json({ error: 'Failed to fetch data source' });
    }
  });

  app.put('/api/data-sources/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      
      // Check if data source exists and user owns it
      const existingDataSource = await appDb.getDataSourceById(id);
      if (!existingDataSource) {
        return res.status(404).json({ error: 'Data source not found' });
      }
      if (existingDataSource.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const dataSource = await appDb.updateDataSource(id, req.body);
      res.json({ dataSource });
    } catch (error) {
      console.error('Error updating data source:', error);
      res.status(500).json({ error: 'Failed to update data source' });
    }
  });

  app.delete('/api/data-sources/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      
      // Check if data source exists and user owns it
      const existingDataSource = await appDb.getDataSourceById(id);
      if (!existingDataSource) {
        return res.status(404).json({ error: 'Data source not found' });
      }
      if (existingDataSource.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await appDb.deleteDataSource(id);
      res.json({ message: 'Data source deleted successfully' });
    } catch (error) {
      console.error('Error deleting data source:', error);
      res.status(500).json({ error: 'Failed to delete data source' });
    }
  });

  app.post('/api/data-sources/test-connection', async (req, res) => {
    try {
      console.log('🔌 Testing database connection...');
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      
      const { type, host, port, database, schema, username, password, warehouse, role, account } = req.body;
      
      // Validate required fields
      if (!type || !host || !port || !database || !username || !password) {
        console.log('❌ Missing required connection fields');
        return res.status(400).json({ error: 'Missing required connection fields' });
      }

      console.log(`🔍 Testing ${type} connection to ${host}:${port}/${database}`);

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

      console.log('✅ Connection test result:', result);
      res.json(result);
    } catch (error) {
      console.error('💥 Error testing connection:', error);
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
      
      // Validate required fields (userId is optional for demo)
      if (!name || !type || !host || !port || !database || !username) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      console.log('🆕 Creating new data source:', { name, type, host, port, database, username: '***' });

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
        console.log('❌ Connection test failed during data source creation');
        return res.status(400).json({ 
          error: 'Failed to connect to database',
          message: connectionTest.message,
          details: connectionTest.error
        });
      }

      console.log('✅ Connection test passed, creating data source...');

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
        user: { id: userId || 'demo-user-1', name: 'Demo User', email: 'demo@autodq.com' }
      };

      console.log('🎉 Data source created successfully:', dataSource.id);
      res.status(201).json({ dataSource });
    } catch (error) {
      console.error('💥 Error creating data source:', error);
      res.status(500).json({ error: 'Failed to create data source' });
    }
  });

  // Start server - explicitly use API_PORT from .env file, fallback to 3001
  const PORT = process.env.API_PORT || 3001;
  console.log(`🔧 Using port: ${PORT} (API_PORT: ${process.env.API_PORT}, PORT: ${process.env.PORT})`);
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 autoDQ Backend server is running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown handling
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n📡 Received ${signal}. Shutting down gracefully...`);
    
    // Stop accepting new connections
    server.close(async () => {
      console.log('🔌 HTTP server closed');
      
      try {
        // Close external database connection pools
        await connectionPoolManager.closeAllPools();
        console.log('🔌 External database pools closed');
        
        // Disconnect from app database
        await disconnectDatabase();
        console.log('💾 App database disconnected');
        
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.log('⏰ Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  // Listen for shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
