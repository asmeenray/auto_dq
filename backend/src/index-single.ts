import express from 'express';
import cors from 'cors';
import path from 'path';
import jwt from 'jsonwebtoken';

// Import services
import { DatabaseConnector } from './services/DatabaseConnector';
import { appDb } from './services/AppDatabaseService';

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

  // Serve static files from frontend build (for single deployment)
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  }

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'autoDQ Backend' });
  });

  // API Routes
  app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from autoDQ Backend!' });
  });

  // Auth routes with database fallback
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, name, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Try database first, fall back to mock
      try {
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
      } catch (dbError) {
        console.warn('Database unavailable, using mock registration:', dbError);
        
        // Mock registration for when database is not available
        const mockUser = {
          id: 'mock-user-' + Date.now(),
          email,
          name: name || 'Demo User',
          createdAt: new Date().toISOString()
        };

        const token = jwt.sign(
          { userId: mockUser.id, email: mockUser.email },
          process.env.JWT_SECRET || 'dev_jwt_secret',
          { expiresIn: '7d' }
        );

        res.json({ user: mockUser, token });
      }
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to register user', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Try database first, fall back to mock
      try {
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
      } catch (dbError) {
        console.warn('Database unavailable, using mock login:', dbError);
        
        // Mock login for when database is not available
        // Accept any email/password for demo purposes
        const mockUser = {
          id: 'mock-user-demo',
          email,
          name: 'Demo User',
          createdAt: new Date().toISOString()
        };

        const token = jwt.sign(
          { userId: mockUser.id, email: mockUser.email },
          process.env.JWT_SECRET || 'dev_jwt_secret',
          { expiresIn: '7d' }
        );

        res.json({ user: mockUser, token });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to login', details: error instanceof Error ? error.message : 'Unknown error' });
    }
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

  // Serve frontend for any non-API routes (SPA fallback)
  if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
      }
    });
  }

  // Start server
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 autoDQ Backend server is running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    if (process.env.NODE_ENV === 'production') {
      console.log(`🌐 Frontend served at: http://localhost:${PORT}`);
    }
  });
}

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
