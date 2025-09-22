import React from 'react';

export const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 border border-light-border dark:border-dark-border flex-1 min-w-[150px]">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{title}</p>
        <p className="text-2xl font-bold text-light-text dark:text-dark-text">{value}</p>
      </div>
      <div className={`p-2 ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);
