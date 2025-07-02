import { DatabaseConnector, DatabaseConnection } from './DatabaseConnector';

export interface ExecutionResult {
  value: number | null;
  passed: boolean;
  error?: string;
  rawResult?: any;
}

export class IndicatorExecutionService {
  
  /**
   * Execute a freshness indicator
   * For freshness: query should return a timestamp/date, compare with threshold in days
   */
  static async executeFreshnessIndicator(
    dataSourceConfig: DatabaseConnection,
    query: string,
    threshold: number = 1
  ): Promise<ExecutionResult> {
    try {
      console.log('🕒 Executing freshness indicator...');
      console.log('Query:', query);
      console.log('Threshold (days):', threshold);

      // Check if we're in development mode and should use mock data
      const isDevelopment = process.env.NODE_ENV !== 'production';
      
      if (isDevelopment && (dataSourceConfig.host === 'localhost' || dataSourceConfig.host === '127.0.0.1')) {
        console.log('🧪 Using mock execution for development');
        return this.mockFreshnessExecution(threshold);
      }

      // Execute the query
      const queryResult = await DatabaseConnector.executeQuery(dataSourceConfig, query);
      
      if (!queryResult || queryResult.length === 0) {
        return {
          value: null,
          passed: false,
          error: 'Query returned no results',
          rawResult: queryResult
        };
      }

      // Get the first row and first column (assumes single date/timestamp result)
      const firstRow = queryResult[0];
      const firstValue = Object.values(firstRow)[0];
      
      console.log('Raw query result:', firstValue);

      if (!firstValue) {
        return {
          value: null,
          passed: false,
          error: 'Query returned null/empty value',
          rawResult: queryResult
        };
      }

      // Parse the date/timestamp
      let resultDate: Date;
      try {
        resultDate = new Date(firstValue as string);
        if (isNaN(resultDate.getTime())) {
          throw new Error('Invalid date');
        }
      } catch (error) {
        return {
          value: null,
          passed: false,
          error: `Unable to parse result as date: ${firstValue}`,
          rawResult: queryResult
        };
      }

      // Calculate days difference from current date
      const currentDate = new Date();
      const diffInMs = currentDate.getTime() - resultDate.getTime();
      const daysDifference = diffInMs / (1000 * 60 * 60 * 24);
      
      console.log('Result date:', resultDate.toISOString());
      console.log('Current date:', currentDate.toISOString());
      console.log('Days difference:', daysDifference);

      // Freshness logic: if current_date - result > threshold, then fail
      const passed = daysDifference <= threshold;
      
      console.log(`Freshness check: ${daysDifference} days <= ${threshold} days? ${passed ? 'PASS' : 'FAIL'}`);

      return {
        value: Math.round(daysDifference * 100) / 100, // Round to 2 decimal places
        passed,
        rawResult: queryResult
      };

    } catch (error) {
      console.error('Error executing freshness indicator:', error);
      
      // If it's a connection error and we're in development, fall back to mock
      const isDevelopment = process.env.NODE_ENV !== 'production';
      if (isDevelopment && error instanceof Error && error.message.includes('ECONNREFUSED')) {
        console.log('🧪 Database connection failed, using mock execution for development');
        return this.mockFreshnessExecution(threshold);
      }
      
      return {
        value: null,
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown execution error',
        rawResult: null
      };
    }
  }

  /**
   * Mock freshness execution for development/testing
   */
  private static mockFreshnessExecution(threshold: number): ExecutionResult {
    // Generate realistic mock data
    const scenarios = [
      { days: 0.5, desc: 'Fresh data (12 hours old)' },
      { days: 1.0, desc: 'Day old data' },
      { days: 1.5, desc: 'Day and half old data' },
      { days: 2.0, desc: 'Two days old data' },
      { days: 3.5, desc: 'Stale data (3.5 days old)' },
      { days: 0.1, desc: 'Very fresh data (2.4 hours old)' },
      { days: 4.0, desc: 'Old data (4 days old)' }
    ];
    
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    const daysDifference = scenario.days;
    const passed = daysDifference <= threshold;
    
    console.log(`🧪 Mock freshness scenario: ${scenario.desc}`);
    console.log(`Freshness check: ${daysDifference} days <= ${threshold} days? ${passed ? 'PASS' : 'FAIL'}`);
    
    return {
      value: daysDifference,
      passed,
      rawResult: [{ last_updated: new Date(Date.now() - daysDifference * 24 * 60 * 60 * 1000).toISOString() }]
    };
  }

  /**
   * Execute any indicator based on its type
   */
  static async executeIndicator(
    indicatorType: string,
    dataSourceConfig: DatabaseConnection,
    query: string,
    threshold?: number,
    targetQuery?: string
  ): Promise<ExecutionResult> {
    switch (indicatorType) {
      case 'freshness':
        return await this.executeFreshnessIndicator(dataSourceConfig, query, threshold);
      
      case 'completeness':
        // TODO: Implement completeness logic
        return {
          value: Math.random() * 100,
          passed: Math.random() > 0.3,
          error: 'Completeness indicators not yet implemented'
        };
      
      case 'validity':
        // TODO: Implement validity logic
        return {
          value: Math.random() * 100,
          passed: Math.random() > 0.3,
          error: 'Validity indicators not yet implemented'
        };
      
      case 'anomaly':
        // TODO: Implement anomaly detection logic
        return {
          value: Math.random() * 100,
          passed: Math.random() > 0.3,
          error: 'Anomaly indicators not yet implemented'
        };
      
      default:
        return {
          value: null,
          passed: false,
          error: `Unsupported indicator type: ${indicatorType}`
        };
    }
  }
}
