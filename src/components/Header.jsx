// src/components/Header.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { useTheme } from '@/hooks/useTheme';
import { FaSun, FaMoon } from 'react-icons/fa';

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="bg-white shadow-sm dark:bg-gray-800">
      <div className="container flex items-center justify-between px-4 py-4 mx-auto">
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          Schedulr
        </Link>
        <nav className="flex items-center space-x-4">
          <button onClick={toggleTheme} className="p-2 text-gray-600 rounded-full dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>
          {user ? (
            <>
              <Link to="/dashboard" className="text-gray-600 dark:text-gray-200 hover:text-indigo-600">Dashboard</Link>
              <button onClick={handleLogout} className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
              Login / Sign Up
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;