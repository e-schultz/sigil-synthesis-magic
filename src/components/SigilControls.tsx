
import React from 'react';
import { Slider } from "@/components/ui/slider";

interface SigilControlsProps {
  energyLevel: number[];
  setEnergyLevel: (value: number[]) => void;
  complexity: number[];
  setComplexity: (value: number[]) => void;
  isGenerating: boolean;
}

const SigilControls: React.FC<SigilControlsProps> = ({
  energyLevel,
  setEnergyLevel,
  complexity,
  setComplexity,
  isGenerating
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Energy Intensity</label>
        <span className="text-xs text-muted-foreground">{energyLevel[0]}%</span>
      </div>
      <Slider
        value={energyLevel}
        min={10}
        max={100}
        step={1}
        onValueChange={setEnergyLevel}
        disabled={isGenerating}
      />
      
      <div className="flex items-center justify-between pt-2">
        <label className="text-sm font-medium">Sigil Complexity</label>
        <span className="text-xs text-muted-foreground">{complexity[0]}%</span>
      </div>
      <Slider
        value={complexity}
        min={10}
        max={100}
        step={1}
        onValueChange={setComplexity}
        disabled={isGenerating}
      />
    </div>
  );
};

export default SigilControls;
