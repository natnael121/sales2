import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "./firebase";
import { createUser, getUser } from "./firestore";
import type { UserRole, AppUser } from "../types";

export const signIn = async (email: string, password: string): Promise<AppUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Get user data from Firestore using uid
    const appUser = await getUser(firebaseUser.uid);
    if (!appUser) {
      throw new Error("User data not found");
    }
    
    return {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      ...appUser
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign in");
  }
};

export const signUp = async (
  email: string, 
  password: string, 
  name: string, 
  role: UserRole, 
  organizationId: string,
  supervisorId?: string
): Promise<AppUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Create user document in Firestore
    const userData = {
      email,
      name,
      role,
      organizationId,
      supervisorId,
      isActive: true
    };
    
    const appUser = await createUser(firebaseUser.uid, userData);
    
    return {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      ...appUser
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to create account");
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign out");
  }
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};
