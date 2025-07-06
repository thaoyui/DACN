const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const { v4: uuidv4 } = require("uuid");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
const app = express();
require('dotenv').config();
const IP = process.env.IP || 'localhost';
const PORT = process.env.PORT || 3001;

// Thành:
// Tự động tạo API_BASE_URL nếu cần
const API_BASE_URL = `http://${IP}:${PORT}`;

// Sử dụng trong CORS (nếu cần)
const FRONTEND_URL = process.env.FRONTEND_URL || `http://${IP}:3000`;
const BACKEND_URL = `http://${IP}:${PORT}`;

// Paths
const KUBE_CHECK_PATH = path.join(__dirname, "..", "Kube-check");
const VENV_PATH = path.join(KUBE_CHECK_PATH, "venv");
const REPORTS_PATH = path.join(KUBE_CHECK_PATH, "reports");
const PYTHON_EXECUTABLE =
  process.platform === "win32"
    ? path.join(VENV_PATH, "Scripts", "python.exe")
    : path.join(VENV_PATH, "bin", "python");

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_PATH)) {
  fs.mkdirSync(REPORTS_PATH, { recursive: true });
  console.log(`📁 Created reports directory: ${REPORTS_PATH}`);
}

// Config file mapping
const CONFIG_MAPPING = {
  1.1: "master.yaml",
  1.2: "master.yaml",
  1.3: "master.yaml",
  1.4: "master.yaml",
  "2.": "etcd.yaml",
  "3.": "controlplane.yaml",
  "4.": "node.yaml",
  "5.": "policies.yaml",
};

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: [FRONTEND_URL, BACKEND_URL],
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Set timeout 30 phút cho mọi request
app.use((req, res, next) => {
  req.setTimeout(30 * 60 * 1000);
  res.setTimeout(30 * 60 * 1000);
  next();
});

// In-memory storage
let benchmarkSelections = [];
let scanResults = [];

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Kubernetes CIS Benchmark API",
  });
});

// GET all benchmark selections
app.get("/api/selections", (req, res) => {
  res.status(200).json({
    success: true,
    data: benchmarkSelections,
    total: benchmarkSelections.length,
  });
});

// POST - Submit benchmark selections từ frontend
app.post("/api/selections", (req, res) => {
  try {
    const { selectedItems, metadata = {} } = req.body;
    if (!selectedItems || !Array.isArray(selectedItems)) {
      return res.status(400).json({
        success: false,
        error: "Invalid request",
        message: "selectedItems must be an array",
      });
    }
    for (const item of selectedItems) {
      if (!item.id || !item.title) {
        return res.status(400).json({
          success: false,
          error: "Invalid item format",
          message: "Each item must have id and title",
        });
      }
    }
    const selectionRecord = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      selectedItems,
      totalSelected: selectedItems.length,
      metadata: {
        userAgent: req.get("User-Agent"),
        ipAddress: req.ip,
        ...metadata,
      },
      status: "submitted",
    };
    benchmarkSelections.push(selectionRecord);
    res.status(201).json({
      success: true,
      message: "Benchmark selection submitted successfully",
      data: {
        selectionId: selectionRecord.id,
        totalSelected: selectedItems.length,
        timestamp: selectionRecord.timestamp,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to process selection",
      message: error.message,
    });
  }
});

// GET specific selection by ID
app.get("/api/selections/:id", (req, res) => {
  const { id } = req.params;
  const selection = benchmarkSelections.find((s) => s.id === id);
  if (!selection) {
    return res.status(404).json({
      success: false,
      error: "Selection not found",
      message: `No selection found with ID: ${id}`,
    });
  }
  res.status(200).json({ success: true, data: selection });
});

