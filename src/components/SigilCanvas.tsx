import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useMediaQuery } from '../hooks/use-media-query';
import { createShaderMaterial } from '../utils/shaderUtils';

interface SigilCanvasProps {
  sigilIndex: number;
  onRendered?: () => void;
  customImage: File | null;
  shaderCode?: string;
}

const SigilCanvas: React.FC<SigilCanvasProps> = ({ sigilIndex, onRendered, customImage, shaderCode }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (!canvasRef.current) return;

    // Clean up any previous renderer
    if (rendererRef.current && canvasRef.current.contains(rendererRef.current.domElement)) {
      canvasRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
    }

    // Setup
    const container = canvasRef.current;
    
    // Create scene with black background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Set black background
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;
    
    // Create renderer with correct alpha settings
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      premultipliedAlpha: false // Ensure correct alpha blending
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Create a fallback texture if loading fails
    const createFallbackTexture = () => {
      const size = 512;
      const data = new Uint8Array(size * size * 4);
      
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const index = (i * size + j) * 4;
          
          // Calculate distance from center (normalized 0-1)
          const x = i / size - 0.5;
          const y = j / size - 0.5;
          const dist = Math.sqrt(x * x + y * y) * 2; // *2 to normalize to 0-1 range
          
          // Create a circular gradient (1 at center, 0 at edges)
          const value = Math.max(0, 1 - dist);
          
          // RGBA: Use the value for red channel (which our shader uses)
          data[index] = value * 255;     // R
          data[index + 1] = value * 255; // G
          data[index + 2] = value * 255; // B
          data[index + 3] = value * 255; // A
        }
      }
      
      const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
      texture.needsUpdate = true;
      return texture;
    };

    let texture: THREE.Texture;
    
    // Handle custom image if it exists
    if (customImage) {
      const loadCustomImage = async () => {
        const imageUrl = URL.createObjectURL(customImage);
        
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
          imageUrl,
          // On successful load
          (loadedTexture) => {
            URL.revokeObjectURL(imageUrl); // Clean up the URL object
            
            // Create shader material with the loaded texture
            const shaderMaterial = createShaderMaterial(
              loadedTexture, 
              container.clientWidth, 
              container.clientHeight,
              shaderCode
            );
            
            materialRef.current = shaderMaterial;
            
            // Create plane
            const geometry = new THREE.PlaneGeometry(2, 2);
            const plane = new THREE.Mesh(geometry, shaderMaterial);
            scene.add(plane);
            
            // Animation loop
            const animate = () => {
              animationIdRef.current = requestAnimationFrame(animate);
              
              // Update time uniform for pulsing effect
              if (shaderMaterial.uniforms && shaderMaterial.uniforms.time) {
                shaderMaterial.uniforms.time.value += 0.01;
              }
              
              renderer.render(scene, camera);
            };
            
            animate();
            
            // Notify parent component that rendering is complete
            if (onRendered) onRendered();
          },
          // On progress
          undefined,
          // On error
          (error) => {
            console.error('Error loading custom image:', error);
            // Use fallback texture instead
            const fallbackTexture = createFallbackTexture();
            
            // Create shader material using the utility function
            const shaderMaterial = createShaderMaterial(
              fallbackTexture, 
              container.clientWidth, 
              container.clientHeight,
              shaderCode
            );
            
            materialRef.current = shaderMaterial;
            
            // Create plane
            const geometry = new THREE.PlaneGeometry(2, 2);
            const plane = new THREE.Mesh(geometry, shaderMaterial);
            scene.add(plane);
            
            // Animation loop
            const animate = () => {
              animationIdRef.current = requestAnimationFrame(animate);
              
              // Update time uniform for pulsing effect
              if (shaderMaterial.uniforms && shaderMaterial.uniforms.time) {
                shaderMaterial.uniforms.time.value += 0.01;
              }
              
              renderer.render(scene, camera);
            };
            
            animate();
            
            // Notify parent component that rendering is complete
            if (onRendered) onRendered();
          }
        );
      };
      
      loadCustomImage();
    } else {
      // Use fallback texture for standard sigils
      texture = createFallbackTexture();
          
      // Create shader material using the utility function with custom shader code if provided
      const shaderMaterial = createShaderMaterial(
        texture, 
        container.clientWidth, 
        container.clientHeight,
        shaderCode
      );
      
      materialRef.current = shaderMaterial;
      
      // Create plane
      const geometry = new THREE.PlaneGeometry(2, 2);
      const plane = new THREE.Mesh(geometry, shaderMaterial);
      scene.add(plane);
      
      // Animation loop
      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate);
        
        // Update time uniform for pulsing effect
        if (shaderMaterial.uniforms && shaderMaterial.uniforms.time) {
          shaderMaterial.uniforms.time.value += 0.01;
        }
        
        renderer.render(scene, camera);
      };
      
      animate();
      
      // Notify parent component that rendering is complete
      if (onRendered) onRendered();
    }
    
    const handleResize = () => {
      if (!canvasRef.current || !renderer) return;
      
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      
      if (rendererRef.current) {
        if (container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      
      // Clean up scene objects
      if (sceneRef.current) {
        sceneRef.current.clear();
        sceneRef.current = null;
      }
      
      materialRef.current = null;
    };
  }, [sigilIndex, onRendered, customImage, shaderCode]);
  
  return (
    <div 
      ref={canvasRef} 
      className="w-full h-full min-h-[300px] rounded-lg overflow-hidden"
      style={{ position: 'relative' }}
    />
  );
};

export default SigilCanvas;
