const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface BenchmarkSelection {
  id: string;
  timestamp: string;
  selectedItems: Array<{
    id: string;
    title: string;
    description: string;
    type: 'Automated' | 'Manual';
  }>;
  totalSelected: number;
  metadata?: any;
  status: string;
}

export interface ScanResult {
  id: string;
  selectionId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  progress: number;
  results: Array<{
    itemId: string;
    title: string;
    status: 'PASS' | 'FAIL';
    score: number;
    details: string;
    recommendations: string[];
    timestamp: string;
  }>;
}

class BenchmarkAPIService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Submit benchmark selections
  async submitSelections(selectedItems: any[], metadata: any = {}) {
    return this.makeRequest('/api/selections', {
      method: 'POST',
      body: JSON.stringify({
        selectedItems,
        metadata: {
          source: 'frontend-dashboard',
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          ...metadata
        }
      }),
    });
  }

  // Get all selections
  async getSelections() {
    return this.makeRequest('/api/selections');
  }

  // Get specific selection
  async getSelection(selectionId: string) {
    return this.makeRequest(`/api/selections/${selectionId}`);
  }

  // Start benchmark scan
  async startScan(selectionId: string, config: any = {}) {
    return this.makeRequest('/api/scan', {
      method: 'POST',
      body: JSON.stringify({
        selectionId,
        config: {
          timeout: 300,
          parallel: false,
          ...config
        }
      }),
    });
  }

  // Get scan status and results
  async getScanStatus(scanId: string) {
    return this.makeRequest(`/api/scan/${scanId}`);
  }

  // Get all scans
  async getScans() {
    return this.makeRequest('/api/scans');
  }

  // Check API health
  async checkHealth() {
    return this.makeRequest('/health');
  }

  // Helper: Submit selections and start scan in one go
  async submitAndScan(selectedItems: any[], metadata: any = {}, scanConfig: any = {}) {
    try {
      // 1. Submit selections
      const selectionResponse = await this.submitSelections(selectedItems, metadata);
      const selectionId = selectionResponse.data.selectionId;

      console.log('✅ Selections submitted:', selectionId);

      // 2. Start scan
      const scanResponse = await this.startScan(selectionId, scanConfig);
      const scanId = scanResponse.data.scanId;

      console.log('🔍 Scan started:', scanId);

      return {
        selectionId,
        scanId,
        selection: selectionResponse.data,
        scan: scanResponse.data
      };
    } catch (error) {
      console.error('Error in submitAndScan:', error);
      throw error;
    }
  }

  // Helper: Poll scan status until completion
  async pollScanStatus(scanId: string, onProgress?: (progress: number, results: any[]) => void) {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const response = await this.getScanStatus(scanId);
          const scan = response.data;

          if (onProgress) {
            onProgress(scan.progress, scan.results);
          }

          if (scan.status === 'completed') {
            resolve(scan);
          } else if (scan.status === 'failed') {
            reject(new Error('Scan failed'));
          } else {
            // Continue polling
            setTimeout(poll, 2000); // Poll every 2 seconds
          }
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  // Generate HTML report from selected items
  async generateReport(selectedItems: any[], format: string = 'html', filename?: string) {
    return this.makeRequest('/api/generate-report', {
      method: 'POST',
      body: JSON.stringify({
        selectedItems,
        format,
        filename
      }),
    });
  }

  // Download report file
  async downloadReport(filename: string) {
    const url = `${API_BASE_URL}/api/download-report/${filename}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Create blob and download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true };
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  // List available reports
  async getReports() {
    return this.makeRequest('/api/reports');
  }

  // Generate and automatically download report
  async generateAndDownloadReport(selectedItems: any[], format: string = 'html', filename?: string) {
    try {
      // 1. Generate report
      const generateResponse = await this.generateReport(selectedItems, format, filename);

      if (!generateResponse.success) {
        throw new Error(generateResponse.message || 'Failed to generate report');
      }

      const reportFilename = generateResponse.data.filename;
      console.log('✅ Report generated:', reportFilename);

      // 2. Automatically download
      await this.downloadReport(reportFilename);

      return {
        success: true,
        filename: reportFilename,
        data: generateResponse.data
      };
    } catch (error) {
      console.error('Error in generateAndDownloadReport:', error);
      throw error;
    }
  }
  // Remediate specific checks
  async remediateCheck(checkIds: string[]) {
    return this.makeRequest('/api/remediate', {
      method: 'POST',
      body: JSON.stringify({
        checkIds
      }),
    });
  }
}

export const benchmarkAPI = new BenchmarkAPIService();
export default benchmarkAPI;
