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

  // --- DEMO LOCALSTORAGE DATA SOURCE PERSISTENCE ---
  private getStoredDataSources(): any[] {
    try {
      const sources = localStorage.getItem('demo-data-sources');
      return sources ? JSON.parse(sources) : [];
    } catch {
      return [];
    }
  }

  private storeDataSources(sources: any[]) {
    localStorage.setItem('demo-data-sources', JSON.stringify(sources));
  }

  async getDataSources() {
    // For demo: always use localStorage
    return {
      data: { dataSources: this.getStoredDataSources() }
    };
  }

  async createDataSource(dataSource: any) {
    try {
      const sources = this.getStoredDataSources();
      const newSource = {
        ...dataSource,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        indicators: [],
      };
      sources.push(newSource);
      this.storeDataSources(sources);
      return { data: { dataSource: newSource } };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create data source' };
    }
  }

  async deleteDataSource(id: string) {
    let sources = this.getStoredDataSources();
    sources = sources.filter((s: any) => s.id !== id);
    this.storeDataSources(sources);
    return { data: { message: 'Deleted' } };
  }

  async testDataSourceConnection(connectionData: any) {
    return this.post<{ success: boolean; message: string; error?: string }>('/data-sources/test-connection', connectionData);
  }

  async getDashboardStats() {
    // Mock dashboard stats for demo
    const sources = this.getStoredDataSources();
    return {
      data: {
        stats: {
          totalDataSources: sources.length,
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
    // Mock indicators for demo
    return {
      data: { indicators: [] }
    };
  }

  async executeIndicator(indicatorId: string) {
    // Mock execution for demo
    return {
      data: { success: true, message: 'Indicator executed (demo)' }
    };
  }

  async getDataSource(id: string) {
    const sources = this.getStoredDataSources();
    const source = sources.find((s: any) => s.id === id);
    if (source) {
      return { data: { dataSource: source } };
    } else {
      return { error: 'Data source not found' };
    }
  }

  async updateDataSource(id: string, dataSource: any) {
    try {
      const sources = this.getStoredDataSources();
      const index = sources.findIndex((s: any) => s.id === id);
      if (index >= 0) {
        sources[index] = { ...sources[index], ...dataSource, id, updatedAt: new Date().toISOString() };
        this.storeDataSources(sources);
        return { data: { dataSource: sources[index] } };
      } else {
        return { error: 'Data source not found' };
      }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to update data source' };
    }
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