// POST - Start benchmark scan based on selections
app.post("/api/scan", (req, res) => {
  try {
    const { selectionId, config = {} } = req.body;
    if (!selectionId) {
      return res.status(400).json({
        success: false,
        error: "Selection ID is required",
      });
    }
    const selection = benchmarkSelections.find((s) => s.id === selectionId);
    if (!selection) {
      return res.status(404).json({
        success: false,
        error: "Selection not found",
      });
    }
    const scanJob = {
      id: uuidv4(),
      selectionId,
      status: "running",
      startTime: new Date().toISOString(),
      config,
      progress: 0,
      results: [],
    };
    scanResults.push(scanJob);
    simulateBenchmarkScan(scanJob, selection.selectedItems);
    res.status(202).json({
      success: true,
      message: "Benchmark scan started",
      data: {
        scanId: scanJob.id,
        selectionId,
        status: "running",
        estimatedDuration: `${selection.selectedItems.length * 2} seconds`,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to start scan",
      message: error.message,
    });
  }
});

// GET scan status and results
app.get("/api/scan/:scanId", (req, res) => {
  const { scanId } = req.params;
  const scan = scanResults.find((s) => s.id === scanId);
  if (!scan) {
    return res.status(404).json({
      success: false,
      error: "Scan not found",
    });
  }
  res.status(200).json({ success: true, data: scan });
});

// GET all scans
app.get("/api/scans", (req, res) => {
  res.status(200).json({
    success: true,
    data: scanResults,
    total: scanResults.length,
  });
});

// GET Kube-check system status
app.get("/api/kube-check/status", (req, res) => {
  const status = {
    kubeCheckPath: KUBE_CHECK_PATH,
    venvPath: VENV_PATH,
    pythonExecutable: PYTHON_EXECUTABLE,
    pathExists: {
      kubeCheck: fs.existsSync(KUBE_CHECK_PATH),
      venv: fs.existsSync(VENV_PATH),
      python: fs.existsSync(PYTHON_EXECUTABLE),
      mainPy: fs.existsSync(path.join(KUBE_CHECK_PATH, "src", "main.py")),
    },
    configFiles: {},
  };
  for (const [prefix, configFile] of Object.entries(CONFIG_MAPPING)) {
    const configPath = path.join(KUBE_CHECK_PATH, "config", configFile);
    status.configFiles[configFile] = fs.existsSync(configPath);
  }
  res.status(200).json({
    success: true,
    data: status,
    ready:
      status.pathExists.kubeCheck &&
      status.pathExists.python &&
      status.pathExists.mainPy,
  });
});

// POST Test single Kube-check
app.post("/api/kube-check/test", (req, res) => {
  const { checkId } = req.body;
  if (!checkId) {
    return res.status(400).json({
      success: false,
      error: "Check ID is required",
    });
  }
  runKubeCheck(checkId, (error, result) => {
    if (error) {
      res.status(500).json({
        success: false,
        error: "Kube-check test failed",
        message: error,
        checkId,
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Kube-check test completed",
        data: result,
      });
    }
  });
});

// POST - Generate HTML report for selected checks (dummy)
app.post("/api/reports/generate", (req, res) => {
  const { selectionIds } = req.body;
  if (
    !selectionIds ||
    !Array.isArray(selectionIds) ||
    selectionIds.length === 0
  ) {
    return res.status(400).json({
      success: false,
      error: "Invalid request",
      message: "selectionIds must be a non-empty array",
    });
  }
  const reportFileName = `kube_check_report_${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.html`;
  const reportFilePath = path.join(REPORTS_PATH, reportFileName);
  fs.writeFileSync(
    reportFilePath,
    `<html><body><h1>Kube-check Report</h1><p>Generated on ${new Date().toISOString()}</p></body></html>`
  );
  res.status(201).json({
    success: true,
    message: "Report generated successfully",
    data: {
      reportFileName,
      reportFilePath,
    },
  });
});

// POST - Generate HTML/PDF report from multiple selections (real)
app.post("/api/generate-report", async (req, res) => {
  try {
    const { selectedItems, format = "html", filename } = req.body;
    if (
      !selectedItems ||
      !Array.isArray(selectedItems) ||
      selectedItems.length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid request",
        message: "selectedItems must be a non-empty array",
      });
    }
    if (!["html", "pdf"].includes(format)) {
      return res.status(400).json({
        success: false,
        error: "Invalid format",
        message: 'Format must be either "html" or "pdf"',
      });
    }
    const checkIds = selectedItems.map((item) => item.id);
    const reportId = uuidv4();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportFilename =
      filename || `kube-check-report-${timestamp}.${format}`;
    const reportPath = path.join(REPORTS_PATH, reportFilename);
    const checksByConfig = {};
    for (const checkId of checkIds) {
      const configFile = getConfigFile(checkId);
      if (!configFile) {
        return res.status(400).json({
          success: false,
          error: "Invalid check ID",
          message: `Unknown check ID format: ${checkId}`,
        });
      }
      if (!checksByConfig[configFile]) {
        checksByConfig[configFile] = [];
      }
      checksByConfig[configFile].push(checkId);
    }
    const results = await runMultipleKubeChecks(
      checksByConfig,
      format,
      reportPath
    );
    if (results.success) {
      if (fs.existsSync(reportPath)) {
        return res.status(200).json({
          success: true,
          message: "Report generated successfully",
          data: {
            reportId,
            filename: reportFilename,
            format,
            downloadUrl: `/api/download-report/${reportFilename}`,
            checksExecuted: checkIds.length,
            timestamp: new Date().toISOString(),
            size: fs.statSync(reportPath).size,
          },
        });
      } else {
        return res.status(500).json({
          success: false,
          error: "Report generation failed",
          message: "Report file was not created",
        });
      }
    } else {
      return res.status(500).json({
        success: false,
        error: "Report generation failed",
        message: results.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to generate report",
      message: error.message,
    });
  }
});

