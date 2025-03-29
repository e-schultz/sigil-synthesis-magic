
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useMediaQuery } from '../hooks/use-media-query';
import { createShaderMaterial } from '../utils/shaderUtils';

interface SigilCanvasProps {
  sigilIndex: number;
  onRendered?: () => void;
}

const SigilCanvas: React.FC<SigilCanvasProps> = ({ sigilIndex, onRendered }) => {
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
    
    // Create scene
    const scene = new THREE.Scene();
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
    
    // Load sigil texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous'; // Ensure cross-origin loading works
    
    const onTextureLoaded = (texture: THREE.Texture) => {
      texture.flipY = false; // Try with and without this depending on your texture
      
      // Create shader material using the utility function
      const shaderMaterial = createShaderMaterial(
        texture, 
        container.clientWidth, 
        container.clientHeight
      );
      
      materialRef.current = shaderMaterial;
      
      // Create plane
      const geometry = new THREE.PlaneGeometry(2, 2);
      const plane = new THREE.Mesh(geometry, shaderMaterial);
      scene.add(plane);
      
      // Animation loop
      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate);
        
        // Update uniforms
        if (shaderMaterial.uniforms) {
          shaderMaterial.uniforms.time.value += 0.01;
        }
        
        renderer.render(scene, camera);
      };
      
      animate();
      
      // Notify parent component that rendering is complete
      if (onRendered) onRendered();
    };
    
    // Handle texture loading errors
    const onTextureError = (error: ErrorEvent) => {
      console.error(`Error loading sigil texture: ${error.message}`);
      // Fallback to a simple material if texture fails
      const fallbackMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x7766cc,
        transparent: true,
        opacity: 0.7
      });
      
      const geometry = new THREE.PlaneGeometry(2, 2);
      const plane = new THREE.Mesh(geometry, fallbackMaterial);
      scene.add(plane);
      
      renderer.render(scene, camera);
      
      if (onRendered) onRendered();
    };
    
    // Load texture with proper error handling
    textureLoader.load(
      `/sigils/sigil-${sigilIndex}.png`, 
      onTextureLoaded, 
      undefined, // onProgress callback is not needed
      onTextureError
    );
    
    const handleResize = () => {
      if (!canvasRef.current || !renderer) return;
      
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      
      if (materialRef.current && materialRef.current.uniforms) {
        materialRef.current.uniforms.resolution.value.set(width, height);
      }
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
  }, [sigilIndex, onRendered]);
  
  return (
    <div 
      ref={canvasRef} 
      className="w-full h-full min-h-[300px] rounded-lg overflow-hidden"
      style={{ position: 'relative' }}
    />
  );
};

export default SigilCanvas;
