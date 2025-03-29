
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  isDisabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, isDisabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check if the file is a PNG
      if (file.type !== 'image/png') {
        alert('Please upload a PNG image file.');
        return;
      }
      
      onImageUpload(file);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor="sigilUpload">Custom Sigil Image</Label>
      <div className="flex space-x-2">
        <Input
          ref={fileInputRef}
          id="sigilUpload"
          type="file"
          accept="image/png"
          onChange={handleFileChange}
          className="hidden"
          disabled={isDisabled}
        />
        <Button 
          variant="outline" 
          onClick={handleButtonClick}
          disabled={isDisabled}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload PNG
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Upload a PNG image to use as your custom sigil
      </p>
    </div>
  );
};

export default ImageUpload;
