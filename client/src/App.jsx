// App.jsx
import React from "react";
import AppRouter from "./Routes/AppRouter";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

function App() {
	return (
		<AuthProvider>
			<ThemeProvider>
				<AppRouter />
			</ThemeProvider>
		</AuthProvider>
	);
}

export default App;
