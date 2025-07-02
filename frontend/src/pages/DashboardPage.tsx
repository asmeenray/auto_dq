import React, { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginUser, logoutUser } from '../store/slices/authSlice'
import { apiClient } from '../utils/api-client'
import { DashboardStats, DataSource, Indicator, Execution } from '../types'

interface LoginFormData {
  email: string;
  password: string;
}

// Animations
const pulse = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`

const slideIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #0f0f14 50%, #1a1a24 100%);
  position: relative;
  overflow-x: hidden;
`

const BackgroundPattern = styled.div`
  position: fixed;
  inset: 0;
  opacity: 0.1;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 50%),
    linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 100% 100%, 50px 50px, 50px 50px;
  z-index: 0;
  animation: ${float} 20s ease-in-out infinite;
`

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  z-index: 1;
`

const LoginCard = styled.div`
  background: rgba(31, 41, 55, 0.95);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 28rem;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 30px rgba(6, 182, 212, 0.1);
  animation: ${slideIn} 0.6s ease-out;
`

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`

const LogoIcon = styled.div`
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, #22d3ee, #3b82f6);
  border-radius: 0.375rem;
  animation: ${float} 3s ease-in-out infinite;
`

const LogoText = styled.span`
  font-family: 'Orbitron', monospace;
  font-weight: bold;
  font-size: 1.5rem;
  background: linear-gradient(to right, #22d3ee, #3b82f6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const LoginTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #ccd6f6;
  margin-bottom: 0.5rem;
`

const LoginSubtitle = styled.p`
  font-size: 0.875rem;
  color: #8892b0;
  font-family: 'JetBrains Mono', monospace;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #ccd6f6;
  margin-bottom: 0.5rem;
`

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(138, 146, 176, 0.3);
  border-radius: 0.5rem;
  color: #ccd6f6;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #22d3ee;
    background: rgba(6, 182, 212, 0.05);
    box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.1);
  }
  
  &::placeholder {
    color: #6b7280;
  }
`

const ErrorMessage = styled.div`
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 0.5rem;
  padding: 0.75rem;
  font-size: 0.875rem;
`

const LoginButton = styled.button<{ disabled: boolean }>`
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #22d3ee, #3b82f6);
  color: black;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #06b6d4, #2563eb);
    transform: translateY(-1px);
    box-shadow: 0 10px 25px rgba(6, 182, 212, 0.3);
  }
`

// Dashboard Styles
const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(15, 15, 20, 0.95);
  border-bottom: 1px solid rgba(138, 146, 176, 0.2);
  backdrop-filter: blur(20px);
`

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
`

const HeaderLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const UserInfo = styled.span`
  color: #8892b0;
  font-size: 0.875rem;
`

const LogoutButton = styled.button`
  background: none;
  border: 1px solid rgba(138, 146, 176, 0.3);
  color: #8892b0;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: #ccd6f6;
    border-color: #8892b0;
    background: rgba(138, 146, 176, 0.1);
  }
`

const Main = styled.main`
  padding: 2rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`

const Section = styled.section`
  margin-bottom: 3rem;
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #ccd6f6;
`

const AddButton = styled.button<{ disabled?: boolean }>`
  background: linear-gradient(135deg, #22d3ee, #3b82f6);
  color: black;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #06b6d4, #2563eb);
    transform: translateY(-1px);
    box-shadow: 0 5px 15px rgba(6, 182, 212, 0.3);
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`

const StatCard = styled.div<{ color: string }>`
  background: rgba(31, 41, 55, 0.6);
  border: 1px solid ${props => props.color}33;
  border-radius: 0.75rem;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  animation: ${slideIn} 0.6s ease-out;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, ${props => props.color}0A, transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    border-color: ${props => props.color}66;
    background: ${props => props.color}0D;
    transform: translateY(-2px);
    box-shadow: 
      0 10px 25px ${props => props.color}1A,
      0 0 40px ${props => props.color}15;
      
    &::before {
      opacity: 1;
    }
  }
`

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #8892b0;
  margin-bottom: 0.5rem;
`

const StatValue = styled.div<{ color: string }>`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.color};
`

const LoadingCard = styled.div`
  background: rgba(31, 41, 55, 0.6);
  border: 1px solid rgba(138, 146, 176, 0.2);
  border-radius: 0.75rem;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(6, 182, 212, 0.1),
      transparent
    );
    animation: ${shimmer} 1.5s infinite;
    transform: translateX(-100%);
  }
`

const LoadingBar = styled.div<{ height: string; width?: string }>`
  height: ${props => props.height};
  width: ${props => props.width || '100%'};
  background: rgba(138, 146, 176, 0.2);
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  animation: ${pulse} 1.5s ease-in-out infinite;
`

const ContentCard = styled.div`
  background: rgba(31, 41, 55, 0.6);
  border: 1px solid rgba(138, 146, 176, 0.2);
  border-radius: 0.75rem;
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: all 0.3s ease;
  animation: ${slideIn} 0.6s ease-out;
  margin-bottom: 1rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.03), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    border-color: rgba(6, 182, 212, 0.4);
    background: rgba(31, 41, 55, 0.8);
    box-shadow: 0 5px 20px rgba(6, 182, 212, 0.1);
    
    &::before {
      opacity: 1;
    }
  }
`

