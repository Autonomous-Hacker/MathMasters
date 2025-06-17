# Overview

Math Quest is an educational 3D math game built as a full-stack web application. The project combines React with Three.js for interactive 3D visualization, Express.js for the backend API, and PostgreSQL with Drizzle ORM for data persistence. The application is designed to help students practice math skills through engaging gameplay while providing teachers with comprehensive analytics and progress tracking.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Three.js** via @react-three/fiber and @react-three/drei for 3D rendering and game visuals
- **Phaser.js** as an additional game engine for 2D game mechanics
- **Tailwind CSS** with shadcn/ui components for styling and UI elements
- **Zustand** for state management (game state, audio controls, math game logic)
- **TanStack Query** for server state management and API calls
- **Vite** as the build tool and development server

### Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** design for game interactions and teacher dashboard
- **Session-based** game tracking with unique session IDs
- **In-memory storage** fallback with interface for database integration
- **AI-powered hints** via OpenAI GPT-4o integration

### Data Storage
- **PostgreSQL** database with Drizzle ORM
- **Neon Database** as the hosted PostgreSQL provider
- **Database schema** includes users, students, game sessions, student answers, and leaderboard tables
- **Migration system** using Drizzle Kit for schema management

## Key Components

### Game Engine Integration
- **Dual game engine** support (Three.js for 3D, Phaser.js for 2D mechanics)
- **3D scene management** with particle effects, lighting, and post-processing
- **Audio system** with background music, sound effects, and mute controls
- **Voice recognition** for answer input using Web Speech API

### Educational Content System
- **Grade-based question generation** (Grades 1-8, mapped to local education levels)
- **Multi-operation support** (addition, subtraction, multiplication, division)
- **Adaptive difficulty** with level progression
- **Contextual math problems** with real-world scenarios

### Teacher Dashboard
- **Student progress tracking** with detailed analytics
- **Performance metrics** including accuracy, streaks, and time spent
- **Weak area identification** for targeted intervention
- **Real-time leaderboards** and class overview

### Student Experience
- **Gamified learning** with scores, streaks, and progress tracking
- **Multiple input methods** (keyboard, voice, touch)
- **AI-powered hints** when students need help
- **Visual feedback** with particle effects and animations

## Data Flow

1. **Game Session Initialization**: Student selects grade level, system generates unique session ID
2. **Question Generation**: Server generates grade and level-appropriate math questions
3. **Answer Processing**: Client submits answers to server for validation and storage
4. **Progress Tracking**: All interactions stored in database for analytics
5. **Real-time Updates**: UI updates reflect current game state and progress
6. **Teacher Analytics**: Dashboard aggregates data for insights and reporting

## External Dependencies

### Core Technologies
- **@react-three/fiber** and **@react-three/drei** for 3D rendering
- **Phaser.js** for 2D game mechanics
- **Drizzle ORM** with **@neondatabase/serverless** for database operations
- **OpenAI API** for AI-generated educational hints

### UI and Styling
- **Radix UI** component library for accessible UI primitives
- **Tailwind CSS** for utility-first styling
- **Lucide React** for consistent iconography

### Development Tools
- **TypeScript** for type safety across frontend and backend
- **Vite** with custom configuration for 3D asset loading
- **ESBuild** for production server bundling

## Deployment Strategy

### Replit Configuration
- **Node.js 20** runtime environment
- **Development server** on port 5000 with auto-restart
- **Production build** process with client and server bundling
- **Autoscale deployment** target for production hosting

### Database Setup
- **Neon Database** integration with connection string via environment variables
- **Drizzle migrations** for schema versioning and updates
- **Push-based deployment** for development iterations

### Asset Management
- **3D model support** (.gltf, .glb files)
- **Audio file handling** (.mp3, .ogg, .wav)
- **Shader support** via vite-plugin-glsl
- **Font loading** with @fontsource/inter

## Changelog
- June 16, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.