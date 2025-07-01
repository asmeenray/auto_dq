-- autoDQ Database Initialization Script
-- This script sets up the initial database structure for development

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE autodq_dev TO autodq;

-- Create basic schemas (will be managed by Prisma migrations later)
-- This is just to ensure the database is ready for Prisma

\echo 'autoDQ database initialized successfully!'
