
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  isDisabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, isDisabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const convertToPNG = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      // Create an image element to load the file
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        // Clean up the object URL
        URL.revokeObjectURL(url);
        
        // Create a canvas to draw the image
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the image on the canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Draw with white background for transparent images
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        // Convert the canvas to a Blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Could not convert image to PNG'));
            return;
          }
          
          // Create a new File from the Blob
          const newFile = new File([blob], `${file.name.split('.')[0]}.png`, {
            type: 'image/png',
            lastModified: Date.now()
          });
          
          resolve(newFile);
        }, 'image/png');
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      try {
        setIsConverting(true);
        
        // Check if the file is already a PNG
        if (file.type === 'image/png') {
          onImageUpload(file);
        } else {
          // Convert to PNG
          toast({
            title: "Converting image",
            description: "Converting your image to PNG format...",
          });
          
          const pngFile = await convertToPNG(file);
          onImageUpload(pngFile);
          
          toast({
            title: "Conversion successful",
            description: "Your image has been converted to PNG format.",
          });
        }
      } catch (error) {
        toast({
          title: "Conversion failed",
          description: "Failed to convert your image. Please try another image.",
          variant: "destructive"
        });
        console.error('Error converting image:', error);
      } finally {
        setIsConverting(false);
        
        // Reset the input so the same file can be selected again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
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
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isDisabled || isConverting}
        />
        <Button 
          variant="outline" 
          onClick={handleButtonClick}
          disabled={isDisabled || isConverting}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isConverting ? 'Converting...' : 'Upload Image'}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Upload any image to use as your custom sigil (will be converted to PNG)
      </p>
    </div>
  );
};

export default ImageUpload;
