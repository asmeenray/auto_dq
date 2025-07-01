import React, { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginUser } from '../store/slices/authSlice'
import { apiClient } from '../utils/api-client'
import { DashboardStats, DataSource, Indicator, Execution } from '../types'

interface LoginFormData {
  email: string;
  password: string;
}

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { isAuthenticated, isLoading, error, user } = useAppSelector(state => state.auth)
  
  const [loginForm, setLoginForm] = useState<LoginFormData>({
    email: 'demo@autodq.com',
    password: 'demo'
  })
  
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [indicators, setIndicators] = useState<Indicator[]>([])
  const [recentExecutions, setRecentExecutions] = useState<Execution[]>([])
  const [loadingData, setLoadingData] = useState(false)

  // Load dashboard data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData()
    }
  }, [isAuthenticated])

  const loadDashboardData = async () => {
    setLoadingData(true)
    try {
      const [statsResponse, dataSourcesResponse, indicatorsResponse] = await Promise.all([
        apiClient.getDashboardStats(),
        apiClient.getDataSources(),
        apiClient.getIndicators()
      ])

      if (statsResponse.data) {
        setStats(statsResponse.data.stats)
        setRecentExecutions(statsResponse.data.recentExecutions)
      }

      if (dataSourcesResponse.data) {
        setDataSources(dataSourcesResponse.data.dataSources)
      }

      if (indicatorsResponse.data) {
        setIndicators(indicatorsResponse.data.indicators)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await dispatch(loginUser(loginForm))
  }

  const executeIndicator = async (indicatorId: string) => {
    try {
      const response = await apiClient.executeIndicator(indicatorId)
      if (response.data) {
        // Reload dashboard data to show new execution
        loadDashboardData()
      }
    } catch (error) {
      console.error('Failed to execute indicator:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-void flex items-center justify-center">
        <div className="neural-card p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-neural-gradient rounded-sm"></div>
              <span className="font-display font-bold text-2xl text-gradient">autoDQ</span>
            </div>
            <h2 className="text-xl font-semibold text-neutral-moonlight">Access Portal</h2>
            <p className="text-neutral-stardust text-sm mt-2">
              Demo credentials: demo@autodq.com / demo
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-moonlight mb-2">
                Email
              </label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="neural-input w-full"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-moonlight mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="neural-input w-full"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="text-danger text-sm bg-danger/10 border border-danger/20 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="neural-btn-primary w-full"
            >
              {isLoading ? 'Connecting...' : 'Access System'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-void">
      {/* Header */}
      <header className="neural-nav">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-neural-gradient rounded-sm"></div>
            <span className="font-display font-bold text-xl text-gradient">autoDQ</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-neutral-stardust text-sm">
              Welcome, {user?.name || user?.email}
            </span>
            <button 
              onClick={() => {
                localStorage.removeItem('token')
                window.location.reload()
              }}
              className="neural-btn-ghost text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-8">
        {/* Stats Overview */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-moonlight mb-6">System Overview</h2>
          
          {loadingData ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="neural-card p-6 animate-pulse">
                  <div className="h-4 bg-neutral-stardust/20 rounded mb-2"></div>
                  <div className="h-8 bg-neutral-stardust/20 rounded"></div>
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="neural-card p-6">
                <div className="text-sm text-neutral-stardust mb-2">Data Sources</div>
                <div className="text-3xl font-bold text-primary-400">{stats.totalDataSources}</div>
              </div>
              
              <div className="neural-card p-6">
                <div className="text-sm text-neutral-stardust mb-2">Indicators</div>
                <div className="text-3xl font-bold text-accent-cyan">{stats.totalIndicators}</div>
              </div>
              
              <div className="neural-card p-6">
                <div className="text-sm text-neutral-stardust mb-2">Total Executions</div>
                <div className="text-3xl font-bold text-neutral-moonlight">{stats.totalExecutions}</div>
              </div>
              
              <div className="neural-card p-6">
                <div className="text-sm text-neutral-stardust mb-2">Success Rate</div>
                <div className="text-3xl font-bold text-accent-green">
                  {stats.successRate.toFixed(1)}%
                </div>
              </div>
            </div>
          ) : (
            <div className="neural-card p-6 text-center">
              <div className="text-neutral-stardust">No statistics available</div>
            </div>
          )}
        </section>

        {/* Data Sources */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-moonlight">Data Sources</h2>
            <button className="neural-btn-primary">
              + Add Data Source
            </button>
          </div>
          
          <div className="space-y-4">
            {dataSources.length > 0 ? (
              dataSources.map((source) => (
                <div key={source.id} className="neural-card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-moonlight">
                        {source.name}
                      </h3>
                      <div className="text-sm text-neutral-stardust">
                        {source.type} • {source.host}:{source.port} • {source.database}
                      </div>
                      <div className="text-xs text-neutral-stardust mt-1">
                        {source.indicators?.length || 0} indicators
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-accent-green rounded-full"></div>
                      <span className="text-sm text-accent-green">Connected</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="neural-card p-6 text-center">
                <div className="text-neutral-stardust mb-4">No data sources configured</div>
                <button className="neural-btn-primary">Add Your First Data Source</button>
              </div>
            )}
          </div>
        </section>

        {/* Indicators */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-moonlight">Quality Indicators</h2>
            <button 
              className="neural-btn-primary"
              disabled={dataSources.length === 0}
            >
              + Create Indicator
            </button>
          </div>
          
          <div className="space-y-4">
            {indicators.length > 0 ? (
              indicators.map((indicator) => (
                <div key={indicator.id} className="neural-card p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-moonlight">
                        {indicator.name}
                      </h3>
                      {indicator.description && (
                        <p className="text-sm text-neutral-stardust mt-1">
                          {indicator.description}
                        </p>
                      )}
                      <div className="text-xs text-neutral-stardust mt-2">
                        {indicator.dataSource?.name} • {indicator.operator} {indicator.threshold}
                      </div>
                      
                      {/* Recent execution result */}
                      {indicator.executions && indicator.executions.length > 0 && (
                        <div className="mt-2 flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            indicator.executions[0].passed ? 'bg-accent-green' : 'bg-danger'
                          }`}></div>
                          <span className={`text-sm ${
                            indicator.executions[0].passed ? 'text-accent-green' : 'text-danger'
                          }`}>
                            Last: {indicator.executions[0].value} 
                            ({indicator.executions[0].passed ? 'PASS' : 'FAIL'})
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => executeIndicator(indicator.id)}
                      className="neural-btn-ghost"
                    >
                      Execute
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="neural-card p-6 text-center">
                <div className="text-neutral-stardust mb-4">No quality indicators defined</div>
                {dataSources.length > 0 ? (
                  <button className="neural-btn-primary">Create Your First Indicator</button>
                ) : (
                  <div className="text-sm text-neutral-stardust">
                    Add a data source first to create indicators
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Recent Executions */}
        {recentExecutions.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-neutral-moonlight mb-6">Recent Executions</h2>
            
            <div className="neural-card">
              <div className="divide-y divide-neutral-stardust/10">
                {recentExecutions.map((execution) => (
                  <div key={execution.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-neutral-moonlight">
                        {execution.indicator?.name || 'Unknown Indicator'}
                      </div>
                      <div className="text-xs text-neutral-stardust">
                        {new Date(execution.executedAt).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-neutral-stardust">
                        Value: {execution.value}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        execution.passed 
                          ? 'bg-accent-green/20 text-accent-green' 
                          : 'bg-danger/20 text-danger'
                      }`}>
                        {execution.passed ? 'PASS' : 'FAIL'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default DashboardPage
