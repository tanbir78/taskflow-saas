import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

// Create authentication context
const Ctx = createContext(null);

// Custom hook to access authentication context
export const useAuth = () => useContext(Ctx);
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase authentication state changes
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  // Authentication methods and state
  const value = {
    user,
    loading,

    login: (e, p) => {
      return signInWithEmailAndPassword(auth, e, p);
    },

    register: (e, p) => {
      return createUserWithEmailAndPassword(auth, e, p);
    },

    google: () => {
      return signInWithPopup(auth, googleProvider);
    },

    logout: () => {
      return signOut(auth);
    },

    resetPassword: (e) => {
      return sendPasswordResetEmail(auth, e);
    },
  };

  return (
    <Ctx.Provider value={value}>
      {children}
    </Ctx.Provider>
  );
}

