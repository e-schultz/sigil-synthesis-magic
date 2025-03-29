
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
    
    // Load sigil texture with proper error handling
    const textureLoader = new THREE.TextureLoader();
    const sigilPath = `/sigils/sigil-${sigilIndex}.png`;
    console.log(`Loading sigil texture from: ${sigilPath}`);
    
    textureLoader.load(
      sigilPath,
      (texture) => {
        console.log(`Sigil texture ${sigilIndex} loaded successfully`);
        // Make sure texture is properly set up
        texture.flipY = false; // may need to be true depending on your images
        texture.needsUpdate = true;
        setTextureLoaded(true);
        
        // Create shader material
        const shaderMaterial = new THREE.ShaderMaterial({
          uniforms: {
            u_texture: { value: texture },
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
            precision highp float;
            #endif
            
            uniform sampler2D u_texture;
            uniform float time;
            uniform vec2 resolution;
            varying vec2 vUv;
            
            void main() {
              // Distort UVs slightly based on time
              vec2 uv = vUv;
              uv.x += sin(uv.y * 10.0 + time * 0.5) * 0.01;
              uv.y += cos(uv.x * 10.0 + time * 0.5) * 0.01;
              
              // Texture lookup from sigil
              vec4 tex = texture2D(u_texture, uv);
              
              // Pulse effect based on time
              float pulse = 0.5 + 0.5 * sin(time * 2.0 + uv.y * 10.0);
              
              // Glow effect
              float glow = 0.8 + 0.2 * sin(time * 3.0);
              
              // Create color based on position and time
              vec3 color = vec3(0.3, 0.4, 0.9) * glow;
              color += vec3(0.7, 0.3, 0.9) * (1.0 - glow);
              
              // Use sigil brightness to drive alpha and color
              float alpha = max(tex.r, max(tex.g, tex.b)) * pulse;
              
              gl_FragColor = vec4(color * alpha, alpha);
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
        
        if (onRendered) onRendered();
        
        return () => {
          cancelAnimationFrame(animationId);
        };
      },
      // Progress callback
      (xhr) => {
        console.log(`${sigilIndex} ${(xhr.loaded / xhr.total * 100)}% loaded`);
      },
      // Error callback
      (error) => {
        console.error(`Error loading sigil texture ${sigilIndex}:`, error);
        // Provide a fallback (a colored quad)
        const fallbackMaterial = new THREE.MeshBasicMaterial({ 
          color: 0x8844aa,
          transparent: true,
          opacity: 0.7 
        });
        
        const geometry = new THREE.PlaneGeometry(2, 2);
        const plane = new THREE.Mesh(geometry, fallbackMaterial);
        scene.add(plane);
        
        renderer.render(scene, camera);
        if (onRendered) onRendered();
      }
    );
    
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
