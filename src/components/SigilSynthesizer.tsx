
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import SigilCanvas from './SigilCanvas';
import { Sparkles, Wand2, Download, Copy, Layers, Code, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [isRendered, setIsRendered] = useState(false);
  const [sigilCode, setSigilCode] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setIsRendered(false);
    
    // Generate random GLSL code for display
    const randomCode = generateRandomGLSLCode();
    setSigilCode(randomCode);
  }, [activeSigil]);

  const handleSigilRender = () => {
    setIsRendered(true);
  };

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

  const copySigilCode = () => {
    navigator.clipboard.writeText(sigilCode);
    toast({
      title: "Shader Code Copied",
      description: "Sigil shader code has been copied to clipboard.",
    });
  };

  const generateRandomGLSLCode = () => {
    return `#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_texture;   // Sigil image
uniform float time;
uniform vec2 resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  
  // Distortion based on intent energy (${energyLevel[0]})
  uv.x += sin(uv.y * ${(complexity[0] / 10).toFixed(1)} + time) * 0.01;
  
  // Sigil texture lookup
  vec4 tex = texture2D(u_texture, uv);
  
  // Pulse effect with complexity factor ${(complexity[0] / 20).toFixed(1)}
  float pulse = 0.5 + 0.5 * sin(time * ${(energyLevel[0] / 20).toFixed(1)});
  
  // Alpha modulation
  float alpha = tex.r * pulse;
  
  gl_FragColor = vec4(vec3(tex.r), alpha);
}`;
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
            <div className="h-[300px] bg-black/10 dark:bg-white/5 rounded-lg overflow-hidden relative">
              {isGenerating ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <RefreshCw className="h-8 w-8 animate-spin mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Synthesizing Sigil...</p>
                  </div>
                </div>
              ) : (
                <SigilCanvas sigilIndex={activeSigil} onRendered={handleSigilRender} />
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
                <div className="relative">
                  <pre className="text-xs bg-black/5 dark:bg-white/5 p-3 rounded-md max-h-[220px] overflow-auto">
                    <code className="font-mono">{sigilCode}</code>
                  </pre>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="absolute top-2 right-2" 
                    onClick={copySigilCode}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="properties" className="mt-0">
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
