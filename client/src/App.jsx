// App.jsx
import React from "react";
import AppRouter from "./Routes/AppRouter";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { FullScreenSpinner } from "./components/ui/Loader";

function AppContent() {
  const { loading } = useAuth(); // assumes your hook returns a loading boolean

  if (loading) {
    return <FullScreenSpinner />; // show spinner while auth/user data loads
  }

  return <AppRouter />; // render routes after loading
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider >
    </AuthProvider>
  );
}

export default App;
