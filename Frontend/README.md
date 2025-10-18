# Kubernetes CIS Benchmark Frontend

**React-based web application for managing Kubernetes CIS Benchmark compliance checks**

---

## Prerequisites

- **Node.js >= 16.0.0**
- **npm >= 8.0.0**

---

## 🚀 Setup Environment

1. **Navigate to the Frontend directory**

   ```bash
   cd Frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure API endpoint**

   Edit `src/services/benchmarkAPI.ts`:

   ```typescript
   const API_BASE_URL = "http://localhost:3001"; // Change to your backend URL
   ```

   or
   Create `.env` file:

   ```env
   BACK_END_URL=http://<your_url>

   ```

4. **Start the development server**

   ```bash
   npm start
   ```

5. **Open your browser**

   The application will be available at `http://localhost:3000`

---

## 🏗️ Build for Production

```bash
npm run build
```

The build files will be generated in the `build/` directory.

---

## 🚨 Troubleshooting

**Port already in use:**

```bash
npx kill-port 3000
```

**Node modules issues:**

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## �️ Technology Stack

- React 18.2.0 + TypeScript
- Tailwind CSS
- Lucide React Icons
