import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import { ThemeProvider } from './hooks/useTheme.jsx';
import AuthGuard from './components/AuthGuard';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import PublicCalendarPage from './pages/PublicCalendarPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <div className="flex flex-col min-h-screen text-gray-900 transition-colors duration-300 bg-gray-50 dark:bg-black dark:text-gray-100">
            <Header />
            {/* The "flex" class is added here to allow child pages to grow */}
            <main className="container flex flex-grow px-4 py-8 mx-auto">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/c/:shareToken" element={<PublicCalendarPage />} />
                <Route path="/dashboard" element={ <AuthGuard> <DashboardPage /> </AuthGuard> } />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <footer className="w-full p-4 text-center border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Created by Sanskar Singh
              </p>
            </footer>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;