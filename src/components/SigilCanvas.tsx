
import React, { useRef, useEffect } from 'react';
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
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Load sigil texture
    const textureLoader = new THREE.TextureLoader();
    const sigilTexture = textureLoader.load(`/sigils/sigil-${sigilIndex}.png`, () => {
      if (onRendered) onRendered();
    });
    
    // Create shader material
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_texture: { value: sigilTexture },
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
          float alpha = tex.r * pulse;
          
          gl_FragColor = vec4(color * tex.r, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
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
    
    const handleResize = () => {
      if (!canvasRef.current || !renderer) return;
      
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      
      if (shaderMaterial.uniforms) {
        shaderMaterial.uniforms.resolution.value.set(width, height);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      
      if (rendererRef.current) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [sigilIndex, onRendered]);
  
  return (
    <div 
      ref={canvasRef} 
      className="w-full h-full min-h-[300px] rounded-lg overflow-hidden"
    />
  );
};

export default SigilCanvas;
