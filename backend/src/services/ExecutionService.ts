import { DatabaseService, DatabaseConnection } from './DatabaseService';

export interface DataQualityRule {
  id: string;
  name: string;
  description: string;
  query: string;
  threshold?: number;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
}

export interface ExecutionResult {
  ruleId: string;
  value: number;
  passed: boolean;
  executedAt: Date;
  error?: string;
}

export class ExecutionService {
  constructor(private databaseService: DatabaseService = new DatabaseService()) {}

  async executeRule(
    connection: DatabaseConnection,
    rule: DataQualityRule
  ): Promise<ExecutionResult> {
    try {
      // Get database connection
      const dbConnection = await this.databaseService.getConnection(connection);
      
      // Execute the query
      const results = await this.databaseService.executeQuery(connection.id, rule.query);
      
      // Extract value from the first result
      // Assume the query returns a single row with a numeric value
      let value = 0;
      if (results && results.length > 0) {
        const firstRow = results[0];
        // Get the first numeric value from the result
        const firstKey = Object.keys(firstRow)[0];
        value = Number(firstRow[firstKey]) || 0;
      }
      
      const passed = this.evaluateRule(value, rule);

      return {
        ruleId: rule.id,
        value,
        passed,
        executedAt: new Date(),
      };
    } catch (error) {
      console.error(`Rule execution failed for rule ${rule.id}:`, error);
      return {
        ruleId: rule.id,
        value: 0,
        passed: false,
        executedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async executeMultipleRules(
    connection: DatabaseConnection,
    rules: DataQualityRule[]
  ): Promise<ExecutionResult[]> {
    const results = await Promise.allSettled(
      rules.map(rule => this.executeRule(connection, rule))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          ruleId: rules[index].id,
          value: 0,
          passed: false,
          executedAt: new Date(),
          error: result.reason?.message || 'Execution failed',
        };
      }
    });
  }

  private evaluateRule(value: number, rule: DataQualityRule): boolean {
    if (!rule.threshold) return true;

    switch (rule.operator) {
      case 'gt': return value > rule.threshold;
      case 'gte': return value >= rule.threshold;
      case 'lt': return value < rule.threshold;
      case 'lte': return value <= rule.threshold;
      case 'eq': return value === rule.threshold;
      default: return false;
    }
  }
}
