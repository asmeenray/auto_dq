export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  _count?: {
    dataSources: number;
    indicators: number;
  };
}

export interface CreateUserInput {
  email: string;
  name?: string;
  password: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'redshift' | 'snowflake' | 'bigquery';
  host: string;
  port: number;
  database: string;
  username: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  indicators?: {
    id: string;
    name: string;
    description: string;
  }[];
  createdAt: string;
  updatedAt: string;
  // Snowflake specific fields
  warehouse?: string;
  role?: string;
  account?: string;
  // BigQuery specific fields
  projectId?: string;
  keyFile?: string;
  location?: string;
}

export interface CreateDataSourceInput {
  name: string;
  type: 'redshift' | 'snowflake' | 'bigquery';
  host: string;
  port: number;
  database: string;
  schema?: string;
  username: string;
  password: string;
  userId: string;
  // Snowflake specific fields
  warehouse?: string;
  role?: string;
  account?: string;
  // BigQuery specific fields
  projectId?: string;
  keyFile?: string;
  location?: string;
}

export type IndicatorType = 'freshness' | 'completeness' | 'validity' | 'anomaly';

export interface Indicator {
  id: string;
  name: string;
  description?: string;
  type: IndicatorType;
  query: string;
  targetQuery?: string; // For completeness indicators
  threshold?: number;
  operator?: string;
  dataSourceId: string;
  dataSource?: {
    id: string;
    name: string;
    type: string;
  };
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  executions?: IndicatorExecution[];
  createdAt: string;
  updatedAt: string;
}

export interface IndicatorExecution {
  id: string;
  indicatorId: string;
  value: number;
  passed: boolean;
  error?: string;
  executedAt: string;
  status: 'success' | 'failed' | 'pending';
  result: any;
  createdAt: string;
}

export interface Execution {
  id: string;
  value: number;
  passed: boolean;
  error?: string;
  executedAt: string;
  indicatorId: string;
  indicator?: {
    name: string;
  };
}

export interface DashboardStats {
  totalDataSources: number;
  totalIndicators: number;
  totalExecutions: number;
  passedExecutions: number;
  failedExecutions: number;
  successRate: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Authentication types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// UI Component types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export type DatabaseType = 'mysql' | 'postgresql' | 'redshift';
export type OperatorType = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne';