// GET - Download report file
app.get("/api/download-report/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(REPORTS_PATH, filename);
  if (
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    return res.status(400).json({
      success: false,
      error: "Invalid filename",
      message: "Filename contains invalid characters",
    });
  }
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: "File not found",
      message: `Report file ${filename} not found`,
    });
  }
  const stat = fs.statSync(filePath);
  let contentType = "application/octet-stream";
  if (filename.endsWith(".html")) contentType = "text/html";
  else if (filename.endsWith(".pdf")) contentType = "application/pdf";
  else if (filename.endsWith(".json")) contentType = "application/json";
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", stat.size);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
  fileStream.on("error", (error) => {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "File streaming error",
        message: error.message,
      });
    }
  });
});

// GET - List available reports
app.get("/api/reports", (req, res) => {
  if (!fs.existsSync(REPORTS_PATH)) {
    return res.status(200).json({
      success: true,
      data: [],
      total: 0,
    });
  }
  const files = fs
    .readdirSync(REPORTS_PATH)
    .map((filename) => {
      const filePath = path.join(REPORTS_PATH, filename);
      const stat = fs.statSync(filePath);
      return {
        filename,
        size: stat.size,
        created: stat.birthtime,
        modified: stat.mtime,
        downloadUrl: `/api/download-report/${filename}`,
      };
    })
    .sort((a, b) => new Date(b.created) - new Date(a.created));
  res.status(200).json({
    success: true,
    data: files,
    total: files.length,
  });
});

// Simulate benchmark scan process
function simulateBenchmarkScan(scanJob, selectedItems) {
  const totalItems = selectedItems.length;
  let completedItems = 0;
  const processItem = () => {
    if (completedItems >= totalItems) {
      scanJob.status = "completed";
      scanJob.endTime = new Date().toISOString();
      scanJob.progress = 100;
      return;
    }
    const currentItem = selectedItems[completedItems];
    runKubeCheck(currentItem.id, (error, result) => {
      if (error) {
        result = {
          itemId: currentItem.id,
          title: currentItem.title,
          status: "FAIL",
          score: 0,
          details: `Error running scan: ${error}`,
          recommendations: [
            "Check Kube-check configuration",
            "Verify system requirements",
          ],
          timestamp: new Date().toISOString(),
        };
      }
      scanJob.results.push(result);
      completedItems++;
      scanJob.progress = Math.round((completedItems / totalItems) * 100);
      setTimeout(processItem, 1000);
    });
  };
  setTimeout(processItem, 1000);
}

// Function to run actual Kube-check scan
function runKubeCheck(checkId, callback) {
  const configFile = getConfigFile(checkId);
  if (!configFile) {
    return callback(`Unknown check ID format: ${checkId}`, null);
  }
  const configPath = path.join(KUBE_CHECK_PATH, "config", configFile);
  if (!fs.existsSync(configPath)) {
    return callback(`Config file not found: ${configPath}`, null);
  }
  if (!fs.existsSync(PYTHON_EXECUTABLE)) {
    return callback(
      `Python executable not found: ${PYTHON_EXECUTABLE}. Please run 'python -m venv venv' in Kube-check directory`,
      null
    );
  }
  const command = PYTHON_EXECUTABLE;
  const args = ["src/main.py", "run", "--check", checkId, configPath];
  const options = {
    cwd: KUBE_CHECK_PATH,
    timeout: 30 * 60 * 1000, // 30 phút timeout
    env: { ...process.env },
  };
  const child = spawn(command, args, options);
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (data) => {
    stdout += data.toString();
  });
  child.stderr.on("data", (data) => {
    stderr += data.toString();
  });
  child.on("close", (code) => {
    if (code === 0) {
      try {
        const result = parseKubeCheckOutput(checkId, stdout);
        callback(null, result);
      } catch (parseError) {
        callback(`Failed to parse output: ${parseError}`, null);
      }
    } else {
      callback(`Kube-check failed with exit code ${code}: ${stderr}`, null);
    }
  });
  child.on("error", (error) => {
    callback(`Failed to start process: ${error.message}`, null);
  });
}

