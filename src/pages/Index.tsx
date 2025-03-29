
import React from 'react';
import SigilSynthesizer from '@/components/SigilSynthesizer';
import { useMediaQuery } from '@/hooks/use-media-query';

const Index = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container px-4 py-6 md:py-8 mx-auto">
        <header className="text-center mb-6 md:mb-8">
          <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600`}>
            Sigil Synthesis Magic
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            Transform your intent into powerful mystical sigils powered by fragment shaders.
            Create, animate, and export your magical symbols.
          </p>
        </header>
        
        <main>
          <SigilSynthesizer />
          
          <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-2">Fragment Shaders</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                The sigil shader manipulates pixels at the fragment level, 
                creating fluid, animated effects that respond to your intent.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-2">WebGL Integration</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Export your sigil as a WebGL shader for use in your 
                projects, with full animation and distortion properties.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-2">Living Glyphs</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Each sigil is a living entity that pulses with the energy 
                of your intent, creating dynamic memory echo fields.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
