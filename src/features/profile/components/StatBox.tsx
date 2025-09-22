import React from 'react';

export const StatBox: React.FC<{ label: string; value: number | string }> = ({ label, value }) => (
    <div className="bg-light-bg dark:bg-dark-bg p-4 text-center border border-light-border dark:border-dark-border rounded-lg">
        <p className="text-2xl font-bold text-primary">{value}</p>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{label}</p>
    </div>
);
