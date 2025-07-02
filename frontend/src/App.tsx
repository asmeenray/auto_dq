import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { getCurrentUser } from './store/slices/authSlice'

// Pages
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import AddDataSourcePage from './pages/AddDataSourcePage'

// App Component that uses Redux
const AppContent: React.FC = () => {
  const dispatch = useAppDispatch()
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Check for existing valid session on app load
    const checkSession = () => {
      try {
        const sessionData = localStorage.getItem('session');
        if (sessionData) {
          const parsed = JSON.parse(sessionData);
          // Check if session is not expired
          if (Date.now() <= parsed.expiresAt) {
            dispatch(getCurrentUser());
            return;
          }
        }
        
        // Fallback: check for old token system
        const token = localStorage.getItem('token');
        if (token) {
          dispatch(getCurrentUser());
        }
      } catch (error) {
        // If there's any error parsing session data, clear it
        localStorage.removeItem('session');
        localStorage.removeItem('token');
      }
    };

    checkSession();
  }, [dispatch])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-void flex items-center justify-center">
        <div className="w-32 h-32 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin"></div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={isAuthenticated ? <DashboardPage /> : <LandingPage />} 
        />
        <Route 
          path="/dashboard" 
          element={<DashboardPage />} 
        />
        <Route 
          path="/add-data-source" 
          element={<AddDataSourcePage />} 
        />
        <Route 
          path="/edit-data-source/:id" 
          element={<AddDataSourcePage />} 
        />
      </Routes>
    </Router>
  )
}

// Main App Component with Redux Provider
function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App
