# Sales Management System

## Overview

This is a comprehensive sales management platform built as a full-stack web application designed to help organizations manage their entire sales lifecycle from lead capture through conversion and commission tracking. The system supports multiple user roles (Admin, Supervisor, Call Center Agent, Field Agent) with role-based access control and features for lead management, call tracking, meeting scheduling, and performance analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built using React with TypeScript and follows a modern component-based architecture:

- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming and design tokens
- **Forms**: React Hook Form with Zod validation for robust form handling
- **State Management**: TanStack Query for server state management and caching
- **Build Tool**: Vite for fast development and optimized production builds

The frontend follows a modular structure with clear separation of concerns:
- `/pages` - Route components for different application views
- `/components` - Reusable UI components organized by feature
- `/hooks` - Custom React hooks for shared logic
- `/lib` - Utility functions and external service integrations
- `/contexts` - React contexts for global state (auth, theme)

### Backend Architecture
The server-side uses Express.js with TypeScript in a monolithic architecture:

- **Framework**: Express.js with TypeScript for the REST API
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Shared TypeScript schemas between client and server using Zod
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Hot module replacement with Vite integration

The backend is structured with:
- `/server` - Express server setup and configuration
- `/shared` - Shared schemas and types between frontend and backend
- Storage abstraction layer with in-memory implementation for development

### Data Storage Solutions
The application uses a hybrid approach for data persistence:

- **Primary Database**: PostgreSQL with Neon serverless for production scalability
- **ORM**: Drizzle ORM provides type-safe database operations and migrations
- **Development Storage**: In-memory storage implementation for rapid development
- **Schema Management**: Centralized schema definitions shared between client and server

The database schema supports:
- Multi-tenant organization structure
- Role-based user management
- Lead lifecycle tracking
- Call and meeting management
- Commission and analytics data

### Authentication and Authorization
Firebase Authentication is used for user management with role-based access control:

- **Provider**: Firebase Auth for secure user authentication
- **Session Management**: Firebase auth state combined with application user data
- **Role-Based Access**: Four distinct roles (admin, supervisor, call-center, field-agent)
- **Context Management**: React context provides auth state throughout the application
- **Route Protection**: Role-based navigation and component rendering

User data is stored in Firebase Firestore with the authentication UID as the key, enabling seamless integration between auth and user profiles.

### External Dependencies

- **Firebase**: Authentication, Firestore for user data, and real-time features
- **Neon Database**: Serverless PostgreSQL hosting for production
- **Vercel/Replit**: Deployment and hosting platform integration
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management and validation
- **shadcn/ui**: Pre-built accessible UI components
- **Tailwind CSS**: Utility-first CSS framework
- **Drizzle ORM**: Type-safe PostgreSQL ORM
- **Wouter**: Lightweight client-side routing
- **Zod**: Schema validation for forms and API data

The system is designed to be cloud-native with serverless database capabilities and can be deployed on modern hosting platforms with minimal configuration.