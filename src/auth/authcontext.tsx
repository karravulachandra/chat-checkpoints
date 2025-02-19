import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  sendPasswordResetEmail,
  updatePassword,
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, database, googleProvider } from '../lib/firebase';
import { toast } from '@/components/ui/use-toast';

interface UserData {
  name: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (name: string) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  async function signup(email: string, password: string, name: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with name
      await updateProfile(user, { displayName: name });
      
      // Store additional user data in Realtime Database
      const userData: UserData = {
        name,
        email,
        createdAt: new Date().toISOString(),
      };
      
      await set(ref(database, `users/${user.uid}`), userData);
      toast({
        title: "Account created successfully",
        description: "Welcome to ChatCheckpoints!",
      });
    } catch (error: any) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  }

  async function login(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Logged in successfully",
        description: "Welcome back!",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      toast({
        title: "Logged out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  }

  async function resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password reset email sent",
        description: "Please check your email for further instructions.",
      });
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  }

  async function updateUserProfile(name: string) {
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    try {
      await updateProfile(currentUser, { displayName: name });
      await set(ref(database, `users/${currentUser.uid}/name`), name);
      
      // Update local userData state
      if (userData) {
        setUserData({ ...userData, name });
      }
      
      toast({
        title: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Profile update failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  }

  async function updateUserPassword(newPassword: string) {
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    try {
      await updatePassword(currentUser, newPassword);
      toast({
        title: "Password updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Password update failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  }

  async function signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in database
      const userSnapshot = await get(ref(database, `users/${user.uid}`));
      
      if (!userSnapshot.exists()) {
        const userData: UserData = {
          name: user.displayName || '',
          email: user.email || '',
          createdAt: new Date().toISOString(),
        };
        await set(ref(database, `users/${user.uid}`), userData);
      }
      
      toast({
        title: "Logged in successfully",
        description: `Welcome ${user.displayName}!`,
      });
    } catch (error: any) {
      toast({
        title: "Google login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user data from database
        const userSnapshot = await get(ref(database, `users/${user.uid}`));
        if (userSnapshot.exists()) {
          setUserData(userSnapshot.val());
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    updateUserPassword,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}