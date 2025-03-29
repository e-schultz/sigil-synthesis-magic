
import React from 'react';

interface SigilPropertiesProps {
  energyLevel: number[];
  complexity: number[];
}

const SigilProperties: React.FC<SigilPropertiesProps> = ({ energyLevel, complexity }) => {
  return (
    <div className="bg-black/5 dark:bg-white/5 p-3 rounded-md h-[220px] overflow-auto">
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Type:</span>
          <span className="font-medium">Fragment Shader</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Resonance:</span>
          <span className="font-medium">{energyLevel[0] > 70 ? 'High' : energyLevel[0] > 40 ? 'Medium' : 'Low'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Harmony:</span>
          <span className="font-medium">{complexity[0] > 60 ? 'Complex' : 'Simple'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Compatibility:</span>
          <span className="font-medium">WebGL, Three.js, p5.js</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Memory Echo:</span>
          <span className="font-medium">Enabled</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Distortion:</span>
          <span className="font-medium">Shape-Aware</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Generated:</span>
          <span className="font-medium">{new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default SigilProperties;
