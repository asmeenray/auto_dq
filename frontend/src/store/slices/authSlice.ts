import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { AuthState, User } from '../../types'

// Updated AuthState interface to include error
interface ExtendedAuthState extends AuthState {
  error?: string;
}

// API base URL
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

// Async thunks for API calls
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    return data;
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password, name }: { email: string; password: string; name?: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    return data;
  }
);

// Check if user is already logged in from localStorage
const getInitialAuthState = (): ExtendedAuthState => {
  try {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      return {
        isAuthenticated: true,
        user: JSON.parse(user),
        token,
        isLoading: false,
        error: undefined,
      };
    }
  } catch (error) {
    console.warn('Failed to parse stored auth data:', error);
  }
  
  return {
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: false,
    error: undefined,
  };
};

const initialState: ExtendedAuthState = getInitialAuthState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = undefined;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = undefined;
    },
    clearAllAuthData: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = undefined;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
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
        
        // Store in localStorage for persistence
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.error.message || 'Login failed';
      })
      // Register cases
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
        
        // Store in localStorage for persistence
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.error.message || 'Registration failed';
      });
  },
});

export const { logout, clearError, clearAllAuthData } = authSlice.actions;
export default authSlice.reducer;
