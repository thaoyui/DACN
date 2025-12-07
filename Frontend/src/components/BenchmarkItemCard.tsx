import React from 'react';
import { BenchmarkItem } from '../data/benchmarkData';

interface BenchmarkItemCardProps {
  item: BenchmarkItem;
  onToggle: (id: string) => void;
  onRemediate: (id: string) => void;
}

export const BenchmarkItemCard: React.FC<BenchmarkItemCardProps> = ({ item, onToggle, onRemediate }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id={item.id}
          checked={item.selected}
          onChange={() => onToggle(item.id)}
          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1 cursor-pointer"
        />
        <div className="flex-1 min-w-0">
          <label htmlFor={item.id} className="cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900 leading-5">
                {item.id}: {item.title}
              </h3>
              <div className="flex items-center space-x-2">
                {/* Status Badge */}
                {item.status && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'PASS' ? 'bg-green-100 text-green-800' :
                      item.status === 'FAIL' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                    {item.status}
                  </span>
                )}

                {item.status === 'FAIL' && item.type !== 'Manual' && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onRemediate(item.id);
                    }}
                    className="inline-flex items-center px-2.5 py-0.5 rounded border border-red-300 bg-red-50 text-xs font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Fix
                  </button>
                )}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.type === 'Automated'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}
                >
                  {item.type}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {item.description}
            </p>

            {/* Remediation for FAIL */}
            {item.status === 'FAIL' && item.remediation && (
              <div className="mt-2 p-3 bg-red-50 rounded-md border border-red-100">
                <p className="text-xs font-medium text-red-800 mb-1">Remediation:</p>
                <pre className="text-xs text-red-700 whitespace-pre-wrap font-mono">
                  {item.remediation}
                </pre>
              </div>
            )}

            {/* Remediation for WARN (Manual) */}
            {item.status === 'WARN' && item.remediation && (
              <div className="mt-2 p-3 bg-yellow-50 rounded-md border border-yellow-100">
                <p className="text-xs font-medium text-yellow-800 mb-1">Manual Remediation:</p>
                <pre className="text-xs text-yellow-700 whitespace-pre-wrap font-mono">
                  {item.remediation}
                </pre>
              </div>
            )}
          </label>
        </div>
      </div>
    </div>
  );
};
