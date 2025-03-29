
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles, Wand2, Layers, Code, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateRandomGLSLCode } from '../utils/sigilUtils';
import SigilDisplay from './SigilDisplay';
import SigilControls from './SigilControls';
import SigilCodeDisplay from './SigilCodeDisplay';
import SigilProperties from './SigilProperties';

const SIGIL_COUNT = 5;

interface SigilSynthesizerProps {
  className?: string;
}

const SigilSynthesizer: React.FC<SigilSynthesizerProps> = ({ className }) => {
  const [activeSigil, setActiveSigil] = useState(1);
  const [intentText, setIntentText] = useState('');
  const [energyLevel, setEnergyLevel] = useState([50]);
  const [complexity, setComplexity] = useState([30]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sigilCode, setSigilCode] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Generate random GLSL code for display
    const randomCode = generateRandomGLSLCode(energyLevel[0], complexity[0]);
    setSigilCode(randomCode);
  }, [activeSigil, energyLevel, complexity]);

  const generateSigil = () => {
    if (!intentText.trim()) {
      toast({
        title: "Intent required",
        description: "Please enter your desired intent for the sigil synthesis.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate sigil generation process
    setTimeout(() => {
      const newSigilIndex = Math.floor(Math.random() * SIGIL_COUNT) + 1;
      setActiveSigil(newSigilIndex);
      setIsGenerating(false);
      
      toast({
        title: "Sigil Synthesized",
        description: "Your intent has been encoded into a new shader sigil.",
      });
    }, 2000);
  };

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Sigil Shader Synthesis</CardTitle>
            <CardDescription>Transform your intent into mystical shader-driven sigils</CardDescription>
          </div>
          <Badge variant="outline" className="bg-black/5 dark:bg-white/5">
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            <span>Fragment Shader v4.3</span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-6">
            <SigilDisplay sigilIndex={activeSigil} isGenerating={isGenerating} />
            <SigilControls 
              energyLevel={energyLevel}
              setEnergyLevel={setEnergyLevel}
              complexity={complexity}
              setComplexity={setComplexity}
              isGenerating={isGenerating}
            />
          </div>
          
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Intent Statement</label>
              <div className="relative">
                <Input
                  placeholder="Enter your intent to encode..."
                  value={intentText}
                  onChange={(e) => setIntentText(e.target.value)}
                  className="pr-10"
                  disabled={isGenerating}
                />
              </div>
            </div>
            
            <Tabs defaultValue="shader">
              <TabsList className="grid grid-cols-2 mb-2">
                <TabsTrigger value="shader">
                  <Code className="h-4 w-4 mr-1" />
                  Shader Code
                </TabsTrigger>
                <TabsTrigger value="properties">
                  <Layers className="h-4 w-4 mr-1" />
                  Properties
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="shader" className="mt-0">
                <SigilCodeDisplay code={sigilCode} />
              </TabsContent>
              
              <TabsContent value="properties" className="mt-0">
                <SigilProperties energyLevel={energyLevel} complexity={complexity} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between flex-wrap gap-2">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => {
            const newIndex = activeSigil % SIGIL_COUNT + 1;
            setActiveSigil(newIndex);
          }}
          disabled={isGenerating}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Cycle Sigil
        </Button>
        
        <Button
          size="lg"
          onClick={generateSigil}
          disabled={isGenerating || !intentText.trim()}
          className="min-w-[140px]"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Synthesizing...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Synthesize
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SigilSynthesizer;
