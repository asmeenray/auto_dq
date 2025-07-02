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

  // --- DATA SOURCE API METHODS ---
  async getDataSources() {
    return this.request<{ dataSources: any[] }>('/data-sources');
  }

  async createDataSource(dataSource: any) {
    return this.request<{ dataSource: any }>('/data-sources', {
      method: 'POST',
      body: JSON.stringify(dataSource),
    });
  }

  async getDataSource(id: string) {
    return this.request<{ dataSource: any }>(`/data-sources/${id}`);
  }

  async updateDataSource(id: string, dataSource: any) {
    return this.request<{ dataSource: any }>(`/data-sources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dataSource),
    });
  }

  async deleteDataSource(id: string) {
    return this.request<{ message: string }>(`/data-sources/${id}`, {
      method: 'DELETE',
    });
  }

  async testDataSourceConnection(connectionData: any) {
    return this.request<{ success: boolean; message: string; error?: string }>('/data-sources/test-connection', {
      method: 'POST',
      body: JSON.stringify(connectionData),
    });
  }

  async getDashboardStats() {
    // This would be a real API call in production
    // For now, return basic stats based on user's data sources
    const dataSources = await this.getDataSources();
    return {
      data: {
        stats: {
          totalDataSources: dataSources.data?.dataSources?.length || 0,
          totalIndicators: 0,
          totalExecutions: 0,
          passedExecutions: 0,
          failedExecutions: 0,
          successRate: 0
        },
        recentExecutions: []
      }
    };
  }

  async getIndicators() {
    // This would be a real API call in production
    return this.request<{ indicators: any[] }>('/indicators');
  }

  async executeIndicator(indicatorId: string) {
    // This would be a real API call in production
    return this.request<{ success: boolean; message: string }>(`/indicators/${indicatorId}/execute`, {
      method: 'POST',
    });
  }

  async createIndicator(data: any) {
    return this.request<{ indicator: any }>('/indicators', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getIndicatorDetails(indicatorId: string) {
    return this.request<{ indicator: any; executions: any[] }>(`/indicators/${indicatorId}`);
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

// Named exports for convenience
export const getDataSources = async () => {
  const response = await apiClient.getDataSources();
  if (response.error) throw new Error(response.error);
  return response.data?.dataSources || [];
};

export const createIndicator = async (data: any) => {
  const response = await apiClient.createIndicator(data);
  if (response.error) throw new Error(response.error);
  return response.data?.indicator;
};

export const executeIndicator = async (id: string) => {
  const response = await apiClient.executeIndicator(id);
  if (response.error) throw new Error(response.error);
  return response.data;
};

export const getIndicatorDetails = async (id: string) => {
  const response = await apiClient.getIndicatorDetails(id);
  if (response.error) throw new Error(response.error);
  return response.data;
};

export default apiClient;
