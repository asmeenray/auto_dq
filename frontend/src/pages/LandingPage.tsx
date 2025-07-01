import React, { useState, useEffect } from 'react'
import styled, { keyframes, createGlobalStyle } from 'styled-components'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginUser, registerUser } from '../store/slices/authSlice'

// Global styles for animations
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');
`

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px) translateX(0px); }
  25% { transform: translateY(-5px) translateX(2px); }
  50% { transform: translateY(-10px) translateX(-2px); }
  75% { transform: translateY(-5px) translateX(1px); }
`

const pulseGlow = keyframes`
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
`

const typewriter = keyframes`
  from { width: 0; }
  to { width: 100%; }
`

const glitch = keyframes`
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-1px, 1px); }
  40% { transform: translate(-1px, -1px); }
  60% { transform: translate(1px, 1px); }
  80% { transform: translate(1px, -1px); }
`

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: black;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (min-width: 1024px) {
    flex-direction: row;
  }
`

const BackgroundLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
`

const GridPattern = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.2;
  background-image: 
    linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  width: 100%;
  height: 100%;
`

const Particle = styled.div<{ x: number; y: number; size: number; delay: number; duration: number }>`
  position: absolute;
  border-radius: 50%;
  background: #22d3ee;
  opacity: 0.3;
  animation: ${float} ${props => props.duration}s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  left: ${props => props.x}%;
  top: ${props => props.y}%;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
`

const GradientOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), transparent, rgba(147, 51, 234, 0.1));
`

const MainContent = styled.div`
  position: relative;
  z-index: 10;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  @media (min-width: 1024px) {
    flex-direction: row;
  }
`

const HeroSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(0, 0, 0, 0.8));

  @media (min-width: 1024px) {
    padding: 4rem;
  }
`

const HeroContent = styled.div`
  max-width: 40rem;
  text-align: center;

  @media (min-width: 1024px) {
    text-align: left;
  }
`

const LogoSection = styled.div`
  margin-bottom: 2rem;
`

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;

  @media (min-width: 1024px) {
    justify-content: flex-start;
  }
`

const LogoIcon = styled.div`
  width: 4rem;
  height: 4rem;
  margin-right: 1rem;
  position: relative;
`

const LogoIconBackground = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, #22d3ee, #3b82f6);
  border-radius: 50%;
  animation: ${pulseGlow} 2s ease-in-out infinite;
`

const LogoIconInner = styled.div`
  position: absolute;
  inset: 0.5rem;
  background: black;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #22d3ee;
