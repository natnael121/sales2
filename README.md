# Sales Management System

A comprehensive sales management platform built with React, TypeScript, and Firebase, featuring integrated Rocket.Chat for team communication.

## Features

### 🎯 Role-Based Access Control
- **Admin**: Full system access, user management, analytics
- **Supervisor**: Team management, performance monitoring
- **Call Center Agent**: Lead management, call logging
- **Field Agent**: Meeting management, field visits

### 📊 Lead Management
- Complete lead lifecycle tracking
- Call logging with outcomes
- Meeting scheduling and management
- Status progression (New → Contacted → Interested → Meeting → Converted)

### 💬 Integrated Chat (Rocket.Chat)
- Real-time team communication
- Direct messages and group chats
- User search and room management
- Seamless integration with sales workflow

### 📈 Analytics & Reporting
- Conversion funnel analysis
- Performance dashboards
- Team leaderboards
- Real-time metrics

### 💰 Commission Tracking
- Configurable commission rules
- Performance-based rewards
- Approval workflows

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Wouter** for routing
- **TanStack Query** for state management
- **React Hook Form** with Zod validation

### Backend
- **Express.js** with TypeScript
- **Firebase Authentication** for user management
- **Firestore** for data storage
- **Rocket.Chat SDK** for chat integration

### Infrastructure
- **Vite** for development and building
- **Firebase** for authentication and database
- **Rocket.Chat** for team communication

## Getting Started

### Prerequisites
- Node.js 18+ 
- Firebase project
- Rocket.Chat server (optional, for chat features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sales-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Update `.env` with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   # Rocket.Chat Configuration (optional)
   ROCKETCHAT_HOST=your-rocketchat-server.com
   ROCKETCHAT_USE_SSL=true
   ROCKETCHAT_USERNAME=admin
   ROCKETCHAT_PASSWORD=your_password
   ```

4. **Set up Firebase**
   
   a. **Enable Authentication**:
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable Email/Password authentication
   
   b. **Configure Firestore Rules**:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read/write their own document
       match /users/{userId} {
         allow read, write: if request.auth.uid == userId;
       }
       
       // Organization-scoped access
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Set up demo data** (optional)
   - Open the application in your browser
   - Click "Setup Demo Data" in the login modal
   - Use the demo login buttons to test different roles

### Demo Credentials

After setting up demo data, you can use these credentials:

- **Admin**: admin@salesapp.com / admin123
- **Supervisor**: supervisor@salesapp.com / supervisor123  
- **Call Center Agent**: agent@salesapp.com / agent123
- **Field Agent**: field@salesapp.com / field123

## Rocket.Chat Integration

### Setup Rocket.Chat Server

1. **Install Rocket.Chat** (using Docker):
   ```bash
   docker run --name rocketchat-mongo -d mongo:4.0 --smallfiles --replSet rs0
   docker run --name rocketchat --link rocketchat-mongo:mongo -d rocket.chat/rocket.chat:latest
   ```

2. **Configure Rocket.Chat**:
   - Access your Rocket.Chat instance
   - Create an admin user
   - Enable API access
   - Update your `.env` file with the connection details

3. **Features Available**:
   - Real-time messaging
   - Direct messages and group chats
   - User search and management
   - File sharing (configurable)
   - Message history and persistence

### Chat Widget Features

- **Floating chat widget** accessible from any page
- **Connection status** indicator
- **Room management** (create, join, leave)
- **User search** and direct messaging
- **Group chat creation**
- **Message history** and real-time updates
- **Error handling** and reconnection

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and services
│   │   ├── contexts/      # React contexts
│   │   └── types/         # TypeScript type definitions
├── server/                # Backend Express server
│   ├── routes.ts          # API routes
│   ├── rocketchat.ts      # Rocket.Chat service
│   └── storage.ts         # Data storage abstraction
├── shared/                # Shared types and schemas
└── package.json
```

## Key Features Explained

### Lead Management Workflow
1. **Lead Creation**: Admins/Supervisors import or create leads
2. **Assignment**: Leads assigned to call center agents
3. **Calling**: Agents make calls and log outcomes
4. **Meeting Setup**: Successful calls result in scheduled meetings
5. **Field Visits**: Field agents conduct meetings and log results
6. **Conversion**: Successful meetings convert to sales

### Chat Integration Benefits
- **Seamless Communication**: No need for external chat tools
- **Context Awareness**: Chat integrated with sales workflow
- **Role-Based Access**: Chat permissions align with user roles
- **Real-Time Updates**: Instant notifications and message delivery
- **Persistent History**: All conversations saved and searchable

### Analytics Dashboard
- **Real-Time Metrics**: Live updates of key performance indicators
- **Conversion Funnel**: Visual representation of lead progression
- **Team Performance**: Individual and team performance tracking
- **Historical Data**: Trend analysis and reporting

## Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
- Configure production Firebase project
- Set up production Rocket.Chat server
- Update environment variables for production
- Deploy to your preferred hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## License

This project is licensed under the MIT License - see the LICENSE file for details.