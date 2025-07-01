
# Data Quality Measurement Webapp - Requirements

## Overview

This project aims to build a modern, lightweight web application for data quality measurement, inspired by [MobyDQ](https://ubisoft.github.io/mobydq/). The application will allow users to connect to data warehouses (starting with Redshift) and define/monitor a range of data quality indicators.

---

## 1. Functional Requirements

### 1.1 Data Source Integration

- **Supported Sources:**
  - Initial support: Amazon Redshift.
  - Future extensibility: MySQL, PostgreSQL, Hive, Snowflake, etc.
- **Connection Management:**
  - Add/edit/delete data sources.
  - Test connection via UI before saving.
- **Credentials & Security:**
  - Securely store connection information.

### 1.2 Data Quality Indicators

- **Indicator Types:**
  - Completeness (e.g., row counts between tables)
  - Freshness (e.g., time since last update)
  - Latency (e.g., source-to-target lag)
  - Validity (e.g., custom validation rules)
- **Indicator Management:**
  - Create, edit, and delete indicators.
  - Set indicator parameters (source, target, SQL, thresholds, frequency, etc.)
  - Group indicators for batch execution.
- **Visualization:**
  - Show indicator results with charts and tables.

### 1.3 Scheduling & Execution

- **Manual & Scheduled Execution:**
  - Run indicators on demand or by schedule (cron-like).
- **Batch Processing:**
  - Run groups of indicators together.

### 1.4 Alerts & Notifications

- **Thresholds:**
  - Define thresholds for each indicator.
- **Alerting:**
  - Email notifications when thresholds are breached.
  - Dashboard for active alerts.

### 1.5 User & Role Management

- **Authentication:**
  - Login, registration, forgot password.
- **Roles:**
  - Admin, Editor, Viewer.
- **User Management:**
  - Add/invite/edit/remove users.

### 1.6 API Access

- **GraphQL API** for all major functionalities (CRUD, execution, results).
- **Interactive Documentation** (e.g., GraphiQL).

### 1.7 Extensibility & Security

- Easily add new data sources or indicator types.
- Follow best practices for security, input validation, and data encryption.

---

## 2. Web Application Pages & Navigation

### 2.1 Landing Page

- App introduction, features overview, sign up/login prompt, links to docs/support.

### 2.2 Authentication Pages

- Login
- Registration
- Forgot Password/Reset

### 2.3 Dashboard

- Data quality status overview (summary cards, trends, recent runs, recent alerts).

### 2.4 Data Sources

- List all sources.
- Add/edit/delete source.
- Test connection.

### 2.5 Indicators

- List indicators.
- Create/edit/delete indicators.
- Indicator details page with historical results/visualizations.

### 2.6 Groups

- List groups.
- Create/edit/delete group.
- Assign indicators to groups.

### 2.7 Schedules

- List schedules.
- Create/edit/delete schedule (cron UI).

### 2.8 Alerts

- List/view active and historical alerts.
- Configure alert channels (email, future: Slack, webhook).

### 2.9 Users

- List all users.
- Invite new user.
- Role management.

### 2.10 Settings

- App-wide settings (app name, logo).
- Notification settings.
- API keys management.

### 2.11 Error & Redirects

- Unauthenticated access redirects to login.
- 404 error page for invalid routes.
- Post-login: redirect to dashboard.
- Post-logout: redirect to landing.

---

## 3. Navigation Structure

- **Top Navigation Bar:** Logo (home), Dashboard, Data Sources, Indicators, Groups, Schedules, Alerts, Users, Settings, Profile/Logout.
- **Sidebar/Contextual Navigation:** Context-specific submenus under main sections.

---

## 4. UI/UX & Design Guidelines

- Responsive and mobile-friendly.
- Clean, modern design with a utility-first CSS framework (e.g., Tailwind CSS).
- Accessible (WCAG compliance).
- Provide clear feedback on user actions (success, error messages).
- Fast loading times, lightweight assets.

---

## 5. Suggested Technology Stack

### Frontend

- React.js (with TypeScript)
- Tailwind CSS (or Material-UI)
- React Router (routing/navigation)
- Redux or Context API (state management)

### Backend

- Node.js with Express.js
- REST API architecture
- Prisma ORM for database operations
- Built-in data quality computation logic

### Database

- PostgreSQL (primary storage for configs, users, results)
- Prisma ORM (or Sequelize, or TypeORM)

### Auth & Security

- JWT-based authentication
- Role-based access control

### DevOps & Deployment

- Docker (containerization)
- Docker Compose (multi-container setup)
- GitHub Actions (CI/CD)
- Nginx (reverse proxy)
- AWS, GCP, or Heroku (hosting)
- Let's Encrypt (SSL for production)
- Monitoring: Prometheus & Grafana (optional)

---

## 6. Fun and Intelligent Name Ideas

- **Quirkle**
- **Quotient**
- **Datalicious**
- **PiquantIQ**
- **GlitchSnitch**
- **Sherlock Rows**
- **CleanSweep**
- **CheckMate**
- **DataVibe**
- **NiftyGritty**
- **Factastic**
- **MintyFresh**
- **NullBuster**
- **DataMosaic**
- **Data Dazzle**

---

*This document can serve as the foundational brief for your design and development team. Adjust sections as needed for your context!*
