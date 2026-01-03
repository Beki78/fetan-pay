import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Theme = "light" | "dark";

// Get initial theme from localStorage or system preference
const getInitialTheme = (): Theme => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "dark" || stored === "light") {
      return stored;
    }
    
    // Check system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  }
  return "light";
};

interface ThemeState {
  theme: Theme;
}

const initialState: ThemeState = {
  theme: getInitialTheme(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", action.payload);
        // Apply theme to document
        if (action.payload === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      state.theme = newTheme;
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", newTheme);
        if (newTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;

