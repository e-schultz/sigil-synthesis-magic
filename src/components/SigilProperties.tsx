
import React from 'react';

interface SigilPropertiesProps {
  energyLevel: number[];
  complexity: number[];
  description?: string;
}

const SigilProperties: React.FC<SigilPropertiesProps> = ({ 
  energyLevel, 
  complexity,
  description
}) => {
  // Calculate some fictional attributes based on the energy level and complexity
  const resonance = Math.round((energyLevel[0] * 0.8 + complexity[0] * 0.2) / 10);
  const stability = Math.round((100 - energyLevel[0]) / 10);
  const potency = Math.round((energyLevel[0] * 0.5 + complexity[0] * 0.5) / 10);
  const alignment = energyLevel[0] > 70 ? 'Chaotic' : energyLevel[0] < 30 ? 'Lawful' : 'Neutral';
  
  return (
    <div className="space-y-3">
      <div className="bg-black/5 dark:bg-white/5 p-3 rounded-md">
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between">
            <span className="text-muted-foreground">Resonance:</span>
            <div className="flex items-center">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 mx-0.5 rounded-full ${
                    i < resonance ? 'bg-primary' : 'bg-primary/20'
                  }`}
                />
              ))}
            </div>
          </li>
          <li className="flex justify-between">
            <span className="text-muted-foreground">Stability:</span>
            <div className="flex items-center">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 mx-0.5 rounded-full ${
                    i < stability ? 'bg-primary' : 'bg-primary/20'
                  }`}
                />
              ))}
            </div>
          </li>
          <li className="flex justify-between">
            <span className="text-muted-foreground">Potency:</span>
            <div className="flex items-center">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 mx-0.5 rounded-full ${
                    i < potency ? 'bg-primary' : 'bg-primary/20'
                  }`}
                />
              ))}
            </div>
          </li>
          <li className="flex justify-between">
            <span className="text-muted-foreground">Alignment:</span>
            <span className="font-medium">{alignment}</span>
          </li>
        </ul>
      </div>

      {description && (
        <div className="italic text-sm text-center p-2">
          "{description}"
        </div>
      )}
    </div>
  );
};

export default SigilProperties;
