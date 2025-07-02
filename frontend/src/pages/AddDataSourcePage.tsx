import React, { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { useNavigate, useParams } from 'react-router-dom'
import { apiClient } from '../utils/api-client'
import { useAppSelector } from '../store/hooks'

interface DataSourceFormData {
  name: string;
  type: 'redshift' | 'snowflake' | '';
  host: string;
  port: number;
  database: string;
  schema?: string;
  username: string;
  password: string;
  warehouse?: string; // For Snowflake
  role?: string; // For Snowflake
  account?: string; // For Snowflake
}

// Animations
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

const LogoIcon = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  background: linear-gradient(135deg, #22d3ee, #3b82f6);
  border-radius: 0.375rem;
  animation: ${float} 3s ease-in-out infinite;
`

const LogoText = styled.span`
  font-family: 'Orbitron', monospace;
  font-weight: bold;
  font-size: 1.25rem;
  background: linear-gradient(to right, #22d3ee, #3b82f6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const BackButton = styled.button`
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
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #ccd6f6;
  margin-bottom: 0.5rem;
  text-align: center;
`

const PageSubtitle = styled.p`
  color: #8892b0;
  text-align: center;
  margin-bottom: 3rem;
  font-size: 1.125rem;
`

const FormCard = styled.div`
  background: rgba(31, 41, 55, 0.8);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 1rem;
  padding: 2rem;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 30px rgba(6, 182, 212, 0.1);
  animation: ${slideIn} 0.6s ease-out;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const FormGroup = styled.div`
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

const DatabaseTypeCard = styled.div<{ selected: boolean }>`
  padding: 1rem;
  border: 2px solid ${props => props.selected ? '#22d3ee' : 'rgba(138, 146, 176, 0.3)'};
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.selected ? 'rgba(34, 211, 238, 0.1)' : 'rgba(0, 0, 0, 0.3)'};
  
  &:hover {
    border-color: #22d3ee;
    background: rgba(34, 211, 238, 0.05);
  }
`

const DatabaseTypeTitle = styled.h3`
  color: #ccd6f6;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`

const DatabaseTypeDescription = styled.p`
  color: #8892b0;
  font-size: 0.875rem;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger'; disabled?: boolean }>`
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.3s ease;
  
  ${props => props.variant === 'primary' && `
    background: linear-gradient(135deg, #22d3ee, #3b82f6);
    color: black;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #06b6d4, #2563eb);
      transform: translateY(-1px);
      box-shadow: 0 10px 25px rgba(6, 182, 212, 0.3);
    }
  `}
  
  ${props => props.variant === 'secondary' && `
    background: none;
    border: 1px solid rgba(138, 146, 176, 0.3);
    color: #8892b0;
    
    &:hover:not(:disabled) {
      color: #ccd6f6;
      border-color: #8892b0;
      background: rgba(138, 146, 176, 0.1);
    }
  `}
  
  ${props => props.variant === 'danger' && `
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
    }
  `}
`

const ErrorMessage = styled.div`
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 0.5rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  margin-top: 1rem;
`

const SuccessMessage = styled.div`
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 0.5rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  margin-top: 1rem;
`

const TestConnectionButton = styled(Button)`
  max-width: 200px;
  margin-top: 1rem;
`

const AddDataSourcePage: React.FC = () => {
  const navigate = useNavigate()
  const params = useParams()
  const { user } = useAppSelector(state => state.auth)
  const isEditMode = Boolean(params.id)
  const [formData, setFormData] = useState<DataSourceFormData>({
    name: '',
    type: '',
    host: '',
    port: 5439, // Default Redshift port
    database: '',
    schema: '',
    username: '',
    password: '',
    warehouse: '',
    role: '',
    account: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [connectionTestResult, setConnectionTestResult] = useState<'success' | 'error' | null>(null)

  // Load data source data when in edit mode
  useEffect(() => {
    if (isEditMode && params.id) {
      const loadDataSource = async () => {
        try {
          const response = await apiClient.getDataSource(params.id!)
          if (response.data?.dataSource) {
            const ds = response.data.dataSource
            setFormData({
              name: ds.name || '',
              type: ds.type || '',
              host: ds.host || '',
              port: ds.port || 5439,
              database: ds.database || '',
              schema: ds.schema || '',
              username: ds.username || '',
              password: '', // Don't pre-fill password for security
              warehouse: ds.warehouse || '',
              role: ds.role || '',
              account: ds.account || ''
            })
          } else {
            setError('Data source not found')
          }
        } catch (error) {
          setError('Failed to load data source')
        }
      }
      loadDataSource()
    }
  }, [isEditMode, params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'port' ? parseInt(value) || 0 : value
    }))
    
    // Clear messages when user types
    setError('')
    setSuccessMessage('')
    setConnectionTestResult(null)
  }

  const handleDatabaseTypeSelect = (type: 'redshift' | 'snowflake') => {
    setFormData(prev => ({
      ...prev,
      type,
      port: type === 'redshift' ? 5439 : 443, // Default ports
      warehouse: type === 'snowflake' ? prev.warehouse : '',
      role: type === 'snowflake' ? prev.role : '',
      account: type === 'snowflake' ? prev.account : ''
    }))
    setError('')
    setSuccessMessage('')
    setConnectionTestResult(null)
  }

  const testConnection = async () => {
    if (!formData.type || !formData.host || !formData.username || !formData.password) {
      setError('Please fill in all required connection details before testing')
      return
    }

    setIsTestingConnection(true)
    setError('')
    setSuccessMessage('')
    setConnectionTestResult(null)

    try {
      console.log('🧪 Testing connection with data:', { ...formData, password: '***' })
      const response = await apiClient.testDataSourceConnection(formData)
      console.log('📡 Connection test response:', response)
      
      // Check if we got a successful response from the API
      if (response.data) {
        if (response.data.success) {
          setConnectionTestResult('success')
          setSuccessMessage(response.data.message || 'Connection test successful!')
        } else {
          setConnectionTestResult('error')
          // Show detailed error information
          const errorMessage = response.data.error 
            ? `${response.data.message}: ${response.data.error}`
            : response.data.message || 'Connection test failed'
          console.log('❌ Connection test failed:', errorMessage)
          setError(errorMessage)
        }
      } else if (response.error) {
        // Handle API client errors
        setConnectionTestResult('error')
        console.log('🚨 API client error:', response.error)
        setError(response.error)
      } else {
        setConnectionTestResult('error')
        console.log('❓ Unknown error in connection test')
        setError('Unknown error occurred during connection test')
      }
    } catch (err: any) {
      setConnectionTestResult('error')
      setError(err.message || 'Failed to test connection')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.type || !formData.host || !formData.username) {
      setError('Please fill in all required fields')
      return
    }

    // In edit mode, password is optional (only update if provided)
    if (!isEditMode && !formData.password) {
      setError('Password is required')
      return
    }

    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const dataSourceInput = {
        ...formData,
        userId: user.id
      }
      
      let response
      if (isEditMode && params.id) {
        response = await apiClient.updateDataSource(params.id, dataSourceInput)
        if (response.data?.dataSource) {
          setSuccessMessage('Data source updated successfully!')
        } else {
          setError(response.error || 'Failed to update data source')
        }
      } else {
        response = await apiClient.createDataSource(dataSourceInput)
        if (response.data?.dataSource) {
          setSuccessMessage('Data source created successfully!')
        } else {
          setError(response.error || 'Failed to create data source')
        }
      }
      
      if (response.data?.dataSource) {
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} data source`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container>
      <BackgroundPattern />
      
      <Header>
        <HeaderContent>
          <HeaderLogo>
            <LogoIcon />
            <LogoText>autoDQ</LogoText>
          </HeaderLogo>
          <BackButton onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </BackButton>
        </HeaderContent>
      </Header>

      <Main>
        <PageTitle>{isEditMode ? 'Edit Data Source' : 'Add Data Source'}</PageTitle>
        <PageSubtitle>
          {isEditMode 
            ? 'Update your data source configuration' 
            : 'Connect to your data warehouse to start monitoring data quality'
          }
        </PageSubtitle>

        <FormCard>
          <Form onSubmit={handleSubmit}>
            {/* Data Source Name */}
            <FormGroup>
              <Label>Data Source Name *</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Production Data Warehouse"
                required
              />
            </FormGroup>

            {/* Database Type Selection */}
            <FormGroup>
              <Label>Database Type *</Label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                <DatabaseTypeCard 
                  selected={formData.type === 'redshift'}
                  onClick={() => handleDatabaseTypeSelect('redshift')}
                >
                  <DatabaseTypeTitle>Amazon Redshift</DatabaseTypeTitle>
                  <DatabaseTypeDescription>
                    Fast, simple, cost-effective data warehouse
                  </DatabaseTypeDescription>
                </DatabaseTypeCard>
                
                <DatabaseTypeCard 
                  selected={formData.type === 'snowflake'}
                  onClick={() => handleDatabaseTypeSelect('snowflake')}
                >
                  <DatabaseTypeTitle>Snowflake</DatabaseTypeTitle>
                  <DatabaseTypeDescription>
                    Cloud-native data platform
                  </DatabaseTypeDescription>
                </DatabaseTypeCard>
              </div>
            </FormGroup>

            {/* Connection Details */}
            {formData.type && (
              <>
                <FormRow>
                  <FormGroup>
                    <Label>Host *</Label>
                    <Input
                      type="text"
                      name="host"
                      value={formData.host}
                      onChange={handleInputChange}
                      placeholder={formData.type === 'redshift' 
                        ? 'redshift-cluster.region.redshift.amazonaws.com' 
                        : 'account.region.snowflakecomputing.com'
                      }
                      required
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Port *</Label>
                    <Input
                      type="number"
                      name="port"
                      value={formData.port}
                      onChange={handleInputChange}
                      placeholder={formData.type === 'redshift' ? '5439' : '443'}
                      required
                    />
                  </FormGroup>
                </FormRow>

                <FormRow>
                  <FormGroup>
                    <Label>Database *</Label>
                    <Input
                      type="text"
                      name="database"
                      value={formData.database}
                      onChange={handleInputChange}
                      placeholder="database_name"
                      required
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Schema</Label>
                    <Input
                      type="text"
                      name="schema"
                      value={formData.schema}
                      onChange={handleInputChange}
                      placeholder="public"
                    />
                  </FormGroup>
                </FormRow>

                {/* Snowflake specific fields */}
                {formData.type === 'snowflake' && (
                  <FormRow>
                    <FormGroup>
                      <Label>Warehouse</Label>
                      <Input
                        type="text"
                        name="warehouse"
                        value={formData.warehouse}
                        onChange={handleInputChange}
                        placeholder="COMPUTE_WH"
                      />
                    </FormGroup>
                    
                    <FormGroup>
                      <Label>Role</Label>
                      <Input
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        placeholder="ACCOUNTADMIN"
                      />
                    </FormGroup>
                  </FormRow>
                )}

                {formData.type === 'snowflake' && (
                  <FormGroup>
                    <Label>Account</Label>
                    <Input
                      type="text"
                      name="account"
                      value={formData.account}
                      onChange={handleInputChange}
                      placeholder="your-account-identifier"
                    />
                  </FormGroup>
                )}

                <FormRow>
                  <FormGroup>
                    <Label>Username *</Label>
                    <Input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="username"
                      required
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Password *</Label>
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="password"
                      required
                    />
                  </FormGroup>
                </FormRow>

                {/* Test Connection Button */}
                <TestConnectionButton
                  type="button"
                  variant="secondary"
                  onClick={testConnection}
                  disabled={isTestingConnection || !formData.type || !formData.host || !formData.username || !formData.password}
                >
                  {isTestingConnection ? 'Testing...' : 'Test Connection'}
                </TestConnectionButton>
              </>
            )}

            {/* Messages */}
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

            {/* Submit Buttons */}
            <ButtonGroup>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || !formData.type || connectionTestResult !== 'success'}
              >
                {isLoading 
                  ? (isEditMode ? 'Updating...' : 'Creating...') 
                  : (isEditMode ? 'Update Data Source' : 'Create Data Source')
                }
              </Button>
            </ButtonGroup>
          </Form>
        </FormCard>
      </Main>
    </Container>
  )
}

export default AddDataSourcePage
