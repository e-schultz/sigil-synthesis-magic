
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles, Wand2, Layers, Code, RefreshCw, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  isApiKeyConfigured, 
  saveApiKey, 
  clearApiKey,
  generateIntentBasedShader,
  generateShaderDescription
} from '../utils/sigilUtils';
import { modifyShaderWithOpenAI } from '../utils/openaiUtils';
import { getShaderForIntent } from '../utils/shaderUtils';
import SigilDisplay from './SigilDisplay';
import SigilControls from './SigilControls';
import SigilCodeDisplay from './SigilCodeDisplay';
import SigilProperties from './SigilProperties';
import ImageUpload from './ImageUpload';
import ApiKeyDialog from './ApiKeyDialog';
import ApiLogsDisplay from './ApiLogsDisplay';
import { ToastAction } from "@/components/ui/toast";

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
  const [customImage, setCustomImage] = useState<File | null>(null);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [sigilDescription, setSigilDescription] = useState('A mystical sigil with pulsing energy');
  const [apiLogs, setApiLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setUseAI(true);
    }

    const initialCode = generateIntentBasedShader('', energyLevel[0], complexity[0]);
    setSigilCode(initialCode);
  }, []);

  useEffect(() => {
    if (!isGenerating && !useAI) {
      const newCode = generateIntentBasedShader('', energyLevel[0], complexity[0]);
      setSigilCode(newCode);
    }
  }, [energyLevel, complexity, activeSigil]);

  const saveOpenAIKey = (key: string) => {
    if (saveApiKey(key)) {
      setUseAI(true);
      setApiKeyDialogOpen(false);
    }
  };

  const clearOpenAIKey = () => {
    clearApiKey();
    setUseAI(false);
  };

  const addLogEntry = (entry: string) => {
    setApiLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] ${entry}`]);
  };

  const generateSigil = async () => {
    if (!intentText.trim()) {
      toast({
        title: "Intent required",
        description: "Please enter your desired intent for the sigil synthesis.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setApiLogs([]);
    
    try {
      if (useAI && localStorage.getItem('openai_api_key')) {
        const baseShader = generateIntentBasedShader(intentText, energyLevel[0], complexity[0]);
        
        addLogEntry(`Starting AI shader generation with intent: "${intentText}"`);
        
        const result = await modifyShaderWithOpenAI(
          intentText,
          baseShader,
          energyLevel[0],
          complexity[0],
          (toastProps) => {
            toast(toastProps);
            addLogEntry(toastProps.title + ': ' + toastProps.description);
          }
        );
        
        addLogEntry(`Shader generation complete. Description: "${result.description}"`);
        setSigilCode(result.code);
        setSigilDescription(result.description);
      } else {
        // Use intent-based shader generation
        addLogEntry("Using intent-based shader generation (no OpenAI)");
        
        // Use the enhanced shader utility
        const newShaderCode = getShaderForIntent(intentText);
        addLogEntry("Intent-based shader generated");
        setSigilCode(newShaderCode);
        
        // Generate a basic description based on intent
        const newDescription = generateShaderDescription(intentText);
        setSigilDescription(newDescription);

        const newSigilIndex = Math.floor(Math.random() * SIGIL_COUNT) + 1;
        setActiveSigil(newSigilIndex);
        
        toast({
          title: "Sigil Synthesized",
          description: "Your intent has been encoded into a new shader sigil.",
        });
      }
      
      setShowLogs(true);
    } catch (error) {
      console.error("Error generating sigil:", error);
      addLogEntry(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      setShowLogs(true);
      
      toast({
        title: "Synthesis Failed",
        description: error instanceof Error ? error.message : "Failed to synthesize sigil with OpenAI.",
        variant: "destructive",
        action: (
          <ToastAction 
            altText="Reset API Key" 
            onClick={() => {
              clearApiKey();
              setApiKeyDialogOpen(true);
            }}
          >
            Reset API Key
          </ToastAction>
        )
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (file: File) => {
    setCustomImage(file);
    setActiveSigil(0);
    
    toast({
      title: "Custom Sigil Uploaded",
      description: "Your custom sigil image has been applied.",
    });
  };

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Sigil Shader Synthesis</CardTitle>
            <CardDescription>Transform your intent into mystical shader-driven sigils</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {useAI ? (
              <Badge 
                variant="outline" 
                className="bg-green-100 dark:bg-green-900/20 border-green-400 dark:border-green-700 cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/40"
                onClick={() => setApiKeyDialogOpen(true)}
              >
                <Sparkles className="h-3.5 w-3.5 mr-1 text-green-600 dark:text-green-400" />
                <span>AI Enabled</span>
              </Badge>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setApiKeyDialogOpen(true)}
                className="h-8"
              >
                <Key className="h-3.5 w-3.5 mr-1" />
                Set OpenAI Key
              </Button>
            )}
            <Badge 
              variant="outline" 
              className={cn(
                "bg-black/5 dark:bg-white/5 cursor-pointer",
                showLogs && "bg-blue-100 dark:bg-blue-900/20 border-blue-400 dark:border-blue-700"
              )}
              onClick={() => setShowLogs(!showLogs)}
            >
              <Code className="h-3.5 w-3.5 mr-1" />
              <span>API Logs</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {showLogs && <ApiLogsDisplay logs={apiLogs} onHideLogs={() => setShowLogs(false)} />}
        
        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-6">
            <SigilDisplay 
              sigilIndex={activeSigil} 
              isGenerating={isGenerating} 
              customImage={customImage}
              shaderCode={sigilCode}
            />
            <SigilControls 
              energyLevel={energyLevel}
              setEnergyLevel={setEnergyLevel}
              complexity={complexity}
              setComplexity={setComplexity}
              isGenerating={isGenerating}
            />
            {sigilDescription && (
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-md text-center italic text-sm">
                "{sigilDescription}"
              </div>
            )}
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
            
            <ImageUpload 
              onImageUpload={handleImageUpload} 
              isDisabled={isGenerating}
            />
            
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
                <SigilProperties 
                  energyLevel={energyLevel} 
                  complexity={complexity} 
                  description={sigilDescription}
                  apiConfigured={isApiKeyConfigured()}
                />
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
            setCustomImage(null);
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

      <ApiKeyDialog 
        open={apiKeyDialogOpen} 
        onOpenChange={setApiKeyDialogOpen}
        onSaveKey={saveOpenAIKey}
        onClearKey={clearOpenAIKey}
        hasExistingKey={!!localStorage.getItem('openai_api_key')}
      />
    </Card>
  );
};

export default SigilSynthesizer;
