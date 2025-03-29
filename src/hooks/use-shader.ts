
import { useState, useEffect } from 'react';
import { getShaderForIntent, getShaderDescription } from '../utils/shaderUtils';

interface UseShaderProps {
  intentText: string;
  energyLevel: number;
  complexity: number;
}

interface UseShaderResult {
  shaderCode: string;
  description: string;
  isLoading: boolean;
}

export const useShader = ({ 
  intentText, 
  energyLevel, 
  complexity 
}: UseShaderProps): UseShaderResult => {
  const [shaderCode, setShaderCode] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (intentText.trim()) {
      // Get shader based on intent
      const shader = getShaderForIntent(intentText);
      setShaderCode(shader);
      
      // Get description for the shader
      const shaderDesc = getShaderDescription(shader);
      setDescription(shaderDesc);
    }
  }, [intentText]);

  // Generate shader based on intent and parameters
  const generateShader = () => {
    setIsLoading(true);
    
    try {
      // Get shader based on intent
      const shader = getShaderForIntent(intentText);
      setShaderCode(shader);
      
      // Get description for the shader
      const shaderDesc = getShaderDescription(shader);
      setDescription(shaderDesc);
    } catch (error) {
      console.error('Error generating shader:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    shaderCode,
    description,
    isLoading
  };
};
