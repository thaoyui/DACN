# Kubernetes CIS Benchmark Backend API

**Express.js API server for processing Kubernetes CIS Benchmark selections and running security scans**

---

## 📋 Prerequisites

- **Node.js >= 16.0.0**
- **npm >= 8.0.0**

---

## � Setup Environment

1. **Navigate to the Backend directory**

   ```bash
   cd Backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create `.env` file:

   ```env
   PORT=<your port>
   IP=<your ip>
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Start production server**

   ```bash
   npm start
   ```

6. **Test the API**

   The API will be available at `http://$IP:$PORT`

   Health check: `GET http://$IP:$PORT/health`

---

## 🔗 API Endpoints

### Health Check

```
GET /health
```

### Benchmark Selections

```
GET /api/selections              # Get all selections
POST /api/selections            # Submit new selection
GET /api/selections/:id         # Get specific selection
```

### Benchmark Scans

```
POST /api/scan                  # Start new scan
GET /api/scan/:scanId          # Get scan status/results
GET /api/scans                 # Get all scans
```

---

## 🚨 Troubleshooting

**Port already in use:**

```bash
npx kill-port $PORT
```

**Node modules issues:**

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 🛠️ Technology Stack

- Express.js + Node.js
- Morgan (HTTP logging)
- Helmet (Security headers)
- CORS (Cross-origin requests)
