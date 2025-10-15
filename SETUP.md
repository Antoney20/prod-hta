# HTA Frontend Setup Guide

This guide will walk you through setting up the HTA Frontend app.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### 1. Node.js 18+
- **Download:** [https://nodejs.org/](https://nodejs.org/)
- **Verify installation:**
  ```bash
  node --version
  npm --version
  ```

### 2. PM2 (Process Manager)
PM2 is required for running the Next.js application in production mode.

**Installation:**
```bash
sudo npm install -g pm2
```

**Verify installation:**
```bash
pm2 --version
```

---

## Environment Configuration

### Create Environment File

Create a `.env.local` file in the project root directory with the following configuration:

```properties
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

**Note:** This URL should point to your HTA Server backend API.
---

## Setup Process

### 1. Navigate to Project Directory
```bash
cd hta
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required packages listed in `package.json`.

### 3. Build the Application
```bash
npm run build
```

This creates an optimized production build of your Next.js application.

---

## Running the Application

### Development Mode

For development with hot-reload:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Mode with PM2

#### Start the Application
```bash
pm2 start npm --name "hta-frontend" -- start
```

#### View Running Applications
```bash
pm2 list
```

#### View Application Logs
```bash
pm2 logs hta-frontend
```

#### Stop the Application
```bash
pm2 stop hta-frontend
```

#### Restart the Application
```bash
pm2 restart hta-frontend
```

#### Delete from PM2
```bash
pm2 delete hta-frontend
```

### Configure PM2 for Auto-Restart on System Boot

```bash
pm2 startup
pm2 save
```

---

## Access the Application

- **Frontend Application:** [http://localhost:3000](http://localhost:3000)
- **Ensure Backend is Running:** The backend API should be running at [http://127.0.0.1:8000](http://127.0.0.1:8000)

---




## Development - important scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

---


### Additional Resources to help in setup

For detailed guidance on hosting Next.js with Nginx, refer to:
[How to Host Your Next.js Nginx Application Efficiently](https://www.dhiwise.com/post/how-to-host-your-nextjs-nginx-application-efficiently)

---

