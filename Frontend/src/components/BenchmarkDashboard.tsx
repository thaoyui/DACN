import React, { useState, useMemo, useEffect, useRef } from 'react';
import { benchmarkData, BenchmarkSection } from '../data/benchmarkData';
import { BenchmarkSectionCard } from './BenchmarkSectionCard';
import { Search, Filter, CheckCircle2, AlertCircle, Loader2, FileText, FileDown, ChevronDown, Wrench, Play } from 'lucide-react';
import { benchmarkAPI } from '../services/benchmarkAPI';
import { RemediationModal } from './RemediationModal';
import { ScanResultsModal } from './ScanResultsModal';
export const BenchmarkDashboard: React.FC = () => {
  const [sections, setSections] = useState<BenchmarkSection[]>(benchmarkData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'manual' | 'automated'>('all');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'html' | 'pdf'>('html');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Remediation State
  const [isRemediationModalOpen, setIsRemediationModalOpen] = useState(false);
  const [remediationCheckIds, setRemediationCheckIds] = useState<string[]>([]);
  const [isRemediating, setIsRemediating] = useState(false);
  const [remediationResults, setRemediationResults] = useState<any[] | null>(null);
  const [isScanResultsModalOpen, setIsScanResultsModalOpen] = useState(false);
  const [lastScanResults, setLastScanResults] = useState<any[]>([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFormatDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredSections = useMemo(() => {
    return sections.map(section => ({
      ...section,
      items: section.items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterType === 'all' ||
          (filterType === 'manual' && item.type === 'Manual') ||
          (filterType === 'automated' && item.type === 'Automated');

        return matchesSearch && matchesFilter;
      })
    })).filter(section => section.items.length > 0);
  }, [sections, searchTerm, filterType]);

  const totalItems = sections.reduce((acc, section) => acc + section.items.length, 0);
  const selectedItems = sections.reduce((acc, section) =>
    acc + section.items.filter(item => item.selected).length, 0);

  // Get failed items that are selected
  const selectedFailedItems = sections.flatMap(section =>
    section.items.filter(item => item.selected && item.status === 'FAIL')
  );

  const handleToggleItem = (itemId: string) => {
    setSections(prevSections =>
      prevSections.map(section => ({
        ...section,
        items: section.items.map(item =>
          item.id === itemId ? { ...item, selected: !item.selected } : item
        )
      }))
    );
  };

  const handleToggleSection = (sectionId: string) => {
    setSections(prevSections =>
      prevSections.map(section => {
        if (section.id === sectionId) {
          const allSelected = section.items.every(item => item.selected);
          return {
            ...section,
            items: section.items.map(item => ({ ...item, selected: !allSelected }))
          };
        }
        return section;
      })
    );
  };

  const handleSelectAll = () => {
    const allSelected = selectedItems === totalItems;
    setSections(prevSections =>
      prevSections.map(section => ({
        ...section,
        items: section.items.map(item => ({ ...item, selected: !allSelected }))
      }))
    );
  };

  // Remediation Handlers
  const handleRemediateSingle = (checkId: string) => {
    setRemediationCheckIds([checkId]);
    setRemediationResults(null);
    setIsRemediationModalOpen(true);
  };

  const handleRemediateSelected = () => {
    const ids = selectedFailedItems.map(item => item.id);
    if (ids.length === 0) return;

    setRemediationCheckIds(ids);
    setRemediationResults(null);
    setIsRemediationModalOpen(true);
  };

  const confirmRemediation = async () => {
    setIsRemediating(true);
    try {
      const response = await benchmarkAPI.remediateCheck(remediationCheckIds);

      if (response.success) {
        setRemediationResults(response.results);

        // Update local state based on VERIFICATION results
        const passedIds = response.results
          .filter((r: any) =>
            // Mark as PASS if verified PASS, OR if action was just remediate and it was successful (legacy/fallback)
            (r.action === 'verify' && r.status === 'PASS') ||
            (!r.action && r.success)
          )
          .map((r: any) => r.checkId);

        const failedIds = response.results
          .filter((r: any) => r.action === 'verify' && r.status !== 'PASS')
          .map((r: any) => r.checkId);

        if (passedIds.length > 0 || failedIds.length > 0) {
          setSections(prevSections =>
            prevSections.map(section => ({
              ...section,
              items: section.items.map(item => {
                if (passedIds.includes(item.id)) {
                  return { ...item, status: 'PASS' };
                }
                if (failedIds.includes(item.id)) {
                  // Keep it as FAIL but maybe add a note? standardizing to FAIL is fine for now
                  return { ...item, status: 'FAIL' };
                }
                return item;
              })
            }))
          );
        }
      } else {
        setSubmitMessage({ type: 'error', text: 'Remediation failed to start' });
        setIsRemediationModalOpen(false);
      }
    } catch (error) {
      console.error('Remediation error:', error);
      setSubmitMessage({
        type: 'error',
        text: 'Failed to execute remediation: ' + (error instanceof Error ? error.message : String(error))
      });
      setIsRemediationModalOpen(false);
    } finally {
      setIsRemediating(false);
    }
  };

  // Xóa hàm handleExport vì không cần thiết nữa
  // const handleExport = () => {
  //   const selectedControls = sections.flatMap(section =>
  //     section.items.filter(item => item.selected).map(item => ({
  //       section: section.title,
  //       id: item.id,
  //       title: item.title,
  //       description: item.description,
  //       type: item.type
  //     }))
  //   );

  //   const dataStr = JSON.stringify(selectedControls, null, 2);
  //   const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

  //   const exportFileDefaultName = 'kubernetes-cis-benchmark-selection.json';

  //   const linkElement = document.createElement('a');
  //   linkElement.setAttribute('href', dataUri);
  //   linkElement.setAttribute('download', exportFileDefaultName);
  //   linkElement.click();
  // };

  const handleRunScan = async () => {
    const selectedControls = sections.flatMap(section =>
      section.items.filter(item => item.selected)
    );

    if (selectedControls.length === 0) {
      setSubmitMessage({ type: 'error', text: 'Please select at least one benchmark item to scan' });
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setSubmitMessage(null);

    try {
      // 1. Submit and Start Scan
      const { scanId } = await benchmarkAPI.submitAndScan(selectedControls);

      // 2. Poll for results
      await benchmarkAPI.pollScanStatus(scanId, (progress, results) => {
        setScanProgress(progress);
      });

      // 3. Get final results
      const finalStatus = await benchmarkAPI.getScanStatus(scanId);

      if (finalStatus.data.status === 'completed') {
        // Update local state with scan results
        const scanResults = finalStatus.data.results;

        setSections(prevSections =>
          prevSections.map(section => ({
            ...section,
            items: section.items.map(item => {
              const result = scanResults.find((r: any) => r.itemId === item.id);
              if (result) {
                return {
                  ...item,
                  status: result.status, // 'PASS' or 'FAIL'
                  remediation: result.remediation
                };
              }
              return item;
            })
          }))
        );

        const failedCount = scanResults.filter((r: any) => r.status === 'FAIL').length;
        setSubmitMessage({
          type: failedCount > 0 ? 'error' : 'success',
          text: `Scan completed! Found ${failedCount} failed checks.`
        });

        // Open results modal
        setLastScanResults(scanResults);
        setIsScanResultsModalOpen(true);
      } else {
        throw new Error('Scan failed to complete');
      }

    } catch (error) {
      console.error('Scan error:', error);
      setSubmitMessage({
        type: 'error',
        text: 'Failed to run scan: ' + (error instanceof Error ? error.message : String(error))
      });
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const handleGenerateReport = async (format: 'html' | 'pdf' = selectedFormat) => {
    const selectedControls = sections.flatMap(section =>
      section.items.filter(item => item.selected)
    );

    if (selectedControls.length === 0) {
      setSubmitMessage({ type: 'error', text: 'Please select at least one benchmark item to generate report' });
      return;
    }

    setIsGeneratingReport(true);
    setSubmitMessage(null);
    setShowFormatDropdown(false);

    try {
      console.log(`📊 Generating ${format.toUpperCase()} report for:`, selectedControls.map(item => item.id));

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `kube-check-report-${timestamp}.${format}`;

      setSubmitMessage({
        type: 'success',
        text: `Generating ${format.toUpperCase()} report with ${selectedControls.length} checks... Please wait.`
      });

      const response = await benchmarkAPI.generateAndDownloadReport(selectedControls, format, filename);

      console.log('✅ Report generated and downloaded:', response);

      setSubmitMessage({
        type: 'success',
        text: `${format.toUpperCase()} report generated and downloaded successfully! Checks: ${selectedControls.length}`
      });

    } catch (error) {
      console.error('❌ Failed to generate report:', error);
      setSubmitMessage({
        type: 'error',
        text: 'Failed to generate report: ' + (error instanceof Error ? error.message : String(error))
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Kubernetes CIS Benchmark
                </h1>
                <p className="mt-2 text-gray-600">
                  Select and manage Kubernetes security compliance checks
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900">
                    {selectedItems} of {totalItems} selected
                  </span>
                </div>

                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  {selectedItems === totalItems ? 'Deselect All' : 'Select All'}
                </button>

                {/* Run Scan Button */}
                <button
                  onClick={handleRunScan}
                  disabled={selectedItems === 0 || isScanning}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isScanning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  <span>
                    {isScanning ? `Scanning ${scanProgress}%...` : 'Run Scan'}
                  </span>
                </button>

                {/* Fix Selected Button */}
                <button
                  onClick={handleRemediateSelected}
                  disabled={selectedFailedItems.length === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Wrench className="h-4 w-4" />
                  <span>
                    Fix Selected ({selectedFailedItems.length})
                  </span>
                </button>

                {/* Export Selection button đã được xóa */}

                {/* Generate Report Dropdown Button */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowFormatDropdown(!showFormatDropdown)}
                    disabled={selectedItems === 0 || isGeneratingReport}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isGeneratingReport ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileDown className="h-4 w-4" />
                    )}
                    <span>
                      {isGeneratingReport
                        ? `Generating ${selectedFormat.toUpperCase()}...`
                        : `Generate Report (${selectedFormat.toUpperCase()})`
                      }
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {showFormatDropdown && !isGeneratingReport && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => {
                          setSelectedFormat('html');
                          handleGenerateReport('html');
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg"
                      >
                        <FileText className="h-4 w-4 text-orange-500" />
                        <span className="text-gray-700">HTML Report</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFormat('pdf');
                          handleGenerateReport('pdf');
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 border-t border-gray-100 last:rounded-b-lg"
                      >
                        <FileDown className="h-4 w-4 text-red-500" />
                        <span className="text-gray-700">PDF Report</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Submit Message */}
        {submitMessage && (
          <div className={`mb-6 p-4 rounded-lg border ${submitMessage.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
            }`}>
            <div className="flex items-center">
              {submitMessage.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              <span className="text-sm font-medium">{submitMessage.text}</span>
              <button
                onClick={() => setSubmitMessage(null)}
                className="ml-auto text-sm underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search controls by ID, title, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="sm:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'manual' | 'automated')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="automated">Automated</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Total: {filteredSections.reduce((acc, section) => acc + section.items.length, 0)} controls
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Automated: {filteredSections.reduce((acc, section) =>
                  acc + section.items.filter(item => item.type === 'Automated').length, 0)} controls
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Manual: {filteredSections.reduce((acc, section) =>
                  acc + section.items.filter(item => item.type === 'Manual').length, 0)} controls
              </span>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {filteredSections.length > 0 ? (
            filteredSections.map((section) => (
              <BenchmarkSectionCard
                key={section.id}
                section={section}
                onToggleItem={handleToggleItem}
                onToggleSection={handleToggleSection}
                onRemediate={handleRemediateSingle}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No controls found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search terms or filters.
              </p>
            </div>
          )}
        </div>
      </div>


      {/* Remediation Modal */}
      <RemediationModal
        isOpen={isRemediationModalOpen}
        onClose={() => setIsRemediationModalOpen(false)}
        onConfirm={confirmRemediation}
        checkIds={remediationCheckIds}
        isLoading={isRemediating}
        results={remediationResults}
      />

      <ScanResultsModal
        isOpen={isScanResultsModalOpen}
        onClose={() => setIsScanResultsModalOpen(false)}
        results={lastScanResults}
      />
    </div >
  );
};
