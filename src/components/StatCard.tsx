import React from 'react';

interface StatMetric {
  label: string;
  value: string | number;
  textColor?: string;
}

interface StatCardProps {
  title: string;
  icon: React.ReactNode;
  metrics: StatMetric[];
}

export const StatCard: React.FC<StatCardProps> = ({ title, icon, metrics }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
        <div className="text-gray-400">
          {icon}
        </div>
      </div>
      <div className="space-y-4 flex-1">
        {metrics.map((metric, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-500 text-sm font-medium">{metric.label}</span>
            <span className={`font-bold ${metric.textColor || 'text-gray-900'}`}>
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};