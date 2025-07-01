# autoDQ ⚡

> **Automated Data Quality Measurement & Monitoring**

A modern, simplified data quality monitoring platform that measures, analyzes, and monitors data warehouse quality with an intuitive web interface.

## ✨ Features

- 🔍 **Real-time Monitoring** - Continuous surveillance of data quality
- 📊 **Interactive Dashboard** - Clean, modern UI with data visualizations
- 🔔 **Smart Alerting** - Intelligent notifications and threshold management
- 🗄️ **Multi-Source Support** - MySQL, PostgreSQL, Redshift support
- 📈 **Analytics** - Trend analysis and quality scoring
- 👥 **Role-based Access** - Admin, Editor, Viewer permissions
- ⚡ **REST API** - Simple and efficient API design
- 🐳 **Docker Ready** - Easy deployment with Docker Compose

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### 1. Clone & Setup
```bash
git clone <repository-url>
cd auto_dq
cp .env.example .env
# Edit .env with your configuration
./scripts/setup-simple.sh
```

### 2. Start Development Environment
```bash
docker-compose -f docker-compose.simple.yml up -d
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Health**: http://localhost:4000/health

## 🏗️ Architecture

autoDQ follows a simplified three-container architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  Modern UI • TypeScript • Redux • TailwindCSS              │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API
┌─────────────────────▼───────────────────────────────────────┐
│                Backend (Node.js + Express)                 │
│  REST API • JWT Auth • Prisma ORM • Data Quality Engine   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                Database (PostgreSQL)                       │
│  Users • Data Sources • Indicators • Results • Alerts     │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Chart.js** for data visualization
- **Vite** for build tooling

### Backend
- **Node.js** with Express.js
- **REST API** architecture
- **Prisma ORM** for database operations
- **JWT** authentication
- **PostgreSQL** connectors for external data sources

### Database & Infrastructure
- **PostgreSQL** as primary database
- **Docker & Docker Compose** for containerization
- **Prisma** for schema management and migrations

## 📁 Project Structure

```
auto_dq/
├── frontend/                 # React application
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── store/           # Redux store
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # API client & utilities
│   ├── package.json
│   └── Dockerfile.dev
├── backend/                  # Node.js API server
│   ├── src/
│   │   ├── services/        # Business logic services
│   │   └── index.ts         # Express server
│   ├── prisma/              # Database schema & migrations
│   ├── package.json
│   └── Dockerfile.dev
├── docs/                     # Documentation
│   └── design/              # Architecture & design docs
├── scripts/                  # Setup & utility scripts
├── docker-compose.simple.yml # Docker Compose configuration
├── .env.example             # Environment variables template
└── README.md                # This file
```

## 🔧 Development

### Local Development Setup

1. **Environment Setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

2. **Start with Docker**:
   ```bash
   docker-compose -f docker-compose.simple.yml up -d
   ```

3. **Or start manually**:
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm install
   npm run dev

   # Frontend (Terminal 2)
   cd frontend
   npm install
   npm run dev
   ```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

#### Data Sources
- `GET /api/data-sources` - List all data sources
- `POST /api/data-sources` - Create new data source
- `POST /api/data-sources/:id/test` - Test connection

#### Indicators
- `GET /api/indicators` - List all indicators
- `POST /api/indicators` - Create new indicator
- `POST /api/indicators/:id/execute` - Execute indicator

#### Results
- `GET /api/results` - List indicator results
- `GET /api/indicators/:id/results` - Get results for indicator

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend && npm run build

# Build backend
cd backend && npm run build

# Start with production docker-compose
docker-compose -f docker-compose.simple.yml up -d --build
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `API_PORT` - Backend server port (default: 4000)
- `FRONTEND_URL` - Frontend URL for CORS

## 🔍 Data Quality Indicators

### Supported Indicator Types

1. **Completeness** - Check for missing or null values
2. **Freshness** - Monitor data recency and staleness  
3. **Validity** - Validate data against business rules
4. **Latency** - Track data processing delays

### Example Indicator

```sql
-- Completeness check for customer emails
SELECT 
  COUNT(*) as total_records,
  COUNT(email) as records_with_email,
  (COUNT(email) * 100.0 / COUNT(*)) as completeness_percentage
FROM customers 
WHERE created_at >= CURRENT_DATE - INTERVAL '1 day';
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Database Connection Failed**
- Check PostgreSQL is running: `docker-compose ps`
- Verify DATABASE_URL in .env file
- Ensure port 5432 is not in use

**Frontend Build Errors**
- Clear node_modules: `rm -rf node_modules package-lock.json`
- Reinstall dependencies: `npm install`
- Check for TypeScript errors: `npm run type-check`

**Backend API Errors**
- Check server logs: `docker-compose logs backend`
- Verify Prisma schema: `npx prisma generate`
- Test database connection: `npx prisma db push`

### Support

For support and questions, please open an issue in the GitHub repository.