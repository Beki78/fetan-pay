import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  email: string;
  id?: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Get initial auth state from localStorage
const getInitialAuth = (): AuthState => {
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return {
          user,
          isAuthenticated: true,
          isLoading: false,
        };
      } catch {
        // Invalid stored data
      }
    }
  }
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  };
};

const initialState: AuthState = getInitialAuth();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user", JSON.stringify(action.payload));
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_user");
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setUser, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;

