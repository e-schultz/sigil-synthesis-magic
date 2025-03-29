
import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ApiLogsDisplayProps {
  logs: string[];
  onHideLogs: () => void;
}

const ApiLogsDisplay: React.FC<ApiLogsDisplayProps> = ({ logs, onHideLogs }) => {
  if (logs.length === 0) return null;
  
  return (
    <div className="mb-6 overflow-auto">
      <Alert>
        <AlertTitle className="flex items-center justify-between">
          <span>API Request Logs</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onHideLogs}
            className="h-6 px-2"
          >
            Hide
          </Button>
        </AlertTitle>
        <AlertDescription>
          <div className="mt-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-md text-xs font-mono overflow-x-auto max-h-40">
            {logs.map((log, index) => (
              <div key={index} className="pb-1">{log}</div>
            ))}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ApiLogsDisplay;
