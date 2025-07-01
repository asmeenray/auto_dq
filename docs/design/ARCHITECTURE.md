# autoDQ - Technical Architecture

## System Overview

autoDQ is a modern web application for automated data quality measurement and monitoring. The system is designed with a simplified three-container architecture that emphasizes simplicity, maintainability, and quick deployment.

## Simplified Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │   React     │ │  Tailwind   │ │    TypeScript           │ │
│  │   Router    │ │    CSS      │ │    Redux Toolkit        │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                         ┌──────▼──────┐
                         │   REST API  │
                         │   Calls     │
                         └──────┬──────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                      Backend Service                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │  Express.js │ │    Auth     │ │    Data Quality         │ │
│  │  REST API   │ │  Middleware │ │    Engine               │ │
│  │             │ │     JWT     │ │                         │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
│                                                             │
│ • Users & Authentication        • Data Source Management   │
│ • Data Quality Indicators       • SQL Query Execution      │
│ • Results & Monitoring          • Database Connections     │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                            │
│  ┌─────────────┐ ┌─────────────────────────────────────────┐ │
│  │ PostgreSQL  │ │   External Data Sources                 │ │
│  │ (Primary)   │ │                                         │ │
│  │             │ │ • MySQL                                 │ │
│  │ • Users     │ │ • PostgreSQL                            │ │
│  │ • Sources   │ │ • Redshift                              │ │
│  │ • Indicators│ │ • Other SQL Databases                   │ │
│  │ • Results   │ │                                         │ │
│  │ • Alerts    │ │                                         │ │
│  └─────────────┘ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI + Custom Components
- **Charts**: Chart.js for data visualization
- **Build Tool**: Vite
- **API Communication**: Fetch API with custom client

### Backend Service
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **API Style**: REST API
- **ORM**: Prisma
- **Authentication**: JWT with refresh tokens
- **Validation**: Built-in validation
- **Database Connectors**: 
  - pg (PostgreSQL)
  - mysql2 (MySQL)
  - Support for various SQL databases

### Database
- **Primary Database**: PostgreSQL 15+
- **ORM**: Prisma with generated client
- **Migrations**: Prisma migrations
- **Connection Pooling**: Built-in with Prisma

### Infrastructure
- **Containerization**: Docker with docker-compose
- **Development**: Local development with hot reload
- **Build**: Multi-stage Docker builds for production

## Database Schema

### Core Tables

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'viewer', -- admin, editor, viewer
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Data Sources
CREATE TABLE data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- mysql, postgresql, redshift
    description TEXT,
    connection_config JSONB NOT NULL, -- encrypted connection details
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Data Quality Indicators
CREATE TABLE indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- completeness, freshness, validity, latency
    data_source_id UUID REFERENCES data_sources(id),
    query_text TEXT NOT NULL,
    threshold_config JSONB NOT NULL, -- warning/critical thresholds
    schedule_config JSONB, -- cron-like schedule
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Execution Results
CREATE TABLE indicator_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    indicator_id UUID REFERENCES indicators(id),
    execution_time TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL, -- passed, failed, warning, error
    value DECIMAL,
    execution_duration_ms INTEGER,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Alerts
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    indicator_id UUID REFERENCES indicators(id),
    result_id UUID REFERENCES indicator_results(id),
    severity VARCHAR(20) NOT NULL, -- critical, warning, info
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, acknowledged, resolved
    message TEXT NOT NULL,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User Sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    refresh_token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## API Design

### REST API Endpoints

#### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user info

#### Data Sources
- `GET /api/data-sources` - List all data sources
- `POST /api/data-sources` - Create new data source
- `GET /api/data-sources/:id` - Get specific data source
- `PUT /api/data-sources/:id` - Update data source
- `DELETE /api/data-sources/:id` - Delete data source
- `POST /api/data-sources/:id/test` - Test data source connection

#### Indicators
- `GET /api/indicators` - List all indicators
- `POST /api/indicators` - Create new indicator
- `GET /api/indicators/:id` - Get specific indicator
- `PUT /api/indicators/:id` - Update indicator
- `DELETE /api/indicators/:id` - Delete indicator
- `POST /api/indicators/:id/execute` - Execute indicator manually

#### Results
- `GET /api/results` - List indicator results (with filtering)
- `GET /api/results/:id` - Get specific result
- `GET /api/indicators/:id/results` - Get results for specific indicator

#### Users
- `GET /api/users` - List users (admin only)
- `POST /api/users` - Create new user (admin only)
- `GET /api/users/:id` - Get user info
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### API Response Format

All API responses follow a consistent structure:

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message",
  "pagination": { /* for paginated endpoints */ }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { /* optional error details */ }
}
```

## Security Considerations

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Admin, Editor, Viewer)
- Secure password hashing with bcrypt
- Session management with secure refresh tokens

### Data Protection
- Environment-based configuration
- Encrypted connection strings in database
- Input validation and sanitization
- SQL injection prevention through parameterized queries

### Infrastructure Security
- Docker container isolation
- Minimal container images
- Regular dependency updates
- Secure communication between services

## Performance Optimization

### Frontend
- Code splitting with React.lazy()
- Memoization for expensive computations
- Virtualization for large data sets
- Efficient state management with Redux Toolkit

### Backend
- Database connection pooling
- Query optimization with Prisma
- Caching strategies for frequent queries
- Efficient data pagination

### Monitoring
- Application health checks
- Database query performance monitoring
- Error tracking and logging
- Resource usage monitoring

## Deployment Strategy

### Development
- Local development with docker-compose
- Hot reload for both frontend and backend
- Development database with sample data
- Easy setup with single script

### Production
- Multi-stage Docker builds
- Environment-specific configurations
- Database migrations on deployment
- Health checks and monitoring

## Key Features

### Data Quality Indicators
- **Completeness**: Check for missing or null values
- **Freshness**: Monitor data recency and staleness
- **Validity**: Validate data against business rules
- **Latency**: Track data processing delays

### Dashboard & Monitoring
- Real-time indicator status overview
- Historical trend analysis
- Alert management and notifications
- Data source health monitoring

### User Management
- Role-based access control
- User authentication and session management
- Activity logging and audit trails

## Development Workflow

1. **Setup**: Run `./scripts/setup-simple.sh` for initial setup
2. **Development**: Use `docker-compose -f docker-compose.simple.yml up -d` for local development
3. **Database**: Prisma handles schema changes and migrations
4. **API Testing**: RESTful endpoints with consistent response format
5. **Frontend**: Hot reload enabled for rapid development

This simplified architecture provides a solid foundation for data quality monitoring while maintaining simplicity and ease of deployment.
