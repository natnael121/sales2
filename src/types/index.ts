export * from '@shared/schema';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AppUser extends AuthUser {
  role: UserRole;
  organizationId: string;
  name: string;
  supervisorId?: string;
  isActive: boolean;
}

export type UserRole = "admin" | "supervisor" | "call-center" | "field-agent";

export interface Theme {
  isDark: boolean;
  toggle: () => void;
}
