import React from 'react';
import { DateRangePicker } from './DateRangePicker'; // Tu componente
import { ExportButtons } from './ExportButtons';

interface Props {
  title: string;
  children: React.ReactNode;
  onFilterChange?: (dates: any) => void;
  showFilters?: boolean;
}

export const ReportLayout: React.FC<Props> = ({ title, children, onFilterChange, showFilters = true }) => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <div className="flex gap-2">
           {showFilters && <DateRangePicker onChange={onFilterChange} />}
           <ExportButtons />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        {children}
      </div>
    </div>
  );
};