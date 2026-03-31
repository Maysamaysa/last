# 🏆 Football Match Management System — NestJS Backend

[![NestJS](https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Sequelize](https://img.shields.io/badge/sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)](https://sequelize.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

> A robust, production-ready REST API for managing football leagues, teams, players, and match results. Built with a focus on high security, real-time updates, and scalability.

---

## 🚀 Features

*   **🔒 Professional Security**: 
    - OWASP Top 10 (2021) compliance.
    - Argon2id password hashing + AES-256-GCM for sensitive token encryption.
    - JWT Access & Refresh token rotation with Redis-backed blacklisting.
    - Rate limiting (Throttler) and Helmet security headers.
*   **📊 Database & ORM**: 
    - Sequelize ORM with strict TypeScript-first models.
    - PostgreSQL 16 for high-performance data storage.
    - 9 core models: Users, Leagues, Teams, Players, Matches, Events, Stats, and Standings.
*   **⚡ Real-time SSE**: 
    - Built-in Server-Sent Events (SSE) for live match score updates.
    - Integrated with Redis for cross-instance communication.
*   **📚 Auto-generated Documentation**: 
    - Full Swagger/OpenAPI 3.0 support at `/api/docs`.
    - Integrated BaerAuth and OAuth2 documentation.
*   **🐳 Containerized**: 
    - Multi-stage Docker builds for optimized production images.
    - Orchestrated with Docker Compose (API + DB + Redis).

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | NestJS v10+ (TypeScript strict mode) |
| **ORM** | Sequelize v6 + sequelize-typescript |
| **Database** | PostgreSQL 16 |
| **Auth** | JWT + Passport + OAuth 2.0 (Google/GitHub) |
| **Security** | Helmet + CORS + Rate Limit (Throttler) |
| **Caching/SSE** | Redis (ioredis) |
| **Documentation** | Swagger / OpenAPI 3.0 |
| **Container** | Docker + Docker Compose |

---

## ⚙️ Getting Started

### 1. Prerequisites
- [Docker](https://www.docker.com/get-started) & [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js v20+](https://nodejs.org/) (for local development)

### 2. Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd football-api

# Install dependencies (only required for local linting/testing)
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and configure your credentials:
```bash
cp .env.example .env
```

### 4. Launching the System
Use the development override to enable hot-reloading and expose ports:
```bash
# Start the full stack (API, PostgreSQL, Redis)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

### 5. Manual Seeding
Once the database is up, you can seed it with initial data using the provided [seed.sql](file:///Users/thanachanontwetsandonpong/Documents/uni/fullstack/last/seed.sql) file.
- **Admin**: `admin@football.com`
- **Password**: `Admin@12345678`

---

## 📖 API Documentation

Once the server is running, you can access the interactive Swagger documentation at:
🔗 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

---

## 🗂️ Project Structure

```text
src/
├── config/            # App, Database, and Logger configuration
├── common/           
│   ├── decorators/    # @Roles, @Public, @CurrentUser
│   ├── dto/           # Standard Pagination and API Response DTOs
│   ├── filters/       # Global Exception handling
│   ├── guards/        # JWT and Role-based Access Control
│   ├── interceptors/  # Response formatting and logging
│   └── utils/         # Crypto, SSE, and Validation utilities
├── database/         
│   └── models/        # Sequelize model definitions
└── modules/          
    ├── auth/          # Identity and Access management
    ├── leagues/       # League CRUD and management
    ├── teams/         # Team management and logo uploads
    ├── players/       # Player profiles
    ├── matches/       # Match scheduling and SSE scores
    └── me/            # User profile endpoints
```

---

## 🔒 Security Best Practices
Our implementation includes:
- **A01: Broken Access Control**: Strict RolesGuard and resource ownership checks.
- **A02: Cryptographic Failures**: Industry-standard Argon2id and AES algorithms.
- **A03: Injection**: Strict `ValidationPipe` with whitelist enforcement.
- **A04: Insecure Design**: Account lockout and timing attack prevention.
- **A05: Security Misconfiguration**: Secure CSRF/XSS protection via Helmet.

---

## 📝 License
This project is licensed under the [MIT License](LICENSE).
