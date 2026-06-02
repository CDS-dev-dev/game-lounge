// ゲームモード選択ボタンコンポーネント

'use client';

import React from 'react';
import { Cpu, Users, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface GameModeButtonProps {
  mode: 'cpu' | 'local' | 'online';
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const modeConfig = {
  cpu: {
    icon: Cpu,
    label: 'CPU対戦',
    description: 'AIと対戦',
    color: 'text-indigo-600',
  },
  local: {
    icon: Users,
    label: 'ローカル対戦',
    description: '同じ端末で対戦',
    color: 'text-green-600',
  },
  online: {
    icon: Globe,
    label: 'オンライン対戦',
    description: 'インターネット対戦',
    color: 'text-blue-600',
  },
};

export const GameModeButton: React.FC<GameModeButtonProps> = ({
  mode,
  onClick,
  disabled = false,
  className = '',
}) => {
  const config = modeConfig[mode];
  const Icon = config.icon;

  return (
    <Button
      variant="primary"
      size="lg"
      onClick={onClick}
      disabled={disabled}
      className={`h-auto py-6 ${className}`}
      aria-label={config.label}
    >
      <div className="flex flex-col items-center gap-2">
        <Icon className={`w-8 h-8 ${config.color}`} aria-hidden="true" />
        <div>
          <div className="font-bold text-base sm:text-lg">{config.label}</div>
          <div className="text-xs sm:text-sm opacity-90">{config.description}</div>
        </div>
      </div>
    </Button>
  );
};
