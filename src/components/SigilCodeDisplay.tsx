
import React from 'react';
import { Button } from "@/components/ui/button";
import { Copy } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface SigilCodeDisplayProps {
  code: string;
}

const SigilCodeDisplay: React.FC<SigilCodeDisplayProps> = ({ code }) => {
  const { toast } = useToast();

  const copySigilCode = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Shader Code Copied",
      description: "Sigil shader code has been copied to clipboard.",
    });
  };

  return (
    <div className="relative">
      <pre className="text-xs bg-black/5 dark:bg-white/5 p-3 rounded-md max-h-[220px] overflow-auto">
        <code className="font-mono">{code}</code>
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
  );
};

export default SigilCodeDisplay;
