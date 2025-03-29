
import * as THREE from 'three';

// Shader code utilities for the Sigil Canvas

// Vertex shader for sigil rendering
export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader for sigil rendering
export const fragmentShader = `
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
`;

// Create shader material with the given texture and uniforms
export const createShaderMaterial = (sigilTexture: THREE.Texture, containerWidth: number, containerHeight: number) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      u_texture: { value: sigilTexture },
      time: { value: 0.0 },
      resolution: { value: new THREE.Vector2(containerWidth, containerHeight) }
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false, // Add this to ensure transparency works
    depthWrite: false // Add this to ensure transparency works properly
  });
};
