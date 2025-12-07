import React, { useState } from 'react';
import { BenchmarkSection } from '../data/benchmarkData';
import { BenchmarkItemCard } from './BenchmarkItemCard';
import { ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react';

interface BenchmarkSectionCardProps {
  section: BenchmarkSection;
  onToggleItem: (id: string) => void;
  onToggleSection: (sectionId: string) => void;
  onRemediate: (checkId: string) => void;
}

export const BenchmarkSectionCard: React.FC<BenchmarkSectionCardProps> = ({
  section,
  onToggleItem,
  onToggleSection,
  onRemediate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedCount = section.items.filter(item => item.selected).length;
  const totalCount = section.items.length;
  const allSelected = selectedCount === totalCount;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;

  const handleSectionToggle = () => {
    onToggleSection(section.id);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {section.title}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {selectedCount} of {totalCount} selected
            </span>
            <button
              onClick={handleSectionToggle}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
            >
              {allSelected ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : someSelected ? (
                <Circle className="h-4 w-4 text-blue-600 fill-current" />
              ) : (
                <Circle className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm font-medium">
                {allSelected ? 'Deselect All' : 'Select All'}
              </span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round((selectedCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(selectedCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6">
          <div className="space-y-4">
            {section.items.map((item) => (
              <BenchmarkItemCard
                key={item.id}
                item={item}
                onToggle={onToggleItem}
                onRemediate={onRemediate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
