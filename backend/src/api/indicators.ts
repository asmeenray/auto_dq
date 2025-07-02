import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

// Middleware to extract user from JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// GET /api/indicators
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const indicators = await prisma.indicator.findMany({
      where: { userId: req.user.userId },
      include: {
        dataSource: true,
        executions: {
          orderBy: { executedAt: 'desc' },
          take: 5
        }
      }
    });
    res.json({ indicators });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch indicators' });
  }
});

// POST /api/indicators
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const { name, description, type, dataSourceId, query, targetQuery, threshold, operator } = req.body;
    if (!name || !type || !dataSourceId || !query) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const indicatorData: any = {
      name,
      type,
      dataSourceId,
      query,
      userId: req.user.userId,
    };

    if (description !== undefined) indicatorData.description = description;
    if (targetQuery !== undefined) indicatorData.targetQuery = targetQuery;
    if (threshold !== undefined) indicatorData.threshold = parseFloat(threshold);
    if (operator !== undefined) indicatorData.operator = operator;

    const indicator = await prisma.indicator.create({
      data: indicatorData,
      include: {
        dataSource: true,
        executions: true
      }
    });
    
    res.json({ indicator });
  } catch (error) {
    console.error('Error creating indicator:', error);
    res.status(500).json({ error: 'Failed to create indicator' });
  }
});

// GET /api/indicators/:id
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const indicator = await prisma.indicator.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user.userId 
      },
      include: {
        dataSource: true,
        executions: {
          orderBy: { executedAt: 'desc' }
        }
      }
    });
    
    if (!indicator) {
      return res.status(404).json({ error: 'Indicator not found' });
    }
    
    res.json({ indicator, executions: indicator.executions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch indicator details' });
  }
});

// POST /api/indicators/:id/execute
router.post('/:id/execute', authenticateToken, async (req: any, res) => {
  try {
    const indicator = await prisma.indicator.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user.userId 
      }
    });
    
    if (!indicator) {
      return res.status(404).json({ error: 'Indicator not found' });
    }
    
    // Mock execution - in real implementation, you'd run the query against the data source
    const mockResult = {
      value: Math.random() * 100,
      timestamp: new Date().toISOString(),
      status: 'success'
    };
    
    const execution = await prisma.execution.create({
      data: {
        indicatorId: indicator.id,
        value: mockResult.value,
        passed: mockResult.value > 50, // Mock pass/fail logic
        executedAt: new Date()
      }
    });
    
    res.json({ success: true, execution });
  } catch (error) {
    console.error('Error executing indicator:', error);
    res.status(500).json({ error: 'Failed to execute indicator' });
  }
});

export default router;
