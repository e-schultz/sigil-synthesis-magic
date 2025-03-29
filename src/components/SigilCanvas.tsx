
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useMediaQuery } from '../hooks/use-media-query';

interface SigilCanvasProps {
  sigilIndex: number;
  onRendered?: () => void;
}

const SigilCanvas: React.FC<SigilCanvasProps> = ({ sigilIndex, onRendered }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [textureLoaded, setTextureLoaded] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (!canvasRef.current) return;

    // Setup
    const container = canvasRef.current;
    
    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;
    
    // Create renderer with explicit context
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    container.innerHTML = ''; // Clear any previous renderers
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Create a fallback colored quad since we're having issues with the textures
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
    
    // Create plane
    const geometry = new THREE.PlaneGeometry(2, 2);
    const plane = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(plane);
    
    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Update uniforms
      if (shaderMaterial.uniforms) {
        shaderMaterial.uniforms.time.value += 0.01;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Set texture as loaded since we're using procedural method
    setTextureLoaded(true);
    
    if (onRendered) onRendered();
    
    const handleResize = () => {
      if (!canvasRef.current || !renderer) return;
      
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      
      // Update resolution uniform for all meshes
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          const material = object.material as THREE.ShaderMaterial;
          if (material.uniforms && material.uniforms.resolution) {
            material.uniforms.resolution.value.set(width, height);
          }
        }
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      
      // Cleanup properly
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      // Dispose of all scene resources
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          
          const material = object.material as THREE.Material;
          if (Array.isArray(material)) {
            material.forEach(m => m.dispose());
          } else {
            material.dispose();
          }
        }
      });
    };
  }, [sigilIndex, onRendered]);
  
  return (
    <div 
      ref={canvasRef} 
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
