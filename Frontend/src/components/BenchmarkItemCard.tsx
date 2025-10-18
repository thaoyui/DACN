import React from 'react';
import { BenchmarkItem } from '../data/benchmarkData';

interface BenchmarkItemCardProps {
  item: BenchmarkItem;
  onToggle: (id: string) => void;
}

export const BenchmarkItemCard: React.FC<BenchmarkItemCardProps> = ({ item, onToggle }) => {
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
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  item.type === 'Automated'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {item.type}
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {item.description}
            </p>
          </label>
        </div>
      </div>
    </div>
  );
};
