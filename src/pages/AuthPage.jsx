import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, writeBatch } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { nanoid } from 'nanoid';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading(isLogin ? 'Logging in...' : 'Creating account...');
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Logged in successfully!', { id: toastId });
        navigate('/dashboard');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const batch = writeBatch(db);
        const userRef = doc(db, 'users', user.uid);
        batch.set(userRef, { name, email: user.email, timezone: 'Asia/Kolkata', createdAt: serverTimestamp() });
        const calendarRef = doc(collection(db, 'calendars'));
        batch.set(calendarRef, {
            ownerUid: user.uid, shareToken: nanoid(12),
            workingHours: { start: "09:00", end: "18:00" },
            defaultDurationMinutes: 30, createdAt: serverTimestamp()
        });
        await batch.commit();
        toast.success('Account created successfully!', { id: toastId });
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="p-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="mb-6 text-2xl font-bold text-center">{isLogin ? 'Login' : 'Sign Up'}</h2>
        <form onSubmit={handleAuthAction} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="block w-full mt-1 bg-white border-gray-300 rounded-md shadow-sm dark:border-gray-600 dark:bg-gray-700 focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="block w-full mt-1 bg-white border-gray-300 rounded-md shadow-sm dark:border-gray-600 dark:bg-gray-700 focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="block w-full mt-1 bg-white rounded-md shadow-sm border--gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <button type="submit" disabled={loading} className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => setIsLogin(!isLogin)} className="ml-1 text-indigo-600 hover:underline">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;