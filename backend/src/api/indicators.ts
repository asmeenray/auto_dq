import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { IndicatorExecutionService } from '../services/IndicatorExecutionService';
import { DatabaseConnection } from '../services/DatabaseConnector';
import { prisma } from '../services/DatabaseManager';

const router = Router();
// Remove the local prisma instance
// const prisma = new PrismaClient();

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
    const { 
      name, 
      description, 
      type, 
      dataSourceId, 
      query, 
      targetQuery, 
      threshold, 
      operator,
      validityMode,
      numericColumn,
      allowedFailure
    } = req.body;
    
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
    
    // Validity specific fields
    if (validityMode !== undefined) indicatorData.validityMode = validityMode;
    if (numericColumn !== undefined) indicatorData.numericColumn = numericColumn;
    if (allowedFailure !== undefined) indicatorData.allowedFailure = parseFloat(allowedFailure);

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

// PUT /api/indicators/:id
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { 
      description, 
      type, 
      dataSourceId, 
      query, 
      targetQuery, 
      threshold, 
      operator,
      validityMode,
      numericColumn,
      allowedFailure
    } = req.body;
    
    const existingIndicator = await prisma.indicator.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user.userId 
      }
    });
    
    if (!existingIndicator) {
      return res.status(404).json({ error: 'Indicator not found' });
    }

    // Build update data with proper typing
    const updateData: any = {};
    if (description !== undefined) updateData.description = description;
    if (dataSourceId !== undefined) updateData.dataSourceId = dataSourceId;
    if (query !== undefined) updateData.query = query;
    if (targetQuery !== undefined) updateData.targetQuery = targetQuery;
    if (threshold !== undefined) updateData.threshold = threshold ? parseFloat(threshold) : null;
    if (operator !== undefined) updateData.operator = operator;
    
    // Validity specific fields
    if (validityMode !== undefined) updateData.validityMode = validityMode;
    if (numericColumn !== undefined) updateData.numericColumn = numericColumn;
    if (allowedFailure !== undefined) updateData.allowedFailure = allowedFailure ? parseFloat(allowedFailure) : null;
    
    updateData.updatedAt = new Date();

    const indicator = await prisma.indicator.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        dataSource: true,
        executions: {
          orderBy: { executedAt: 'desc' },
          take: 10
        }
      }
    });
    
    res.json({ indicator });
  } catch (error) {
    console.error('Error updating indicator:', error);
    res.status(500).json({ error: 'Failed to update indicator' });
  }
});

// POST /api/indicators/:id/execute
router.post('/:id/execute', authenticateToken, async (req: any, res) => {
  try {
    const indicator = await prisma.indicator.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user.userId 
      },
      include: {
        dataSource: true
      }
    });
    
    if (!indicator) {
      return res.status(404).json({ error: 'Indicator not found' });
    }

    console.log(`🚀 Executing ${(indicator as any).type} indicator: ${indicator.name}`);

    // Prepare data source configuration
    const dataSourceConfig: DatabaseConnection = {
      type: indicator.dataSource.type as 'redshift' | 'snowflake' | 'bigquery',
      host: indicator.dataSource.host,
      port: indicator.dataSource.port,
      database: indicator.dataSource.database,
      schema: indicator.dataSource.schema || undefined,
      username: indicator.dataSource.username,
      password: indicator.dataSource.password,
      // Snowflake specific
      warehouse: indicator.dataSource.warehouse || undefined,
      role: indicator.dataSource.role || undefined,
      account: indicator.dataSource.account || undefined,
      // BigQuery specific
      projectId: indicator.dataSource.projectId || undefined,
      keyFile: indicator.dataSource.keyFile || undefined,
      location: indicator.dataSource.location || undefined,
    };

    // Execute the indicator
    const executionResult = await IndicatorExecutionService.executeIndicator(
      (indicator as any).type,
      dataSourceConfig,
      (indicator as any).query,
      (indicator as any).threshold || 1, // Default threshold to 1 day for freshness
      (indicator as any).targetQuery || undefined,
      (indicator as any).validityMode || undefined,
      (indicator as any).numericColumn || undefined,
      (indicator as any).operator || undefined,
      (indicator as any).allowedFailure || undefined
    );

    // Store execution result in database
    const execution = await prisma.execution.create({
      data: {
        indicatorId: indicator.id,
        value: executionResult.value || 0,
        passed: executionResult.passed,
        error: executionResult.error || null,
        executedAt: new Date()
      }
    });

    console.log(`✅ Execution completed: ${executionResult.passed ? 'PASSED' : 'FAILED'} (value: ${executionResult.value})`);

    res.json({ 
      success: true, 
      execution,
      result: executionResult
    });
  } catch (error) {
    console.error('Error executing indicator:', error);
    res.status(500).json({ error: 'Failed to execute indicator' });
  }
});

// DELETE /api/indicators/:id
router.delete('/:id', authenticateToken, async (req: any, res) => {
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

    // Delete all executions first (due to foreign key constraint)
    await prisma.execution.deleteMany({
      where: { indicatorId: req.params.id }
    });

    // Delete the indicator
    await prisma.indicator.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true, message: 'Indicator deleted successfully' });
  } catch (error) {
    console.error('Error deleting indicator:', error);
    res.status(500).json({ error: 'Failed to delete indicator' });
  }
});

export default router;
