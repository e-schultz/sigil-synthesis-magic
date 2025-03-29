
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from 'lucide-react';
import SigilCanvas from './SigilCanvas';

interface SigilDisplayProps {
  sigilIndex: number;
  isGenerating: boolean;
}

const SigilDisplay: React.FC<SigilDisplayProps> = ({ sigilIndex, isGenerating }) => {
  const [isRendered, setIsRendered] = useState(false);

  const handleSigilRender = () => {
    setIsRendered(true);
  };

  return (
    <div className="h-[300px] bg-black/10 dark:bg-white/5 rounded-lg overflow-hidden relative">
      {isGenerating ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <RefreshCw className="h-8 w-8 animate-spin mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Synthesizing Sigil...</p>
          </div>
        </div>
      ) : (
        <SigilCanvas sigilIndex={sigilIndex} onRendered={handleSigilRender} />
      )}
      
      {!isGenerating && isRendered && (
        <div className="absolute bottom-3 right-3 flex space-x-2">
          <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
            <Download className="h-4 w-4 mr-1" />
            <span>Export</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default SigilDisplay;
