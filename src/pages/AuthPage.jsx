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
    <div className="flex flex-col items-center justify-center flex-grow">
      <div className="w-full max-w-xl bg-white dark:bg-[#1c1c1c] p-8 rounded-lg shadow-md border border-gray-200 dark:border-[#2a2a2a]">
        <h2 className="mb-6 text-2xl font-bold text-center dark:text-white">{isLogin ? 'Login' : 'Sign Up'}</h2>
        <form onSubmit={handleAuthAction} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="block w-full px-4 py-2 mt-2 bg-white border-gray-300 rounded-md shadow-sm dark:border-gray-700 dark:bg-black focus:border-orange-500 focus:ring-orange-500" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="block w-full px-4 py-2 mt-2 bg-white border-gray-300 rounded-md shadow-sm py pymt-2 -4 mt-2np px -3 dark:border-gray-700 dark:bg-black focus:border-orange-500 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="block w-full px-4 py-2 mt-2 border-gray-300 rounded-md shadow-sm mt bg-4-white mt- dark:border-gray-700 dark:bg-black focus:border-orange-500 focus:ring-orange-500" />
          </div>
          <button type="submit" disabled={loading} className="w-full px-4 py-2 text-white transition-colors duration-200 bg-orange-500 rounded-md hover:bg-orange-600 disabled:opacity-50">
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => setIsLogin(!isLogin)} className="ml-1 font-semibold text-orange-500 hover:underline">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;