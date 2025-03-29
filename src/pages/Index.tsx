
import React from 'react';
import SigilSynthesizer from '@/components/SigilSynthesizer';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Sparkles, Wand2, Code } from 'lucide-react';

const Index = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container px-4 py-6 md:py-8 mx-auto">
        <header className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <Sparkles className="h-10 w-10 md:h-12 md:w-12 text-purple-500 animate-pulse" />
              <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full transform scale-150"></div>
            </div>
          </div>
          
          <h1 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500`}>
            Sigil Synthesis Magic
          </h1>
          
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            Transform your intent into powerful mystical sigils powered by fragment shaders.
            Create, animate, and export your magical symbols.
          </p>
        </header>
        
        <main>
          <SigilSynthesizer />
          
          <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-lg shadow-sm transition-all hover:shadow-md hover:translate-y-[-2px] duration-300">
              <div className="mb-3 flex justify-center">
                <Code className="h-7 w-7 text-purple-500" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-center">Fragment Shaders</h3>
              <p className="text-xs md:text-sm text-muted-foreground text-center">
                The sigil shader manipulates pixels at the fragment level, 
                creating fluid, animated effects that respond to your intent.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-lg shadow-sm transition-all hover:shadow-md hover:translate-y-[-2px] duration-300">
              <div className="mb-3 flex justify-center">
                <Wand2 className="h-7 w-7 text-indigo-500" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-center">WebGL Integration</h3>
              <p className="text-xs md:text-sm text-muted-foreground text-center">
                Export your sigil as a WebGL shader for use in your 
                projects, with full animation and distortion properties.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-lg shadow-sm transition-all hover:shadow-md hover:translate-y-[-2px] duration-300">
              <div className="mb-3 flex justify-center">
                <Sparkles className="h-7 w-7 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-center">Living Glyphs</h3>
              <p className="text-xs md:text-sm text-muted-foreground text-center">
                Each sigil is a living entity that pulses with the energy 
                of your intent, creating dynamic memory echo fields.
              </p>
            </div>
          </div>
          
          <footer className="mt-14 text-center text-xs text-muted-foreground">
            <p>Sigil Shader Synthesis © {new Date().getFullYear()}</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Index;