// Function to determine config file based on check ID
function getConfigFile(checkId) {
  for (const [prefix, configFile] of Object.entries(CONFIG_MAPPING)) {
    if (checkId.startsWith(prefix)) {
      return configFile;
    }
  }
  return null;
}

// Function to parse Kube-check output
function parseKubeCheckOutput(checkId, output) {
  try {
    if (output.trim().startsWith("{")) {
      const jsonResult = JSON.parse(output);
      return {
        itemId: checkId,
        title: jsonResult.title || `Check ${checkId}`,
        status: jsonResult.status === "PASS" ? "PASS" : "FAIL",
        score: jsonResult.status === "PASS" ? 100 : 0,
        details:
          jsonResult.description ||
          jsonResult.details ||
          "Kube-check scan completed",
        recommendations: jsonResult.remediation ? [jsonResult.remediation] : [],
        timestamp: new Date().toISOString(),
        rawOutput: output.substring(0, 500),
      };
    }
    const lines = output.split("\n");
    let status = "FAIL";
    let details = "Scan completed";
    let title = `Check ${checkId}`;
    for (const line of lines) {
      if (line.includes("PASS") || line.includes("✓") || line.includes("OK")) {
        status = "PASS";
      }
      if (
        line.includes("FAIL") ||
        line.includes("✗") ||
        line.includes("ERROR")
      ) {
        status = "FAIL";
      }
      if (line.includes(checkId)) {
        title = line.trim();
      }
    }
    return {
      itemId: checkId,
      title: title,
      status: status,
      score: status === "PASS" ? 100 : 0,
      details: details,
      recommendations:
        status === "FAIL"
          ? [
              "Review the failed check configuration",
              "Apply recommended security settings",
              "Consult CIS Kubernetes benchmark documentation",
            ]
          : [],
      timestamp: new Date().toISOString(),
      rawOutput: output.substring(0, 500),
    };
  } catch (error) {
    return {
      itemId: checkId,
      title: `Check ${checkId}`,
      status: "FAIL",
      score: 0,
      details: `Failed to parse scan results: ${error.message}`,
      recommendations: [
        "Check Kube-check output format",
        "Verify scan execution",
      ],
      timestamp: new Date().toISOString(),
      rawOutput: output.substring(0, 500),
    };
  }
}

// Function to run multiple Kube-checks and generate report
async function runMultipleKubeChecks(checksByConfig, format, outputPath) {
  return new Promise((resolve) => {
    try {
      const allChecks = [];
      for (const [configFile, checks] of Object.entries(checksByConfig)) {
        allChecks.push(...checks);
      }
      if (!fs.existsSync(PYTHON_EXECUTABLE)) {
        return resolve({
          success: false,
          error: `Python executable not found: ${PYTHON_EXECUTABLE}`,
        });
      }
      const command = PYTHON_EXECUTABLE;
      const args = [
        "src/main.py",
        "run",
        "--check",
        allChecks.join(","),
        "--output-format",
        format,
        "--output-file",
        outputPath,
        "--auto-config",
      ];
      const options = {
        cwd: KUBE_CHECK_PATH,
        timeout: 30 * 60 * 1000, // 30 phút timeout
        env: { ...process.env },
      };
      const child = spawn(command, args, options);
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (data) => {
        stdout += data.toString();
        console.log(`[Kube-check stdout]: ${data.toString().trim()}`);
      });
      child.stderr.on("data", (data) => {
        stderr += data.toString();
        console.log(`[Kube-check stderr]: ${data.toString().trim()}`);
      });
      child.on("close", (code) => {
        if (code === 0) {
          resolve({
            success: true,
            stdout: stdout,
            stderr: stderr,
            checksExecuted: allChecks.length,
          });
        } else {
          resolve({
            success: false,
            error: `Kube-check failed with exit code ${code}: ${
              stderr || "Unknown error"
            }`,
            stdout: stdout,
            stderr: stderr,
          });
        }
      });
      child.on("error", (error) => {
        resolve({
          success: false,
          error: `Failed to start process: ${error.message}`,
        });
      });
    } catch (error) {
      resolve({
        success: false,
        error: `Exception: ${error.message}`,
      });
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Not found",
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Start server
app.listen(PORT, IP, () => {
  console.log(`🚀 Server is running at http://${IP}:${PORT}`);
  console.log(`🌐 Health check: http://${IP}:${PORT}/health`);
});

module.exports = app;
