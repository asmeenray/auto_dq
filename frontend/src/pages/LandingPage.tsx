import React from 'react'

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-void relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-cyan/5 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="neural-nav">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-neural-gradient rounded-sm"></div>
            <span className="font-display font-bold text-xl text-gradient">autoDQ</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="neural-nav-item">Features</a>
            <a href="#demo" className="neural-nav-item">Demo</a>
            <a href="#pricing" className="neural-nav-item">Pricing</a>
          </div>
          <div className="flex items-center space-x-4">
            <button className="neural-btn-ghost">Enter</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <div className="mb-8 neural-entrance">
            <h1 className="text-6xl md:text-7xl font-display font-bold mb-6">
              <span className="neural-heading">INTELLIGENT DATA</span>
              <br />
              <span className="neural-heading">QUALITY AUTOMATION</span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-stardust max-w-2xl mx-auto leading-relaxed">
              Monitor • Analyze • Predict • Optimize
              <br />
              <span className="text-lg opacity-80">
                The future of data quality is autonomous
              </span>
            </p>
          </div>

          {/* CTA Button */}
          <div className="mb-16 neural-entrance" style={{ animationDelay: '0.2s' }}>
            <button className="neural-btn-primary text-lg px-12 py-4 neural-glow">
              Initialize System
            </button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: '◆',
                title: 'Real-time',
                subtitle: 'Monitoring',
                description: 'Continuous surveillance of data streams with neural pattern recognition',
                delay: '0.4s'
              },
              {
                icon: '⚡',
                title: 'Predictive',
                subtitle: 'Analytics',
                description: 'AI-powered forecasting prevents quality issues before they occur',
                delay: '0.6s'
              },
              {
                icon: '🌟',
                title: 'Autonomous',
                subtitle: 'Correction',
                description: 'Self-healing systems automatically resolve detected anomalies',
                delay: '0.8s'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="neural-card neural-float p-8 text-center neural-entrance"
                style={{ animationDelay: feature.delay }}
              >
                <div className="text-4xl mb-4 text-accent-cyan">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-neutral-moonlight mb-2">
                  {feature.title}
                </h3>
                <h4 className="text-lg text-primary-400 mb-4">{feature.subtitle}</h4>
                <p className="text-neutral-stardust text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Status Line */}
          <div className="mt-16 neural-entrance" style={{ animationDelay: '1s' }}>
            <div className="flex justify-center items-center space-x-8 text-sm text-neutral-stardust">
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
                <span>Connected to Future of Data</span>
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>
    </div>
  )
}

export default LandingPage
