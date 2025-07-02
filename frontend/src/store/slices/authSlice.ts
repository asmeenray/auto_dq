import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { AuthState, User } from '../../types'

// Updated AuthState interface to include error
interface ExtendedAuthState extends AuthState {
  error?: string;
}

// For demo purposes, we'll create a mock user since we don't have full auth yet
const MOCK_USER: User = {
  id: 'demo-user-1',
  email: 'demo@autodq.com',
  name: 'Demo User',
  createdAt: new Date().toISOString(),
}

const initialState: ExtendedAuthState = {
  isAuthenticated: false, // Start as not authenticated
  user: null, // No user by default
  token: null, // No token by default
  isLoading: false,
  error: undefined,
}

// Helper functions for demo user management
const getStoredUsers = (): Array<{email: string, password: string, name: string}> => {
  try {
    const users = localStorage.getItem('demo-users');
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
}

const storeUser = (email: string, password: string, name: string) => {
  const users = getStoredUsers();
  const existingUserIndex = users.findIndex(u => u.email === email);
  
  if (existingUserIndex >= 0) {
    users[existingUserIndex] = { email, password, name };
  } else {
    users.push({ email, password, name });
  }
  
  localStorage.setItem('demo-users', JSON.stringify(users));
}

const findUser = (email: string, password: string) => {
  const users = getStoredUsers();
  return users.find(u => u.email === email && u.password === password);
}

// Session management helpers
const SESSION_DURATION = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

const setSessionData = (token: string, user: User) => {
  const sessionData = {
    token,
    user,
    expiresAt: Date.now() + SESSION_DURATION
  };
  localStorage.setItem('session', JSON.stringify(sessionData));
  localStorage.setItem('token', token); // Keep for backward compatibility
}

const getSessionData = () => {
  try {
    const sessionData = localStorage.getItem('session');
    if (!sessionData) return null;
    
    const parsed = JSON.parse(sessionData);
    
    // Check if session is expired
    if (Date.now() > parsed.expiresAt) {
      clearSessionData();
      return null;
    }
    
    return parsed;
  } catch {
    return null;
  }
}

const clearSessionData = () => {
  localStorage.removeItem('session');
  localStorage.removeItem('token');
}

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // For demo purposes, we'll use mock authentication
      // Check hardcoded demo credentials first
      if ((credentials.email === 'demo@autodq.com' && credentials.password === 'demo') ||
          (credentials.email === 'admin@autodq.com' && credentials.password === 'password')) {
        const token = 'demo-token-' + Date.now();
        const user = MOCK_USER;
        setSessionData(token, user);
        
        return { token, user };
      }
      
      // Check registered users
      const registeredUser = findUser(credentials.email, credentials.password);
      if (registeredUser) {
        const token = 'demo-token-' + Date.now();
        const user = {
          ...MOCK_USER,
          email: registeredUser.email,
          name: registeredUser.name
        };
        setSessionData(token, user);
        
        return { token, user };
      }
      
      return rejectWithValue('Invalid credentials');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; name?: string; password: string }, { rejectWithValue }) => {
    try {
      // For demo purposes, we'll use mock registration
      // In a real app, this would call the actual API
      
      // Simulate some validation
      if (!userData.email || !userData.password) {
        return rejectWithValue('Email and password are required');
      }
      
      if (userData.password.length < 3) {
        return rejectWithValue('Password must be at least 3 characters');
      }
      
      // Check if user already exists
      const existingUsers = getStoredUsers();
      const userExists = existingUsers.some(u => u.email === userData.email);
      
      if (userExists) {
        return rejectWithValue('User with this email already exists');
      }
      
      // Store user for future logins
      const userName = userData.name || userData.email.split('@')[0];
      storeUser(userData.email, userData.password, userName);
      
      // Auto-login after registration with mock user
      const token = 'demo-token-' + Date.now();
      const newUser = {
        ...MOCK_USER,
        email: userData.email,
        name: userName
      };
      setSessionData(token, newUser);
      
      return { token, user: newUser };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      // Check if we have a valid session
      const sessionData = getSessionData();
      if (sessionData) {
        return sessionData.user;
      }
      
      // Fallback: check old token system for backward compatibility
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }
      
      // For demo purposes, return mock user if token exists
      if (token.startsWith('demo-token')) {
        return MOCK_USER;
      }
      
      return rejectWithValue('Invalid token');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get user');
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    clearSessionData();
    return null;
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = undefined;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    clearAllAuthData: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = undefined;
      clearSessionData();
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = undefined;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = undefined;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        clearSessionData();
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = undefined;
      });
  },
})

export const { clearError, setAuthenticated, clearAllAuthData } = authSlice.actions
export default authSlice.reducer
