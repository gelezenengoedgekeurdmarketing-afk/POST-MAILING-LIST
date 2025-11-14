# Business Database Management Application

## Overview

This is a full-stack business database management application built with React, Express, and intelligent storage management. The application enables users to manage business contacts with comprehensive features including Excel/CSV/Word import/export, advanced search and filtering, tagging capabilities, sortable table columns, inline comment editing, and a modern UI built with shadcn/ui components. The system features runtime database detection with graceful fallback, optional authentication via Replit Auth, and follows a clean separation between client and server code with shared TypeScript schemas for type safety across the stack.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server, providing fast HMR and optimized production builds
- Wouter for lightweight client-side routing

**UI Component System**
- shadcn/ui components built on Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling with custom design tokens
- Material Design 3 inspired design system with Linear/Notion aesthetics
- Custom theme system supporting light/dark modes via context provider
- Typography: Inter font for UI, JetBrains Mono for monospace data fields

**State Management**
- TanStack React Query for server state management, caching, and API synchronization
- Local component state with React hooks for UI state
- No global state management library - queries handle data fetching and caching

**Data Display**
- TanStack React Table for advanced table features (sorting, filtering, selection)
- All table columns sortable (ascending/descending alphabetically)
- Custom components for search, filtering (tags, zipcodes), and data manipulation
- Excel/CSV import/export functionality using xlsx library
- Word (.docx) export with centered formatting for mailing labels

### Backend Architecture

**Server Framework**
- Express.js running on Node.js with TypeScript
- ESM modules throughout the codebase
- Development mode uses tsx for direct TypeScript execution
- Production builds use esbuild for fast bundling

**API Design**
- RESTful API endpoints under `/api` prefix
- CRUD operations for business entities
- Bulk operations support for Excel import
- File upload handling via multer middleware
- Centralized error handling middleware

**Data Layer**
- In-memory storage using Map data structure for fast access
- IStorage interface for potential future database migration
- Schema-first approach with Zod validation for runtime type checking
- UUID-based unique identifiers for all records

**Development Tools**
- Separate development and production configurations
- Request logging middleware for API debugging
- Vite integration in development for seamless full-stack development

### Data Architecture

**Intelligent Storage System**
- Runtime storage selection based on database availability
- Automatic switching between DatabaseStorage (PostgreSQL) and MemStorage (in-memory)
- Three operational modes:
  1. **Database Available**: Uses PostgreSQL with Replit Auth authentication
  2. **Database Disabled**: Falls back to in-memory storage, unauthenticated access allowed
  3. **Database Down** (configured but unavailable): Fails closed with 503 errors to protect data
- IStorage interface abstraction for storage layer consistency
- UUID-based unique identifiers generated with crypto.randomUUID()
- Seamless migration path from in-memory to persistent storage
  
**Data Model**
- Single `businesses` entity with the following fields:
  - UUID primary key
  - Required fields: name, streetName, zipcode, city
  - Optional fields: email, phone, tags, comment, isActive (all with defaults)
  - Array field for tags
  - Boolean flag for active/inactive status
  
**UI Features**
- Inline comment editing: Double-click to edit, Enter to save, Escape to cancel
- All table columns sortable (ascending/descending alphabetically)
- Phone and email fields available in edit dialog (removed from main table view)
- Advanced search and filtering by tags and zipcodes
- Responsive Material Design 3 interface with Linear/Notion aesthetics

**Import Features**
- Supports Dutch and English column names
- Recognizes column variations: "Adresregel 1", "naam (zaak)", "PC", "PLAATS", "Categorie"
- Merges dialog tags WITH per-row tags from Categorie column (no replacement)
- Automatically coerces numeric Excel values to strings
- Email field can be left blank (no auto-generated placeholders)
- Detailed partial success reporting with row-level errors
- Protected by authentication when database is enabled

**Export Features**
- Excel (.xlsx) export with full business data
- CSV export for compatibility
- Word (.docx) export with centered formatting for mailing labels:
  - Business name on top (Heading 2, centered)
  - Street name in middle (centered)
  - Zipcode and city at bottom (centered)
  - Proper spacing between entries
- Protected by authentication when database is enabled

**Authentication & Security**
- Replit Auth integration for user authentication (when database is enabled)
- PostgreSQL sessions for secure session management
- Conditional authentication based on storage mode:
  - Database enabled: All API endpoints require authentication
  - Database disabled: Unauthenticated access allowed for testing/development
  - Database failure: Fail-closed with 503 errors to prevent data exposure
- Auth middleware applied to all data endpoints (CRUD, import, export)
- File upload protection: Authentication check runs before file processing
  
**Data Validation**
- Zod schemas for runtime type checking
- TypeScript types inferred from Drizzle schema definitions
- Validation on API requests before storage operations

### External Dependencies

**UI Component Library**
- Radix UI for accessible, unstyled primitives (dialogs, dropdowns, popovers, etc.)
- Full suite of components including tables, forms, navigation, and overlays
- Class Variance Authority for component variant management

**Data Processing**
- XLSX library for Excel file parsing and generation
- Support for .xlsx, .xls, and .csv file formats
- Bulk import with tag assignment capabilities
- DOCX library for Word document generation with formatted output

**File Upload**
- Multer middleware for handling multipart form data
- In-memory storage strategy for file processing
- Type definitions via `@types/multer`

**Development Environment**
- Replit-specific plugins for runtime error modals, cartographer, and dev banner
- Automatic WebSocket setup for Neon database in development
- Font loading from Google Fonts (Inter, JetBrains Mono)

**Styling & Design**
- Tailwind CSS with PostCSS and Autoprefixer
- Custom color system with HSL color space
- Responsive design utilities
- Dark mode support via CSS variables

## Activating Database & Authentication

To enable persistent storage and user authentication:

1. Open the Database tab in your Replit workspace
2. Click "Enable" to activate the PostgreSQL database endpoint
3. Restart the application
4. The app will automatically:
   - Switch to DatabaseStorage for persistent data
   - Enable Replit Auth for user authentication
   - Require login for all data access
   - Create necessary database tables (sessions, users, businesses)

Note: If the database endpoint is disabled, the app runs in development mode with in-memory storage and no authentication required. Data will be lost on server restart.