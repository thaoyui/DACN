# kube-bench-python

**Kubernetes Security Benchmark Tool for K8s v1.30 (File-based, kube-bench compatible)**

---

## 📌 Description

A security benchmark tool for Kubernetes v1.30, compatible with CIS Benchmark and kube-bench. Uses YAML configuration files and supports exporting reports in multiple formats (text, HTML, PDF, CSV, JSON, etc.).

---

## 🚀 Installation

1. **Clone the repository**

   ```
   git clone https://github.com/your-org/kube-bench-python.git
   cd kube-bench-python
   ```

2. **Create a Python Virtual Environment (recommended)**

   ```
   python3 -m venv venv
   source venv/bin/activate    # On Linux/Mac
   ```

   **On Windows:**

   ```
   venv\Scripts\activate
   ```

3. **Install dependencies**

   ```
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

---

## 🛠️ Usage

### **1. Check version**

```
python src/main.py version
```

### **2. Run a security scan (default configuration)**

```
python src/main.py run
```

**By default, this uses the configuration files in the `config/` folder.**

### **3. Run with a specific configuration file**

```
python src/main.py run config/etcd.yaml
```

### **4. Run with multiple configuration files**

```
python src/main.py run config/etcd.yaml config/controlplane.yaml
```

### **5. Run specific check IDs**

```
python src/main.py run --check 1.1.1,1.2.3,4.2.1
```

### **6. Export report to file (text, HTML, PDF, etc.)**

```
python src/main.py run --output-format html --output-file reports/report.html
python src/main.py run --output-format pdf --output-file reports/report.pdf
```

### **7. Additional useful options**

- **Hide PASS checks from the report:**  
  `--no-passed`
- **Hide MANUAL checks from the report:**  
  `--no-manual`
- **Hide remediation from the report:**  
  `--no-remediation`
- **Disable progress bar:**  
  `--no-progress`
- **Specify target components:**  
  `--targets etcd --targets controlplane`

**Full example:**

```
python src/main.py run --check 1.1.1,1.2.3 --output-format html --output-file myreport.html --no-passed --no-remediation
```

---

## 📦 Project Structure

```
kube-bench-python/
├── config/              # CIS benchmark YAML configuration files
├── reports/             # Generated report files
├── src/                 # Main source code
│   ├── main.py          # CLI entry point
│   ├── parser.py        # YAML parser
│   ├── executor.py      # Check executor
│   └── ...              # Other modules
├── requirements.txt     # Python dependencies
└── README.md            # This file
```

---

## 🛠️ System Requirements

- **Python >= 3.8**
- **Linux or Windows OS**
- **CIS benchmark configuration files (in the `config/` folder)**
- **Dependencies listed in `requirements.txt`**

## 🚨 Troubleshooting

- **Missing dependencies:** Make sure you have activated your virtual environment and installed all packages in `requirements.txt`.
- **Missing configuration files:** Check the file path in your CLI command.
- **PDF export errors:** Install system libraries required for `weasyprint` (see weasyprint documentation).

---

## 📝 Configuration Files

The tool uses YAML configuration files located in the `config/` directory. Each file contains specific security checks for different Kubernetes components:

- `controlplane.yaml` - Control plane security checks
- `etcd.yaml` - etcd security checks
- `master.yaml` - Master node security checks
- `node.yaml` - Worker node security checks
- `policies.yaml` - Policy-based security checks

---

## 🙏 Acknowledgments

- [CIS Kubernetes Benchmark](https://www.cisecurity.org/benchmark/kubernetes)
- [kube-bench](https://github.com/aquasecurity/kube-bench) for inspiration
- The Kubernetes security community

---