`

const MainTitle = styled.h1`
  font-size: 3.75rem;
  font-weight: bold;
  background: linear-gradient(to right, #22d3ee, #3b82f6, #a855f7);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 400% 400%;
  animation: ${gradientShift} 3s ease-in-out infinite;
`

const SubTitle = styled.p`
  color: #22d3ee;
  font-size: 1.125rem;
  font-family: 'JetBrains Mono', monospace;
  overflow: hidden;
  white-space: nowrap;
  animation: ${typewriter} 2s steps(30, end);
`

const Headline = styled.h2`
  font-size: 3rem;
  font-weight: bold;
  color: white;
  margin-bottom: 1.5rem;
  line-height: 1.2;

  @media (min-width: 1024px) {
    font-size: 4rem;
  }
`

const HeadlinePrefix = styled.span`
  display: block;
  font-size: 1.25rem;
  color: #22d3ee;
  font-family: 'JetBrains Mono', monospace;
  margin-bottom: 0.5rem;
`

const HeadlineGradient = styled.span`
  background: linear-gradient(to right, #22d3ee, #a855f7);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  
  &:hover {
    animation: ${glitch} 0.3s ease-in-out;
  }
`

const Description = styled.p`
  font-size: 1.25rem;
  color: #d1d5db;
  margin-bottom: 2rem;
  line-height: 1.6;
`

const ClassifiedTag = styled.span`
  color: #22d3ee;
`

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2rem;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
`

const FeatureCard = styled.div<{ borderColor: string; hoverColor: string }>`
  padding: 1rem;
  background: rgba(31, 41, 55, 0.5);
  border: 1px solid ${props => props.borderColor}4D;
  border-radius: 0.5rem;
  transition: all 0.3s duration;
  
  &:hover {
    border-color: ${props => props.hoverColor};
    background: ${props => props.hoverColor}1A;
  }
`

const FeatureTitle = styled.h3<{ color: string }>`
  color: ${props => props.color};
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const FeatureDescription = styled.p`
  color: #9ca3af;
  font-size: 0.875rem;
`

const StatsSection = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  text-align: center;

  @media (min-width: 1024px) {
    justify-content: flex-start;
  }
`

const StatItem = styled.div`
  text-align: center;
`

const StatValue = styled.div<{ color: string }>`
  font-size: 1.875rem;
  font-weight: bold;
  color: ${props => props.color};
  margin-bottom: 0.25rem;
`

const StatLabel = styled.div`
  color: #9ca3af;
  font-size: 0.875rem;
`

const AuthSection = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(55, 65, 81, 0.8), rgba(31, 41, 55, 0.8));

  @media (min-width: 1024px) {
    width: 24rem;
  }
`

const TerminalWindow = styled.div`
  width: 100%;
  max-width: 28rem;
  background: rgba(31, 41, 55, 0.9);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(20px);
`

const TerminalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: rgba(55, 65, 81, 0.5);
  border-bottom: 1px solid rgba(6, 182, 212, 0.3);
`

const TerminalButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`

const TerminalButton = styled.div<{ color: string }>`
  width: 0.75rem;
  height: 0.75rem;
  background: ${props => props.color};
  border-radius: 50%;
`

const TerminalTitle = styled.div`
  color: #22d3ee;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
`

const TerminalContent = styled.div`
  padding: 1.5rem;
`

const TerminalPrompt = styled.div`
  margin-bottom: 1.5rem;
`

const PromptLine = styled.div<{ color: string }>`
  color: ${props => props.color};
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`

const Label = styled.label`
  color: #22d3ee;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
`

const Input = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.25rem;
  color: white;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  transition: all 0.3s;
  
  &:focus {
    outline: none;
    border-color: #22d3ee;
    background: rgba(6, 182, 212, 0.1);
  }
  
  &::placeholder {
    color: #6b7280;
  }
`

const ErrorMessage = styled.div`
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 0.25rem;
  color: #fca5a5;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
`

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(to right, #06b6d4, #2563eb);
  color: black;
  font-family: 'JetBrains Mono', monospace;
  font-weight: bold;
  border: none;
  border-radius: 0.25rem;
  transition: all 0.3s;
  cursor: pointer;
  
  &:hover:not(:disabled) {
    background: linear-gradient(to right, #22d3ee, #3b82f6);
    transform: scale(1.02);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #22d3ee;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.3s;
  
  &:hover {
    color: #67e8f9;
  }
`

const DemoInfo = styled.div`
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #4b5563;
`

const DemoTitle = styled.div`
  color: #10b981;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
`

const DemoCredentials = styled.div`
  color: #9ca3af;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const LandingPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: ''
  })
  
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.auth)

  // Animated particles effect
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, delay: number, duration: number}>>([])

  useEffect(() => {
    // Generate particles for background animation
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: i * 0.1,
      duration: 3 + Math.random() * 4
    }))
    setParticles(newParticles)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isLogin) {
      dispatch(loginUser({
        email: formData.email,
        password: formData.password
      }))
    } else {
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match')
        return
      }
      dispatch(registerUser({
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`
      }))
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      confirmPassword: ''
    })
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    resetForm()
  }

  return (
    <>
      <GlobalStyle />
      <Container>
        {/* Animated Background */}
        <BackgroundLayer>
          <GridPattern />
          
          {/* Animated Particles */}
          {particles.map((particle) => (
            <Particle
              key={particle.id}
              x={particle.x}
              y={particle.y}
              size={particle.size}
              delay={particle.delay}
              duration={particle.duration}
            />
          ))}

          <GradientOverlay />
        </BackgroundLayer>

        {/* Main Content */}
        <MainContent>
          {/* Left Side - Hero Section */}
          <HeroSection>
            <HeroContent>
              {/* Logo & Brand */}
              <LogoSection>
                <LogoContainer>
                  <LogoIcon>
                    <LogoIconBackground />
                    <LogoIconInner>⚡</LogoIconInner>
                  </LogoIcon>
                  <MainTitle>autoDQ</MainTitle>
                </LogoContainer>
                
                <SubTitle>
                  &gt; INITIALIZING_DATA_QUALITY_PROTOCOL...
                </SubTitle>
              </LogoSection>

              {/* Main Headline */}
              <Headline>
                <HeadlinePrefix>NEXT-GEN</HeadlinePrefix>
                Intelligent
                <br />
                <HeadlineGradient>Data Quality</HeadlineGradient>
                <br />
                Monitoring
              </Headline>

              {/* Description */}
              <Description>
                <ClassifiedTag>[CLASSIFIED]</ClassifiedTag> Advanced AI-powered monitoring system for 
                real-time data warehouse quality analysis. Deploy autonomous quality 
                protocols with quantum-speed insights.
              </Description>

              {/* Feature Grid */}
              <FeatureGrid>
                <FeatureCard borderColor="#06b6d4" hoverColor="#22d3ee">
                  <FeatureTitle color="#22d3ee">
                    ∞ Real-time Sync
                  </FeatureTitle>
                  <FeatureDescription>Quantum-speed monitoring</FeatureDescription>
                </FeatureCard>

                <FeatureCard borderColor="#a855f7" hoverColor="#c084fc">
                  <FeatureTitle color="#c084fc">
                    ◊ Neural Analytics
                  </FeatureTitle>
                  <FeatureDescription>AI-driven insights</FeatureDescription>
                </FeatureCard>

                <FeatureCard borderColor="#10b981" hoverColor="#34d399">
                  <FeatureTitle color="#34d399">
                    ⟡ Smart Alerts
                  </FeatureTitle>
                  <FeatureDescription>Predictive notifications</FeatureDescription>
                </FeatureCard>

                <FeatureCard borderColor="#f59e0b" hoverColor="#fbbf24">
                  <FeatureTitle color="#fbbf24">
                    ⬢ Multi-Source
                  </FeatureTitle>
                  <FeatureDescription>Universal compatibility</FeatureDescription>
                </FeatureCard>
              </FeatureGrid>

              {/* Stats */}
              <StatsSection>
                <StatItem>
                  <StatValue color="#22d3ee">99.9%</StatValue>
                  <StatLabel>Uptime</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue color="#c084fc">&lt;1ms</StatValue>
                  <StatLabel>Latency</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue color="#34d399">∞</StatValue>
                  <StatLabel>Scale</StatLabel>
                </StatItem>
              </StatsSection>
            </HeroContent>
          </HeroSection>

          {/* Right Side - Auth Terminal */}
          <AuthSection>
            <TerminalWindow>
              {/* Terminal Header */}
              <TerminalHeader>
                <TerminalButtons>
                  <TerminalButton color="#ef4444" />
                  <TerminalButton color="#eab308" />
                  <TerminalButton color="#22c55e" />
                </TerminalButtons>
                <TerminalTitle>
                  SECURE_TERMINAL_v2.1
                </TerminalTitle>
                <div style={{ width: '1rem' }} />
              </TerminalHeader>

              {/* Terminal Content */}
              <TerminalContent>
                {/* Terminal Prompt */}
                <TerminalPrompt>
                  <PromptLine color="#10b981">
                    root@autodq:~$ authenticate_user
                  </PromptLine>
                  <PromptLine color="#22d3ee">
                    {isLogin ? 'LOGIN_PROTOCOL_ACTIVE' : 'REGISTRATION_PROTOCOL_ACTIVE'}
                  </PromptLine>
                </TerminalPrompt>

                {/* Auth Form */}
                <Form onSubmit={handleSubmit}>
                  {!isLogin && (
                    <InputRow>
                      <InputGroup>
                        <Label>FIRST_NAME:</Label>
                        <Input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required={!isLogin}
                          placeholder="John"
                        />
                      </InputGroup>
                      <InputGroup>
                        <Label>LAST_NAME:</Label>
                        <Input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required={!isLogin}
                          placeholder="Doe"
                        />
                      </InputGroup>
                    </InputRow>
                  )}

                  <InputGroup>
                    <Label>EMAIL_ADDRESS:</Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="user@domain.com"
                    />
                  </InputGroup>

                  <InputGroup>
                    <Label>PASSWORD:</Label>
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder="••••••••"
                    />
                  </InputGroup>

                  {!isLogin && (
                    <InputGroup>
                      <Label>CONFIRM_PASSWORD:</Label>
                      <Input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required={!isLogin}
                        placeholder="••••••••"
                      />
                    </InputGroup>
                  )}

                  {error && (
                    <ErrorMessage>
                      ERROR: {error}
                    </ErrorMessage>
                  )}

                  <SubmitButton type="submit" disabled={isLoading}>
                    {isLoading ? 'PROCESSING...' : (isLogin ? 'AUTHENTICATE' : 'REGISTER')}
                  </SubmitButton>
                </Form>

                {/* Toggle Mode */}
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <ToggleButton onClick={toggleMode}>
                    {isLogin ? '> CREATE_NEW_ACCOUNT' : '> EXISTING_USER_LOGIN'}
                  </ToggleButton>
                </div>

                {/* Demo Info */}
                <DemoInfo>
                  <DemoTitle>DEMO_CREDENTIALS:</DemoTitle>
                  <DemoCredentials>
                    <div>demo@autodq.com / demo</div>
                    <div>admin@autodq.com / password</div>
                  </DemoCredentials>
                </DemoInfo>
              </TerminalContent>
            </TerminalWindow>
          </AuthSection>
        </MainContent>
      </Container>
    </>
  )
}

export default LandingPage
