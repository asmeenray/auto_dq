const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || `HTTP error! status: ${response.status}`,
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Generic CRUD methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Data Sources API
  async getDataSources() {
    return this.get<{ dataSources: DataSource[] }>('/data-sources');
  }

  async createDataSource(dataSource: CreateDataSourceInput) {
    return this.post<{ dataSource: DataSource }>('/data-sources', dataSource);
  }

  async updateDataSource(id: string, dataSource: Partial<CreateDataSourceInput>) {
    return this.put<{ dataSource: DataSource }>(`/data-sources/${id}`, dataSource);
  }

  async deleteDataSource(id: string) {
    return this.delete<{ message: string }>(`/data-sources/${id}`);
  }

  async testDataSourceConnection(connectionData: any) {
    return this.post<{ success: boolean; message: string; error?: string }>('/data-sources/test-connection', connectionData);
  }

  // Indicators API
  async getIndicators(dataSourceId?: string) {
    const query = dataSourceId ? `?dataSourceId=${dataSourceId}` : '';
    return this.get<{ indicators: Indicator[] }>(`/indicators${query}`);
  }

  async createIndicator(indicator: CreateIndicatorInput) {
    return this.post<{ indicator: Indicator }>('/indicators', indicator);
  }

  async updateIndicator(id: string, indicator: Partial<CreateIndicatorInput>) {
    return this.put<{ indicator: Indicator }>(`/indicators/${id}`, indicator);
  }

  async deleteIndicator(id: string) {
    return this.delete<{ message: string }>(`/indicators/${id}`);
  }

  async executeIndicator(id: string) {
    return this.post<{ execution: Execution }>(`/indicators/${id}/execute`, {});
  }

  async getIndicatorExecutions(id: string, limit: number = 50, offset: number = 0) {
    return this.get<{ executions: Execution[]; total: number; limit: number; offset: number }>(
      `/indicators/${id}/executions?limit=${limit}&offset=${offset}`
    );
  }

  // Users API
  async getUsers() {
    return this.get<{ users: User[] }>('/users');
  }

  async createUser(user: CreateUserInput) {
    return this.post<{ user: User }>('/users', user);
  }

  // Dashboard API
  async getDashboardStats() {
    return this.get<{
      stats: {
        totalDataSources: number;
        totalIndicators: number;
        totalExecutions: number;
        passedExecutions: number;
        failedExecutions: number;
        successRate: number;
      };
      recentExecutions: Execution[];
    }>('/dashboard/stats');
  }

  // Health check
  async healthCheck() {
    return this.get<{ status: string; service: string }>('/health');
  }
}

// Types
export interface DataSource {
  id: string;
  name: string;
  type: string;
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
}

export interface CreateDataSourceInput {
  name: string;
  type: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  userId: string;
}

export interface Indicator {
  id: string;
  name: string;
  description?: string;
  query: string;
  threshold?: number;
  operator: string;
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
  executions?: Execution[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateIndicatorInput {
  name: string;
  description?: string;
  query: string;
  threshold?: number;
  operator: string;
  dataSourceId: string;
  userId: string;
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

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
