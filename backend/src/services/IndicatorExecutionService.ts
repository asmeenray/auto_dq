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
   * Execute a validity indicator
   * Two modes:
   * 1. 'exists': Fail if query returns any rows
   * 2. 'threshold': Execute query, check if numeric column meets threshold, calculate failure %
   */
  static async executeValidityIndicator(
    dataSourceConfig: DatabaseConnection,
    query: string,
    validityMode: string = 'exists',
    numericColumn?: string,
    operator?: string,
    threshold?: number,
    allowedFailure?: number
  ): Promise<ExecutionResult> {
    try {
      console.log('✅ Executing validity indicator...');
      console.log('Query:', query);
      console.log('Mode:', validityMode);
      console.log('Numeric Column:', numericColumn);
      console.log('Operator:', operator);
      console.log('Threshold:', threshold);
      console.log('Allowed Failure %:', allowedFailure);

      // Check if we're in development mode and should use mock data
      const isDevelopment = process.env.NODE_ENV !== 'production';
      
      if (isDevelopment && (dataSourceConfig.host === 'localhost' || dataSourceConfig.host === '127.0.0.1')) {
        console.log('🧪 Using mock execution for development');
        return this.mockValidityExecution(validityMode, threshold, allowedFailure);
      }

      // Execute the query
      const queryResult = await DatabaseConnector.executeQuery(dataSourceConfig, query);
      
      if (validityMode === 'exists') {
        // Mode 1: Fail if query returns any rows
        const rowCount = queryResult ? queryResult.length : 0;
        const passed = rowCount === 0;
        
        console.log(`Exists mode: Query returned ${rowCount} rows. ${passed ? 'PASS' : 'FAIL'}`);
        
        return {
          value: rowCount,
          passed,
          rawResult: queryResult
        };
        
      } else if (validityMode === 'threshold') {
        // Mode 2: Check numeric column against threshold
        if (!numericColumn || !operator || threshold === undefined) {
          return {
            value: null,
            passed: false,
            error: 'Threshold mode requires numericColumn, operator, and threshold',
            rawResult: queryResult
          };
        }

        if (!queryResult || queryResult.length === 0) {
          return {
            value: 0,
            passed: true, // No rows means 0% failure
            rawResult: queryResult
          };
        }

        // Check each row against the threshold
        let failedCount = 0;
        let totalCount = 0;

        for (const row of queryResult) {
          const value = row[numericColumn];
          
          if (value === null || value === undefined) {
            // Treat null values as failures
            failedCount++;
          } else {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
              failedCount++;
            } else {
              // Check against threshold based on operator
              let meetsThreshold = false;
              switch (operator) {
                case 'gt':
                  meetsThreshold = numValue > threshold;
                  break;
                case 'gte':
                  meetsThreshold = numValue >= threshold;
                  break;
                case 'lt':
                  meetsThreshold = numValue < threshold;
                  break;
                case 'lte':
                  meetsThreshold = numValue <= threshold;
                  break;
                case 'eq':
                  meetsThreshold = numValue === threshold;
                  break;
                default:
                  return {
                    value: null,
                    passed: false,
                    error: `Unsupported operator: ${operator}`,
                    rawResult: queryResult
                  };
              }
              
              if (!meetsThreshold) {
                failedCount++;
              }
            }
          }
          totalCount++;
        }

        const failurePercentage = totalCount > 0 ? (failedCount / totalCount) * 100 : 0;
        const maxAllowedFailure = allowedFailure || 0;
        const passed = failurePercentage <= maxAllowedFailure;

        console.log(`Threshold mode: ${failedCount}/${totalCount} failed (${failurePercentage.toFixed(2)}%). Max allowed: ${maxAllowedFailure}%. ${passed ? 'PASS' : 'FAIL'}`);

        return {
          value: Math.round(failurePercentage * 100) / 100, // Round to 2 decimal places
          passed,
          rawResult: {
            totalRows: totalCount,
            failedRows: failedCount,
            failurePercentage,
            sampleResults: queryResult.slice(0, 10) // Include first 10 rows for debugging
          }
        };

      } else {
        return {
          value: null,
          passed: false,
          error: `Unsupported validity mode: ${validityMode}`,
          rawResult: queryResult
        };
      }

    } catch (error) {
      console.error('Error executing validity indicator:', error);
      
      // If it's a connection error and we're in development, fall back to mock
      const isDevelopment = process.env.NODE_ENV !== 'production';
      if (isDevelopment && error instanceof Error && error.message.includes('ECONNREFUSED')) {
        console.log('🧪 Database connection failed, using mock execution for development');
        return this.mockValidityExecution(validityMode, threshold, allowedFailure);
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
   * Mock validity execution for development/testing
   */
  private static mockValidityExecution(validityMode: string, threshold?: number, allowedFailure?: number): ExecutionResult {
    if (validityMode === 'exists') {
      // Mock exists mode: sometimes return rows, sometimes don't
      const scenarios = [
        { rowCount: 0, desc: 'No invalid rows found' },
        { rowCount: 3, desc: 'Found 3 invalid rows' },
        { rowCount: 1, desc: 'Found 1 invalid row' },
        { rowCount: 0, desc: 'All data is valid' },
        { rowCount: 7, desc: 'Found 7 invalid rows' }
      ];
      
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      const passed = scenario.rowCount === 0;
      
      console.log(`🧪 Mock validity (exists) scenario: ${scenario.desc}`);
      console.log(`Exists check: ${scenario.rowCount} rows found. ${passed ? 'PASS' : 'FAIL'}`);
      
      return {
        value: scenario.rowCount,
        passed,
        rawResult: Array(scenario.rowCount).fill({ invalid_data: 'mock_violation' })
      };
      
    } else if (validityMode === 'threshold') {
      // Mock threshold mode: generate realistic failure percentages
      const scenarios = [
        { failureRate: 0, desc: 'All values meet threshold' },
        { failureRate: 2.5, desc: 'Low failure rate (2.5%)' },
        { failureRate: 5.0, desc: 'Moderate failure rate (5%)' },
        { failureRate: 15.0, desc: 'High failure rate (15%)' },
        { failureRate: 1.0, desc: 'Very low failure rate (1%)' },
        { failureRate: 25.0, desc: 'Very high failure rate (25%)' }
      ];
      
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      const failurePercentage = scenario.failureRate;
      const maxAllowedFailure = allowedFailure || 5;
      const passed = failurePercentage <= maxAllowedFailure;
      
      console.log(`🧪 Mock validity (threshold) scenario: ${scenario.desc}`);
      console.log(`Threshold check: ${failurePercentage}% failure <= ${maxAllowedFailure}% allowed? ${passed ? 'PASS' : 'FAIL'}`);
      
      const totalRows = 100;
      const failedRows = Math.round(totalRows * failurePercentage / 100);
      
      return {
        value: failurePercentage,
        passed,
        rawResult: {
          totalRows,
          failedRows,
          failurePercentage,
          sampleResults: Array(Math.min(10, totalRows)).fill(null).map((_, i) => ({
            id: i + 1,
            value: Math.random() * 100,
            meets_threshold: i >= failedRows
          }))
        }
      };
      
    } else {
      return {
        value: null,
        passed: false,
        error: `Mock execution: Unsupported validity mode: ${validityMode}`
      };
    }
  }

  /**
   * Execute any indicator based on its type
   */
  static async executeIndicator(
    indicatorType: string,
    dataSourceConfig: DatabaseConnection,
    query: string,
    threshold?: number,
    targetQuery?: string,
    validityMode?: string,
    numericColumn?: string,
    operator?: string,
    allowedFailure?: number
  ): Promise<ExecutionResult> {
    switch (indicatorType) {
      case 'freshness':
        return await this.executeFreshnessIndicator(dataSourceConfig, query, threshold);
      
      case 'validity':
        return await this.executeValidityIndicator(
          dataSourceConfig, 
          query, 
          validityMode, 
          numericColumn, 
          operator, 
          threshold, 
          allowedFailure
        );
      
      case 'completeness':
        // TODO: Implement completeness logic
        return {
          value: Math.random() * 100,
          passed: Math.random() > 0.3,
          error: 'Completeness indicators not yet implemented'
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
