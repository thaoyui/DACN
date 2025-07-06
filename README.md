# Kubernetes CIS Benchmark System

**Complete web application for Kubernetes CIS Benchmark compliance checking**

---

## 📋 System Overview

Full-stack application with React frontend, Node.js backend, and Python-based Kubernetes security scanning tool.

### 🏗️ Architecture

- **Frontend**: React + TypeScript dashboard
- **Backend**: Express.js API server
- **Scanner**: Python-based Kube-check tool
- **Integration**: Real-time CIS benchmark scanning

---

## 🚀 Quick Start

### Prerequisites

- **Node.js >= 16.0.0**
- **npm >= 8.0.0**
- **Python >= 3.8**

### 1. Setup Backend (Read README.md in Backend for detail)

```bash
cd Backend
npm install
npm start
```

Server runs on `http://localhost:3001`

### 2. Setup Frontend (Read README.md in Frontend for detail)

```bash
cd Frontend
npm install
npm start
```

Application runs on `http://localhost:3000`

### 3. Setup Kube-check

```bash
cd Kube-check
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

---

## 📁 Project Structure

```
DACN/
├── Frontend/           # React dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── data/
│   │   └── services/
│   └── package.json
├── Backend/            # Express API
│   ├── server.js
│   └── package.json
├── Kube-check/         # Python scanner
│   ├── src/
│   ├── config/
│   └── requirements.txt
└── README.md          # This file
```

---

## 🎯 Usage Flow

1. **Open Frontend**: `http://localhost:3000`
2. **Select benchmark items** (e.g., 1.1.1, 1.2.9, 2.1)
3. **Submit selections** to backend
4. **Backend processes** and runs real Kube-check scans
5. **View results** with PASS/FAIL status

---

## 📊 Features

- **Interactive Dashboard**: Modern UI for benchmark selection
- **Real-time Scanning**: Integration with Python Kube-check tool
- **Progress Tracking**: Live scan progress updates
- **Multiple Formats**: Support for different config files
- **Error Handling**: Comprehensive error management

---

## 🔍 CIS Benchmark Mapping

- **1.1.x, 1.2.x**: Control Plane → `master.yaml`
- **2.x**: etcd → `etcd.yaml`
- **3.x**: Control Plane Config → `controlplane.yaml`
- **4.x**: Worker Nodes → `node.yaml`
- **5.x**: Policies → `policies.yaml`

---

**🚀 Ready for production Kubernetes CIS compliance scanning!**
