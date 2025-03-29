
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useMediaQuery } from '../hooks/use-media-query';

interface SigilCanvasProps {
  sigilIndex: number;
  onRendered?: () => void;
}

const SigilCanvas: React.FC<SigilCanvasProps> = ({ sigilIndex, onRendered }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [textureLoaded, setTextureLoaded] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Important cleanup function to be used in multiple places
  const cleanupResources = () => {
    // Cancel any ongoing animation frame
    if (animationIdRef.current !== null) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
    
    // Dispose of the renderer properly
    if (rendererRef.current) {
      const renderer = rendererRef.current;
      renderer.dispose();
      rendererRef.current = null;
      
      // Remove any lingering DOM elements from the container *safely*
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    }
    
    // Clean up the scene resources
    if (sceneRef.current) {
      const scene = sceneRef.current;
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          
          const material = object.material as THREE.Material | THREE.Material[];
          if (Array.isArray(material)) {
            material.forEach(m => m.dispose());
          } else {
            material.dispose();
          }
        }
      });
      
      // Clear the scene
      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
    }
  };

  useEffect(() => {
    // Always clean up previous resources when sigilIndex changes
    cleanupResources();
    
    if (!containerRef.current) return;
    
    // Initial setup
    const container = containerRef.current;
    setTextureLoaded(false);
    
    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Create camera - use orthographic for 2D sigil rendering
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;
    
    // Create renderer with explicit context
    try {
      const renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true,
        powerPreference: 'high-performance'
      });
      
      // Configure renderer
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      // Manually attach the renderer to the DOM
      // First, ensure we're not creating nested canvas elements
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;
      
      // Create a shader-based sigil using the fragment shader
      const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0.0 },
          resolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          #ifdef GL_ES
          precision mediump float;
          #endif
          
          uniform float time;
          uniform vec2 resolution;
          varying vec2 vUv;
          
          void main() {
            vec2 uv = vUv;
            
            // Distortion based on intent energy
            uv.x += sin(uv.y * 5.3 + time) * 0.01;
            
            // Create a procedural sigil-like pattern
            float circle = length(uv - 0.5) * 2.0;
            float ring = smoothstep(0.5, 0.48, circle) * smoothstep(circle, 0.52, 0.5);
            
            // Create some lines
            float lines = 0.0;
            lines += smoothstep(0.02, 0.0, abs(uv.x - 0.5));
            lines += smoothstep(0.02, 0.0, abs(uv.y - 0.5));
            lines += smoothstep(0.02, 0.0, abs(uv.x - uv.y));
            lines += smoothstep(0.02, 0.0, abs(uv.x - (1.0 - uv.y)));
            
            // Pulse effect with complexity factor
            float pulse = 0.5 + 0.5 * sin(time * 2.0);
            
            // Create final sigil shape
            float sigil = ring + lines * 0.5;
            
            // Apply color based on sigilIndex
            vec3 color;
            if (${sigilIndex} == 1) {
              color = vec3(0.7, 0.3, 0.9); // Purple
            } else if (${sigilIndex} == 2) {
              color = vec3(0.3, 0.7, 0.9); // Blue
            } else if (${sigilIndex} == 3) {
              color = vec3(0.9, 0.3, 0.7); // Pink
            } else if (${sigilIndex} == 4) {
              color = vec3(0.3, 0.9, 0.7); // Teal
            } else {
              color = vec3(0.9, 0.7, 0.3); // Gold
            }
            
            // Alpha modulation
            float alpha = sigil * pulse;
            
            gl_FragColor = vec4(color * sigil, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false
      });
      
      // Create plane geometry
      const geometry = new THREE.PlaneGeometry(2, 2);
      const plane = new THREE.Mesh(geometry, shaderMaterial);
      scene.add(plane);
      
      // Animation loop - store the animationId for cleanup
      const animate = () => {
        // Safe check in case component unmounted during frame
        if (!rendererRef.current || !containerRef.current) return;
        
        animationIdRef.current = requestAnimationFrame(animate);
        
        // Update uniforms
        if (shaderMaterial.uniforms) {
          shaderMaterial.uniforms.time.value += 0.01;
        }
        
        renderer.render(scene, camera);
      };
      
      animate();
      
      // Texture loaded - procedural shader is ready immediately
      setTextureLoaded(true);
      if (onRendered) onRendered();
      
      // Handle resize event
      const handleResize = () => {
        if (!containerRef.current || !rendererRef.current) return;
        
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        camera.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
        
        // Update resolution uniform
        if (shaderMaterial.uniforms && shaderMaterial.uniforms.resolution) {
          shaderMaterial.uniforms.resolution.value.set(width, height);
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // Return cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        cleanupResources();
      };
    } catch (error) {
      console.error("Error initializing WebGL context:", error);
      setTextureLoaded(false);
      return; // Early return if renderer creation fails
    }
  }, [sigilIndex, onRendered]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[300px] rounded-lg overflow-hidden bg-black/5 dark:bg-white/5 relative"
    >
      {!textureLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <p>Loading sigil...</p>
        </div>
      )}
    </div>
  );
};

export default SigilCanvas;
