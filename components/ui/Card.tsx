// カードコンポーネント

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md ${className}`}>{children}</div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 ${className}`}>{children}</div>;
};

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`px-4 sm:px-6 py-3 sm:py-4 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 ${className}`}>{children}</div>
  );
};