const CardContent = styled.div`
  padding: 1.5rem;
`

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #ccd6f6;
  margin-bottom: 0.5rem;
`

const CardSubtitle = styled.div`
  font-size: 0.875rem;
  color: #8892b0;
  margin-bottom: 0.25rem;
`

const CardMeta = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`

const StatusIndicator = styled.div<{ status: 'success' | 'error' | 'connected' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  
  &::before {
    content: '';
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    background: ${props => 
      props.status === 'success' || props.status === 'connected' 
        ? '#10b981' 
        : '#ef4444'};
    animation: ${pulse} 2s ease-in-out infinite;
  }
  
  color: ${props => 
    props.status === 'success' || props.status === 'connected' 
      ? '#10b981' 
      : '#ef4444'};
`

const ActionButton = styled.button`
  background: none;
  border: 1px solid rgba(138, 146, 176, 0.3);
  color: #8892b0;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 60px;
  position: relative;
  z-index: 10;
  
  &:hover {
    color: #22d3ee;
    border-color: #22d3ee;
    background: rgba(34, 211, 238, 0.1);
  }
  
  &:active {
    transform: translateY(1px);
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1.5rem;
  color: #8892b0;
`

const EmptyStateTitle = styled.div`
  margin-bottom: 1rem;
  font-size: 1rem;
`

const EmptyStateText = styled.div`
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
`

const ExecutionsList = styled.div`
  border-top: 1px solid rgba(138, 146, 176, 0.1);
`

const ExecutionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(138, 146, 176, 0.1);
  transition: background 0.3s ease;
  
  &:hover {
    background: rgba(6, 182, 212, 0.05);
  }
  
  &:last-child {
    border-bottom: none;
  }
`

const ExecutionInfo = styled.div``

const ExecutionName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #ccd6f6;
  margin-bottom: 0.25rem;
`

const ExecutionTime = styled.div`
  font-size: 0.75rem;
  color: #8892b0;
`

const ExecutionResults = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const ExecutionValue = styled.div`
  font-size: 0.875rem;
  color: #8892b0;
`

const ExecutionStatus = styled.div<{ passed: boolean }>`
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  color: ${props => props.passed ? '#10b981' : '#ef4444'};
`

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
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

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/')
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

  const handleDeleteDataSource = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this data source?')) {
      try {
        await apiClient.deleteDataSource(id)
        // Reload dashboard data to reflect the deletion
        loadDashboardData()
      } catch (error) {
        console.error('Failed to delete data source:', error)
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <Container>
        <BackgroundPattern />
        <LoginContainer>
          <LoginCard>
            <LoginHeader>
              <Logo>
                <LogoIcon />
                <LogoText>autoDQ</LogoText>
              </Logo>
              <LoginTitle>Access Portal</LoginTitle>
              <LoginSubtitle>Demo credentials: demo@autodq.com / demo</LoginSubtitle>
            </LoginHeader>

            <Form onSubmit={handleLogin}>
              <InputGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                />
              </InputGroup>

              <InputGroup>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                />
              </InputGroup>

              {error && (
                <ErrorMessage>
                  {error}
                </ErrorMessage>
              )}

              <LoginButton type="submit" disabled={isLoading}>
                {isLoading ? 'Connecting...' : 'Access System'}
              </LoginButton>
            </Form>
          </LoginCard>
        </LoginContainer>
      </Container>
    )
  }

  return (
    <Container>
      <BackgroundPattern />
      {/* Header */}
      <Header>
        <HeaderContent>
          <HeaderLogo>
            <LogoIcon />
            <LogoText>autoDQ</LogoText>
          </HeaderLogo>
          
          <HeaderActions>
            <UserInfo>
              Welcome, {user?.name || user?.email}
            </UserInfo>
            <LogoutButton 
              onClick={handleLogout}
            >
              Logout
            </LogoutButton>
          </HeaderActions>
        </HeaderContent>
      </Header>

      <Main>
        {/* Stats Overview */}
        <Section>
          <SectionTitle>System Overview</SectionTitle>
          
          {loadingData ? (
            <StatsGrid>
              {[...Array(4)].map((_, i) => (
                <LoadingCard key={i}>
                  <LoadingBar height="1rem" width="60%" />
                  <LoadingBar height="2rem" />
                </LoadingCard>
              ))}
            </StatsGrid>
          ) : stats ? (
            <StatsGrid>
              <StatCard color="#3b82f6">
                <StatLabel>Data Sources</StatLabel>
                <StatValue color="#3b82f6">{stats.totalDataSources}</StatValue>
              </StatCard>
              
              <StatCard color="#22d3ee">
                <StatLabel>Indicators</StatLabel>
                <StatValue color="#22d3ee">{stats.totalIndicators}</StatValue>
              </StatCard>
              
              <StatCard color="#ccd6f6">
                <StatLabel>Total Executions</StatLabel>
                <StatValue color="#ccd6f6">{stats.totalExecutions}</StatValue>
              </StatCard>
              
              <StatCard color="#10b981">
                <StatLabel>Success Rate</StatLabel>
                <StatValue color="#10b981">
                  {stats.successRate.toFixed(1)}%
                </StatValue>
              </StatCard>
            </StatsGrid>
          ) : (
            <ContentCard>
              <EmptyState>
                <EmptyStateTitle>No statistics available</EmptyStateTitle>
              </EmptyState>
            </ContentCard>
          )}
        </Section>

        {/* Data Sources */}
        <Section>
          <SectionHeader>
            <SectionTitle>Data Sources</SectionTitle>
            <AddButton onClick={() => navigate('/add-data-source')}>
              + Add Data Source
            </AddButton>
          </SectionHeader>
          
          {dataSources.length > 0 ? (
            dataSources.map((source) => (
              <ContentCard key={source.id}>
                <CardContent>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <CardTitle>{source.name}</CardTitle>
                      <CardSubtitle>
                        {source.type} • {source.host}:{source.port} • {source.database}
                      </CardSubtitle>
                      <CardMeta>
                        {source.indicators?.length || 0} indicators
                      </CardMeta>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                      <StatusIndicator status="connected">
                        Connected
                      </StatusIndicator>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <ActionButton
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/edit-data-source/${source.id}`);
                          }}
                          title="Edit data source"
                        >
                          Edit
                        </ActionButton>
                        <ActionButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDataSource(source.id);
                          }}
                          title="Delete data source"
                          style={{ color: '#ef4444', borderColor: '#ef4444' }}
                        >
                          Delete
                        </ActionButton>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </ContentCard>
            ))
          ) : (
            <ContentCard>
              <EmptyState>
                <EmptyStateTitle>No data sources configured</EmptyStateTitle>
                <EmptyStateText>Add a data source to start monitoring data quality</EmptyStateText>
                <AddButton onClick={() => navigate('/add-data-source')}>Add Your First Data Source</AddButton>
              </EmptyState>
            </ContentCard>
          )}
        </Section>

        {/* Indicators */}
        <Section>
          <SectionHeader>
            <SectionTitle>Quality Indicators</SectionTitle>
            <AddButton disabled={dataSources.length === 0}>
              + Create Indicator
            </AddButton>
          </SectionHeader>
          
          {indicators.length > 0 ? (
            indicators.map((indicator) => (
              <ContentCard key={indicator.id}>
                <CardContent>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <CardTitle>{indicator.name}</CardTitle>
                      {indicator.description && (
                        <CardSubtitle>{indicator.description}</CardSubtitle>
                      )}
                      <CardMeta>
                        {indicator.dataSource?.name} • {indicator.operator} {indicator.threshold}
                      </CardMeta>
                      
                      {/* Recent execution result */}
                      {indicator.executions && indicator.executions.length > 0 && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <StatusIndicator status={indicator.executions[0].passed ? 'success' : 'error'}>
                            Last: {indicator.executions[0].value} 
                            ({indicator.executions[0].passed ? 'PASS' : 'FAIL'})
                          </StatusIndicator>
                        </div>
                      )}
                    </div>
                    
                    <ActionButton onClick={() => executeIndicator(indicator.id)}>
                      Execute
                    </ActionButton>
                  </div>
                </CardContent>
              </ContentCard>
            ))
          ) : (
            <ContentCard>
              <EmptyState>
                <EmptyStateTitle>No quality indicators defined</EmptyStateTitle>
                {dataSources.length > 0 ? (
                  <>
                    <EmptyStateText>Create indicators to monitor data quality</EmptyStateText>
                    <AddButton>Create Your First Indicator</AddButton>
                  </>
                ) : (
                  <EmptyStateText>
                    Add a data source first to create indicators
                  </EmptyStateText>
                )}
              </EmptyState>
            </ContentCard>
          )}
        </Section>

        {/* Recent Executions */}
        {recentExecutions.length > 0 && (
          <Section>
            <SectionTitle>Recent Executions</SectionTitle>
            
            <ContentCard>
              <ExecutionsList>
                {recentExecutions.map((execution) => (
                  <ExecutionItem key={execution.id}>
                    <ExecutionInfo>
                      <ExecutionName>
                        {execution.indicator?.name || 'Unknown Indicator'}
                      </ExecutionName>
                      <ExecutionTime>
                        {new Date(execution.executedAt).toLocaleString()}
                      </ExecutionTime>
                    </ExecutionInfo>
                    
                    <ExecutionResults>
                      <ExecutionValue>
                        Value: {execution.value}
                      </ExecutionValue>
                      <ExecutionStatus passed={execution.passed}>
                        {execution.passed ? 'PASS' : 'FAIL'}
                      </ExecutionStatus>
                    </ExecutionResults>
                  </ExecutionItem>
                ))}
              </ExecutionsList>
            </ContentCard>
          </Section>
        )}
      </Main>
    </Container>
  )
}

export default DashboardPage
