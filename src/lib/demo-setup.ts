import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { createUser, createOrganization } from "./firestore";
import type { UserRole } from "../types";

// Demo users for testing all roles
const DEMO_USERS = [
  {
    email: "admin@salesapp.com",
    password: "admin123",
    name: "Admin User",
    role: "admin" as UserRole
  },
  {
    email: "supervisor@salesapp.com", 
    password: "supervisor123",
    name: "Supervisor User",
    role: "supervisor" as UserRole
  },
  {
    email: "agent@salesapp.com",
    password: "agent123", 
    name: "Call Center Agent",
    role: "call-center" as UserRole
  },
  {
    email: "field@salesapp.com",
    password: "field123",
    name: "Field Agent",
    role: "field-agent" as UserRole
  }
];

export const createDemoData = async (): Promise<void> => {
  try {
    console.log("Setting up demo data...");
    
    // First, create and sign in as admin to ensure authenticated access
    const adminUser = DEMO_USERS[0]; // Admin user
    
    console.log(`Creating admin user: ${adminUser.email}`);
    
    let adminCredential;
    try {
      // Create admin Firebase auth user
      adminCredential = await createUserWithEmailAndPassword(
        auth, 
        adminUser.email, 
        adminUser.password
      );
      console.log("Admin user created in Firebase Auth");
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log("Admin user already exists, signing in...");
        const { signInWithEmailAndPassword } = await import("firebase/auth");
        adminCredential = await signInWithEmailAndPassword(auth, adminUser.email, adminUser.password);
      } else {
        throw error;
      }
    }
    
    // Now that we're authenticated, create the organization
    console.log("Creating demo organization...");
    const organization = await createOrganization({
      name: "Demo Sales Organization"
    });
    console.log("Created organization:", organization.id);
    
    // Create admin user document in Firestore
    await createUser(adminCredential.user.uid, {
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      organizationId: organization.id,
      isActive: true
    });
    console.log(`Created admin user document: ${adminUser.name}`);
    
    // Create remaining users (skip admin since already created)
    for (let i = 1; i < DEMO_USERS.length; i++) {
      const demoUser = DEMO_USERS[i];
      try {
        console.log(`Creating user: ${demoUser.email}`);
        
        // Create Firebase auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          demoUser.email, 
          demoUser.password
        );
        
        // Create Firestore user document
        await createUser(userCredential.user.uid, {
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
          organizationId: organization.id,
          supervisorId: demoUser.role === "call-center" || demoUser.role === "field-agent" ? adminCredential.user.uid : undefined,
          isActive: true
        });
        
        console.log(`Created user: ${demoUser.name} (${demoUser.role})`);
        
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`User ${demoUser.email} already exists, skipping...`);
        } else {
          console.error(`Error creating user ${demoUser.email}:`, error);
        }
      }
    }
    
    // Sign back in as admin to maintain consistent auth state
    const { signInWithEmailAndPassword } = await import("firebase/auth");
    await signInWithEmailAndPassword(auth, adminUser.email, adminUser.password);
    
    console.log("Demo data setup complete! Signed in as admin.");
    
  } catch (error) {
    console.error("Error setting up demo data:", error);
    throw error;
  }
};

export const DEMO_CREDENTIALS = {
  admin: { email: "admin@salesapp.com", password: "admin123" },
  supervisor: { email: "supervisor@salesapp.com", password: "supervisor123" },
  agent: { email: "agent@salesapp.com", password: "agent123" },
  field: { email: "field@salesapp.com", password: "field123" }
};