import React from 'react';

export const FormRow: React.FC<{ label: string; children: React.ReactNode; error?: string }> = ({ label, children, error }) => (
  <div>
    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);
