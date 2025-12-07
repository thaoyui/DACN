import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react';

interface ScanResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    results: any[];
}

export const ScanResultsModal: React.FC<ScanResultsModalProps> = ({
    isOpen,
    onClose,
    results,
}) => {
    if (!isOpen) return null;

    const passedCount = results.filter(r => r.status === 'PASS').length;
    const failedCount = results.filter(r => r.status === 'FAIL').length;
    const warnCount = results.filter(r => r.status === 'WARN').length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Scan Results</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Summary Stats */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex space-x-8">
                    <div className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                        <span className="font-medium text-gray-900">{passedCount} Passed</span>
                    </div>
                    <div className="flex items-center">
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span className="font-medium text-gray-900">{failedCount} Failed</span>
                    </div>
                    {warnCount > 0 && (
                        <div className="flex items-center">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                            <span className="font-medium text-gray-900">{warnCount} Warnings</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {failedCount === 0 && warnCount === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">All Checks Passed!</h3>
                            <p className="text-gray-500 mt-2">Your cluster configuration meets all selected benchmarks.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Failed Checks */}
                            {failedCount > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-red-800 uppercase tracking-wider mb-3">Failed Checks</h3>
                                    <div className="space-y-3">
                                        {results.filter(r => r.status === 'FAIL').map((result, idx) => (
                                            <div key={idx} className="bg-red-50 border border-red-100 rounded-lg p-4">
                                                <div className="flex items-start">
                                                    <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="text-sm font-medium text-red-900">
                                                            {result.itemId}: {result.title}
                                                        </h4>
                                                        <p className="text-sm text-red-700 mt-1">{result.details}</p>
                                                        {result.remediation && (
                                                            <div className="mt-3 bg-white bg-opacity-50 rounded p-2 text-xs font-mono text-red-800 border border-red-100">
                                                                {result.remediation}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Warnings */}
                            {warnCount > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-yellow-800 uppercase tracking-wider mb-3">Warnings</h3>
                                    <div className="space-y-3">
                                        {results.filter(r => r.status === 'WARN').map((result, idx) => (
                                            <div key={idx} className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                                                <div className="flex items-start">
                                                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="text-sm font-medium text-yellow-900">
                                                            {result.itemId}: {result.title}
                                                        </h4>
                                                        <p className="text-sm text-yellow-700 mt-1">{result.details}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
