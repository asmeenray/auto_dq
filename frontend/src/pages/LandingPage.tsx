import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginUser, registerUser } from '../store/slices/authSlice'

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main Container - Split Screen Layout */}
      <div className="relative z-10 min-h-screen lg:flex">
        {/* Left Side - Hero Section */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16 min-h-screen lg:min-h-0">
          <div className="max-w-2xl w-full">
            {/* Logo */}
            <div className="flex items-center mb-8 animate-fade-in">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-4 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">⚡</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                autoDQ
              </h1>
            </div>

            {/* Main Heading */}
            <div className="mb-8 animate-fade-in-up">
              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Intelligent
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Data Quality
                </span>
                <br />
                Monitoring
              </h2>

              {/* Description */}
              <p className="text-lg lg:text-xl text-gray-300 mb-8 leading-relaxed">
                Automate your data quality monitoring with AI-powered insights. 
                Monitor, analyze, and optimize your data warehouse quality in real-time.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 animate-fade-in-up delay-200">
              {[
                { icon: '🔍', title: 'Real-time Monitoring', desc: 'Continuous data surveillance' },
                { icon: '📊', title: 'Smart Analytics', desc: 'AI-powered insights' },
                { icon: '🔔', title: 'Intelligent Alerts', desc: 'Proactive notifications' },
                { icon: '⚡', title: 'Multi-Source Support', desc: 'PostgreSQL, MySQL, Redshift' }
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{feature.title}</h3>
                    <p className="text-gray-400 text-xs">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex justify-center sm:justify-start space-x-8 animate-fade-in-up delay-300">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">99.9%</div>
                <div className="text-gray-400 text-sm">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">24/7</div>
                <div className="text-gray-400 text-sm">Monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">Real-time</div>
                <div className="text-gray-400 text-sm">Alerts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:min-h-screen">
          <div className="w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl animate-fade-in-right">
              {/* Form Header */}
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-2">
                  {isLogin ? 'Welcome Back' : 'Join autoDQ'}
                </h3>
                <p className="text-gray-300">
                  {isLogin ? 'Sign in to your account' : 'Create your account'}
                </p>
              </div>

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required={!isLogin}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required={!isLogin}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>

                {!isLogin && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required={!isLogin}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>

              {/* Toggle Mode */}
              <div className="mt-6 text-center">
                <p className="text-gray-300">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    onClick={toggleMode}
                    className="ml-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>

              {/* Demo Account */}
              <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 text-xs text-center">
                  <strong>Demo:</strong> demo@autodq.com / demo<br />
                  <strong>Or:</strong> admin@autodq.com / password
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
