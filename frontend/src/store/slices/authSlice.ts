import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { AuthState, User } from '../../types'
import { apiClient } from '../../utils/api-client'

// Updated AuthState interface to include error
interface ExtendedAuthState extends AuthState {
  error?: string;
}

const initialState: ExtendedAuthState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: undefined,
}

// For demo purposes, we'll create a mock user since we don't have full auth yet
const MOCK_USER: User = {
  id: 'demo-user-1',
  email: 'demo@autodq.com',
  name: 'Demo User',
  createdAt: new Date().toISOString(),
}

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // For demo purposes, we'll use mock authentication
      if ((credentials.email === 'demo@autodq.com' && credentials.password === 'demo') ||
          (credentials.email === 'admin@autodq.com' && credentials.password === 'password')) {
        const token = 'demo-token-' + Date.now();
        localStorage.setItem('token', token);
        
        return { token, user: MOCK_USER };
      } else {
        return rejectWithValue('Invalid credentials');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; name?: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.createUser(userData);
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      // Auto-login after registration
      const token = 'demo-token-' + Date.now();
      localStorage.setItem('token', token);
      
      return { token, user: response.data!.user };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
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
    localStorage.removeItem('token');
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
        localStorage.removeItem('token');
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

export const { clearError, setAuthenticated } = authSlice.actions
export default authSlice.reducer
