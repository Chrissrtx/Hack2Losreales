import React from 'react';
import { useParams } from 'react-router-dom';

export const SectorStory: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="bg-[#0f111a] border border-indigo-500/10 rounded-xl p-8 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-2 uppercase">Sector Story Engine</h2>
      <p className="text-sm text-indigo-400 font-mono mb-4">
        SECTOR_ID: {id || 'UNKNOWN'}
      </p>
      <p className="text-sm text-gray-400 font-mono">
        Status: Offline. Integrante C is designing the scrollytelling interface.
      </p>
    </div>
  );
};
