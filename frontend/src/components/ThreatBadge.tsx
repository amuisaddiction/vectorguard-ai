import React from 'react';

interface ThreatBadgeProps {
  threatType: string;
  confidence: number;
}

const typeColorMap: Record<string, string> = {
  ROLE_OVERRIDE: 'bg-red-500',
  DATA_EXFIL: 'bg-orange-500',
  JAILBREAK: 'bg-red-600',
  PROMPT_INJECTION: 'bg-yellow-500',
  ENCODING_TRICK: 'bg-purple-500',
};

export const ThreatBadge: React.FC<ThreatBadgeProps> = ({ threatType, confidence }) => {
  const bgColor = typeColorMap[threatType] || 'bg-gray-500';
  const confidencePercent = Math.round(confidence * 100);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${bgColor}`}>
      {threatType} &middot; {confidencePercent}%
    </span>
  );
};
