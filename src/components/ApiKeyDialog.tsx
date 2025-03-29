
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveKey: (key: string) => void;
  onClearKey: () => void;
  hasExistingKey: boolean;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({
  open,
  onOpenChange,
  onSaveKey,
  onClearKey,
  hasExistingKey
}) => {
  const [apiKey, setApiKey] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter OpenAI API Key</DialogTitle>
          <DialogDescription>
            Your API key is stored locally in your browser and is never sent to our servers.
            You'll need a key with access to GPT-4 models.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">API Key</label>
            <Input
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from{" "}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline"
              >
                OpenAI's platform
              </a>
            </p>
          </div>
        </div>
        <DialogFooter className="flex space-x-2 justify-end">
          {hasExistingKey && (
            <Button variant="outline" onClick={onClearKey}>
              Remove Key
            </Button>
          )}
          <Button onClick={() => onSaveKey(apiKey)}>Save API Key</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;
