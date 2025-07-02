import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DataSource, Indicator, IndicatorType, IndicatorExecution } from '../types';
import { getDataSources, createIndicator, executeIndicator, getIndicatorDetails } from '../utils/api-client';
import styled, { keyframes } from 'styled-components';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #0f0f14 50%, #1a1a24 100%);
  position: relative;
  overflow-x: hidden;
`;

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
`;

const MainContent = styled.div`
  position: relative;
  z-index: 1;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const GlassCard = styled.div`
  background: rgba(31, 41, 55, 0.95);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 1rem;
  padding: 2rem;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 30px rgba(6, 182, 212, 0.1);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.5rem;
  color: #22d3ee;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'JetBrains Mono', monospace;
  
  &:hover {
    background: rgba(6, 182, 212, 0.2);
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
  }
`;

const Title = styled.h1`
  font-family: 'Orbitron', monospace;
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(90deg, #22d3ee, #3b82f6, #a21caf);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  letter-spacing: 1px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionTitle = styled.h2`
  font-family: 'Orbitron', monospace;
  font-size: 1.5rem;
  color: #22d3ee;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:before {
    content: '';
    width: 4px;
    height: 20px;
    background: linear-gradient(45deg, #22d3ee, #3b82f6);
    border-radius: 2px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #ccd6f6;
  font-family: 'JetBrains Mono', monospace;
`;

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
`;

const Select = styled.select`
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
  
  option {
    background: #1f2937;
    color: #ccd6f6;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(138, 146, 176, 0.3);
  border-radius: 0.5rem;
  color: #ccd6f6;
  font-size: 0.875rem;
  font-family: 'JetBrains Mono', monospace;
  min-height: 100px;
  resize: vertical;
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
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'JetBrains Mono', monospace;
  
  ${props => props.variant === 'secondary' ? `
    background: rgba(138, 146, 176, 0.1);
    color: #8892b0;
    border: 1px solid rgba(138, 146, 176, 0.3);
    
    &:hover {
      background: rgba(138, 146, 176, 0.2);
      color: #ccd6f6;
    }
  ` : `
    background: linear-gradient(45deg, #22d3ee, #3b82f6);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(34, 211, 238, 0.3);
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 0.5rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  margin-top: 1rem;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
  margin-top: 1rem;
`;

const DetailLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #22d3ee;
  font-family: 'JetBrains Mono', monospace;
`;

const DetailValue = styled.div`
  font-size: 0.875rem;
  color: #ccd6f6;
  font-family: 'JetBrains Mono', monospace;
  
  pre {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 0.25rem;
    padding: 0.5rem;
    margin: 0;
    font-size: 0.75rem;
    overflow-x: auto;
  }
`;

const ExecutionCard = styled.div<{ status: string }>`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid ${props => 
    props.status === 'success' ? 'rgba(16, 185, 129, 0.3)' : 
    props.status === 'failed' ? 'rgba(248, 113, 113, 0.3)' : 
    'rgba(138, 146, 176, 0.3)'};
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const ExecutionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ExecutionStatus = styled.span<{ status: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  background: ${props => 
    props.status === 'success' ? 'rgba(16, 185, 129, 0.2)' : 
    props.status === 'failed' ? 'rgba(248, 113, 113, 0.2)' : 
    'rgba(138, 146, 176, 0.2)'};
  color: ${props => 
    props.status === 'success' ? '#10b981' : 
    props.status === 'failed' ? '#f87171' : 
    '#8892b0'};
`;

const ExecutionTime = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  font-family: 'JetBrains Mono', monospace;
`;

const ExecutionResult = styled.div`
  font-size: 0.875rem;
  color: #ccd6f6;
  font-family: 'JetBrains Mono', monospace;
  margin-top: 0.5rem;
  
  pre {
    background: rgba(0, 0, 0, 0.5);
    border-radius: 0.25rem;
    padding: 0.5rem;
    margin: 0;
    font-size: 0.75rem;
    overflow-x: auto;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-family: 'JetBrains Mono', monospace;
`;

const MetricCard = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(6, 182, 212, 0.2);
  }
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  background: linear-gradient(45deg, #22d3ee, #3b82f6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: 'Orbitron', monospace;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: #8892b0;
  margin-top: 0.5rem;
  font-family: 'JetBrains Mono', monospace;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatusBadge = styled.span<{ status: 'healthy' | 'warning' | 'critical' | 'unknown' }>`
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch (props.status) {
      case 'healthy':
        return `
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        `;
      case 'warning':
        return `
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.3);
        `;
      case 'critical':
        return `
          background: rgba(248, 113, 113, 0.2);
          color: #f87171;
          border: 1px solid rgba(248, 113, 113, 0.3);
        `;
      default:
        return `
          background: rgba(138, 146, 176, 0.2);
          color: #8892b0;
          border: 1px solid rgba(138, 146, 176, 0.3);
        `;
    }
  }}
`;

const ChartContainer = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
`;

const ConfigSection = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(138, 146, 176, 0.2);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
`;

const ConfigRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(138, 146, 176, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const ConfigLabel = styled.div`
  font-size: 0.875rem;
  color: #8892b0;
  font-family: 'JetBrains Mono', monospace;
`;

const ConfigValue = styled.div`
  font-size: 0.875rem;
  color: #ccd6f6;
  font-family: 'JetBrains Mono', monospace;
`;

const TabContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(138, 146, 176, 0.2);
  margin-bottom: 1rem;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: ${props => props.active ? '#22d3ee' : '#8892b0'};
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? '#22d3ee' : 'transparent'};
  transition: all 0.3s ease;
  
  &:hover {
    color: #22d3ee;
  }
`;

const INDICATOR_TYPES: IndicatorType[] = ['freshness', 'completeness', 'validity', 'anomaly'];

const IndicatorDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<IndicatorType>('freshness');
  const [dataSourceId, setDataSourceId] = useState('');
  const [query, setQuery] = useState('');
  const [targetQuery, setTargetQuery] = useState('');
  const [threshold, setThreshold] = useState('');
  const [operator, setOperator] = useState('gte');
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [indicator, setIndicator] = useState<Indicator | null>(null);
  const [executions, setExecutions] = useState<IndicatorExecution[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    getDataSources().then(setDataSources);
    
    // If editing existing indicator, load its details
    if (id) {
      loadIndicatorDetails(id);
    }
  }, [id]);

  const loadIndicatorDetails = async (indicatorId: string) => {
    try {
      const details = await getIndicatorDetails(indicatorId);
      if (details) {
        const { indicator: indicatorData, executions: executionData } = details;
        setIndicator(indicatorData);
        setName(indicatorData.name);
        setDescription(indicatorData.description || '');
        setType(indicatorData.type);
        setDataSourceId(indicatorData.dataSourceId);
        setQuery(indicatorData.query);
        setTargetQuery(indicatorData.targetQuery || '');
        setThreshold(indicatorData.threshold?.toString() || '');
        setOperator(indicatorData.operator || 'gte');
        setExecutions(executionData || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load indicator details');
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value as IndicatorType);
    if (e.target.value !== 'completeness') {
      setTargetQuery('');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        name,
        description,
        type,
        dataSourceId,
        query,
        threshold: threshold ? parseFloat(threshold) : undefined,
        operator: operator || undefined,
      };
      if (type === 'completeness') payload.targetQuery = targetQuery;
      
      const created = await createIndicator(payload);
      setIndicator(created);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save indicator');
    } finally {
      setLoading(false);
    }
  };

  const getIndicatorStatus = (): 'healthy' | 'warning' | 'critical' | 'unknown' => {
    if (executions.length === 0) return 'unknown';
    const latest = executions[0];
    if (!latest) return 'unknown';
    
    if (latest.passed) return 'healthy';
    if (latest.value !== undefined && indicator?.threshold) {
      const diff = Math.abs(latest.value - (indicator.threshold || 0));
      if (diff < (indicator.threshold || 0) * 0.1) return 'warning';
    }
    return 'critical';
  };

  const getSuccessRate = (): number => {
    if (executions.length === 0) return 0;
    const passed = executions.filter(exec => exec.passed).length;
    return Math.round((passed / executions.length) * 100);
  };

  const getAverageValue = (): number => {
    if (executions.length === 0) return 0;
    const sum = executions.reduce((acc, exec) => acc + (exec.value || 0), 0);
    return Math.round((sum / executions.length) * 100) / 100;
  };

  const handleExecute = async () => {
    if (!indicator) return;
    setLoading(true);
    setError(null);
    try {
      await executeIndicator(indicator.id);
      // Refresh execution history
      await loadIndicatorDetails(indicator.id);
    } catch (err: any) {
      setError(err.message || 'Execution failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <BackgroundPattern />
      <MainContent>
        <LeftPanel>
          <GlassCard>
            <Header>
              <BackButton onClick={() => navigate('/dashboard')}>
                ← Back to Dashboard
              </BackButton>
              <Title>{indicator ? 'Edit Indicator' : 'Create New Indicator'}</Title>
            </Header>

            {indicator && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <StatusBadge status={getIndicatorStatus()}>
                    {getIndicatorStatus()}
                  </StatusBadge>
                  <div style={{ color: '#8892b0', fontSize: '0.875rem', fontFamily: 'JetBrains Mono, monospace' }}>
                    Last executed: {executions[0] ? new Date(executions[0].executedAt || executions[0].createdAt).toLocaleString() : 'Never'}
                  </div>
                </div>

                <MetricsGrid>
                  <MetricCard>
                    <MetricValue>{executions.length}</MetricValue>
                    <MetricLabel>Total Executions</MetricLabel>
                  </MetricCard>
                  <MetricCard>
                    <MetricValue>{getSuccessRate()}%</MetricValue>
                    <MetricLabel>Success Rate</MetricLabel>
                  </MetricCard>
                  <MetricCard>
                    <MetricValue>{getAverageValue()}</MetricValue>
                    <MetricLabel>Avg Value</MetricLabel>
                  </MetricCard>
                  <MetricCard>
                    <MetricValue>
                      {executions[0]?.value?.toFixed(2) || 'N/A'}
                    </MetricValue>
                    <MetricLabel>Latest Value</MetricLabel>
                  </MetricCard>
                </MetricsGrid>
              </div>
            )}

            <TabContainer>
              <TabList>
                <Tab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
                  Overview
                </Tab>
                <Tab active={activeTab === 'configuration'} onClick={() => setActiveTab('configuration')}>
                  Configuration
                </Tab>
                <Tab active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}>
                  Analytics
                </Tab>
              </TabList>
            </TabContainer>
            
            {activeTab === 'overview' && (
              <Form onSubmit={handleSave}>
                <InputGroup>
                  <Label>Indicator Name</Label>
                  <Input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Enter indicator name"
                    required 
                  />
                </InputGroup>

                <InputGroup>
                  <Label>Description</Label>
                  <TextArea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    placeholder="Describe what this indicator measures..."
                    style={{ minHeight: '80px' }}
                  />
                </InputGroup>
                
                <InputGroup>
                  <Label>Indicator Type</Label>
                  <Select value={type} onChange={handleTypeChange} required>
                    {INDICATOR_TYPES.map(t => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </Select>
                </InputGroup>
                
                <InputGroup>
                  <Label>Data Source</Label>
                  <Select value={dataSourceId} onChange={e => setDataSourceId(e.target.value)} required>
                    <option value="">Select Data Source</option>
                    {dataSources.map(ds => (
                      <option key={ds.id} value={ds.id}>{ds.name} ({ds.type})</option>
                    ))}
                  </Select>
                </InputGroup>
                
                <InputGroup>
                  <Label>{type === 'completeness' ? 'Source Query' : 'Query'}</Label>
                  <TextArea 
                    value={query} 
                    onChange={e => setQuery(e.target.value)} 
                    placeholder="SELECT COUNT(*) FROM table_name WHERE condition..."
                    required 
                    style={{ minHeight: '120px' }}
                  />
                </InputGroup>
                
                {type === 'completeness' && (
                  <InputGroup>
                    <Label>Target Query</Label>
                    <TextArea 
                      value={targetQuery} 
                      onChange={e => setTargetQuery(e.target.value)} 
                      placeholder="SELECT COUNT(*) FROM target_table WHERE condition..."
                      required 
                      style={{ minHeight: '120px' }}
                    />
                  </InputGroup>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <InputGroup>
                    <Label>Threshold (optional)</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={threshold} 
                      onChange={e => setThreshold(e.target.value)} 
                      placeholder="e.g. 95.0"
                    />
                  </InputGroup>
                  
                  <InputGroup>
                    <Label>Operator</Label>
                    <Select value={operator} onChange={e => setOperator(e.target.value)}>
                      <option value="gte">Greater than or equal (≥)</option>
                      <option value="lte">Less than or equal (≤)</option>
                      <option value="gt">Greater than (&gt;)</option>
                      <option value="lt">Less than (&lt;)</option>
                      <option value="eq">Equal to (=)</option>
                    </Select>
                  </InputGroup>
                </div>
                
                {error && <ErrorMessage>{error}</ErrorMessage>}
                
                <ButtonRow>
                  <ActionButton type="submit" disabled={loading}>
                    {loading ? 'Saving...' : (indicator ? 'Update' : 'Save')}
                  </ActionButton>
                  <ActionButton 
                    type="button" 
                    variant="secondary"
                    onClick={handleExecute} 
                    disabled={!indicator || loading}
                  >
                    {loading ? 'Executing...' : 'Execute Now'}
                  </ActionButton>
                </ButtonRow>
              </Form>
            )}

            {activeTab === 'configuration' && indicator && (
              <ConfigSection>
                <SectionTitle>Configuration Details</SectionTitle>
                <ConfigRow>
                  <ConfigLabel>Name</ConfigLabel>
                  <ConfigValue>{indicator.name}</ConfigValue>
                </ConfigRow>
                <ConfigRow>
                  <ConfigLabel>Type</ConfigLabel>
                  <ConfigValue>{indicator.type}</ConfigValue>
                </ConfigRow>
                <ConfigRow>
                  <ConfigLabel>Data Source</ConfigLabel>
                  <ConfigValue>
                    {dataSources.find(ds => ds.id === indicator.dataSourceId)?.name || indicator.dataSourceId}
                  </ConfigValue>
                </ConfigRow>
                <ConfigRow>
                  <ConfigLabel>Threshold</ConfigLabel>
                  <ConfigValue>{indicator.threshold || 'Not set'}</ConfigValue>
                </ConfigRow>
                <ConfigRow>
                  <ConfigLabel>Operator</ConfigLabel>
                  <ConfigValue>{indicator.operator || 'Not set'}</ConfigValue>
                </ConfigRow>
                <ConfigRow>
                  <ConfigLabel>Created</ConfigLabel>
                  <ConfigValue>{new Date(indicator.createdAt).toLocaleString()}</ConfigValue>
                </ConfigRow>
                <ConfigRow>
                  <ConfigLabel>Last Updated</ConfigLabel>
                  <ConfigValue>{new Date(indicator.updatedAt).toLocaleString()}</ConfigValue>
                </ConfigRow>
                <div style={{ marginTop: '1rem' }}>
                  <ConfigLabel>Query</ConfigLabel>
                  <pre style={{ 
                    background: 'rgba(0, 0, 0, 0.3)', 
                    padding: '1rem', 
                    borderRadius: '0.5rem', 
                    marginTop: '0.5rem',
                    color: '#ccd6f6',
                    fontSize: '0.75rem',
                    overflow: 'auto'
                  }}>
                    {indicator.query}
                  </pre>
                </div>
                {indicator.type === 'completeness' && indicator.targetQuery && (
                  <div style={{ marginTop: '1rem' }}>
                    <ConfigLabel>Target Query</ConfigLabel>
                    <pre style={{ 
                      background: 'rgba(0, 0, 0, 0.3)', 
                      padding: '1rem', 
                      borderRadius: '0.5rem', 
                      marginTop: '0.5rem',
                      color: '#ccd6f6',
                      fontSize: '0.75rem',
                      overflow: 'auto'
                    }}>
                      {indicator.targetQuery}
                    </pre>
                  </div>
                )}
              </ConfigSection>
            )}

            {activeTab === 'analytics' && (
              <div>
                <SectionTitle>Performance Analytics</SectionTitle>
                <ChartContainer>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</div>
                    <div>Historical trend chart coming soon</div>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.7 }}>
                      Will show execution values over time
                    </div>
                  </div>
                </ChartContainer>
              </div>
            )}

          </GlassCard>

          {indicator && activeTab === 'overview' && (
            <GlassCard>
              <SectionTitle>Indicator Summary</SectionTitle>
              <DetailsGrid>
                <DetailLabel>Status:</DetailLabel>
                <DetailValue>
                  <StatusBadge status={getIndicatorStatus()}>
                    {getIndicatorStatus()}
                  </StatusBadge>
                </DetailValue>
                
                <DetailLabel>Type:</DetailLabel>
                <DetailValue>{indicator.type}</DetailValue>
                
                <DetailLabel>Data Source:</DetailLabel>
                <DetailValue>
                  {dataSources.find(ds => ds.id === indicator.dataSourceId)?.name || indicator.dataSourceId}
                </DetailValue>
                
                <DetailLabel>Description:</DetailLabel>
                <DetailValue>{indicator.description || 'No description provided'}</DetailValue>
              </DetailsGrid>
            </GlassCard>
          )}
        </LeftPanel>

        <RightPanel>
          <GlassCard>
            <SectionTitle>Execution History</SectionTitle>
            {executions.length === 0 ? (
              <EmptyState>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
                <div>No executions yet.</div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                  Execute the indicator to see results here.
                </div>
              </EmptyState>
            ) : (
              <div>
                {executions.map(exec => (
                  <ExecutionCard key={exec.id} status={exec.passed ? 'success' : 'failed'}>
                    <ExecutionHeader>
                      <ExecutionStatus status={exec.passed ? 'success' : 'failed'}>
                        {exec.passed ? 'PASSED' : 'FAILED'}
                      </ExecutionStatus>
                      <ExecutionTime>
                        {new Date(exec.executedAt || exec.createdAt).toLocaleString()}
                      </ExecutionTime>
                    </ExecutionHeader>
                    <ExecutionResult>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Value:</strong> {exec.value?.toFixed(2) || 'N/A'}
                        {indicator?.threshold && (
                          <span style={{ marginLeft: '1rem', color: '#8892b0' }}>
                            (Threshold: {indicator.threshold})
                          </span>
                        )}
                      </div>
                      {exec.error && (
                        <div style={{ color: '#f87171', fontSize: '0.75rem' }}>
                          <strong>Error:</strong> {exec.error}
                        </div>
                      )}
                      {exec.result && (
                        <details style={{ marginTop: '0.5rem' }}>
                          <summary style={{ cursor: 'pointer', color: '#22d3ee' }}>
                            View raw result
                          </summary>
                          <pre style={{ 
                            background: 'rgba(0, 0, 0, 0.5)', 
                            padding: '0.5rem', 
                            borderRadius: '0.25rem', 
                            marginTop: '0.5rem',
                            fontSize: '0.7rem',
                            overflow: 'auto'
                          }}>
                            {JSON.stringify(exec.result, null, 2)}
                          </pre>
                        </details>
                      )}
                    </ExecutionResult>
                  </ExecutionCard>
                ))}
              </div>
            )}
          </GlassCard>
        </RightPanel>
      </MainContent>
    </Container>
  );
};

export default IndicatorDetailPage;
