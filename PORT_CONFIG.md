# AutoDQ Port Configuration

This document defines the fixed port assignments for the AutoDQ development environment to ensure consistency across restarts.

## Port Assignments

| Service  | Port | URL                        | Configuration File |
|----------|------|----------------------------|--------------------|
| Frontend | 3000 | http://localhost:3000      | `frontend/vite.config.ts` |
| Backend  | 3001 | http://localhost:3001      | `backend/.env` (API_PORT) |

## Data Source Support

AutoDQ supports connections to multiple data warehouse types:

- **Amazon Redshift** - Fast, simple, cost-effective data warehouse
- **Snowflake** - Cloud-native data platform
- **Google BigQuery** - Serverless, highly scalable data warehouse

Each data source type has specific configuration requirements and connection fields optimized for that platform.

## Configuration Details

### Frontend (Port 3000)
- **File**: `frontend/vite.config.ts`
- **Setting**: `server.port: 3000` with `strictPort: true`
- **Environment**: `frontend/.env` contains `VITE_PORT=3000`
- **API URL**: `VITE_API_URL=http://localhost:3001/api`

### Backend (Port 3001)
- **File**: `backend/.env`
- **Setting**: `API_PORT=3001`
- **Logic**: Uses `process.env.API_PORT || 3001` in `backend/src/index.ts`

## Management Scripts

- **Start servers**: `./scripts/start-dev.sh`
- **Stop servers**: `./scripts/stop-dev.sh`

These scripts ensure:
- Ports are checked and cleaned before starting
- Both servers start on their assigned ports consistently
- Proper cleanup when stopping
- Logging for debugging

## Troubleshooting

If ports are still auto-incrementing:
1. Run `./scripts/stop-dev.sh` to clean up all processes
2. Verify ports are free: `lsof -ti:3000,3001`
3. Start with: `./scripts/start-dev.sh`

The `strictPort: true` setting in Vite config prevents auto-incrementing and will fail if port 3000 is occupied, rather than switching to another port.
