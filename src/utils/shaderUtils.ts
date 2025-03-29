
import * as THREE from 'three';

// Vertex shader remains the same
export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Default fragment shader for pulsing white circle on black background
export const fragmentShader = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  
  uniform sampler2D u_texture;
  uniform float time;
  uniform vec2 resolution;
  varying vec2 vUv;
  
  void main() {
    // Get texture value (using R channel)
    vec4 tex = texture2D(u_texture, vUv);
    
    // Create pulsing effect
    float pulse = 0.7 + 0.3 * sin(time * 2.0);
    
    // White color with pulsing intensity
    vec3 color = vec3(1.0, 1.0, 1.0) * pulse;
    
    // Final color: white circle on black background
    // Use the texture as a mask for the circle shape
    float alpha = tex.r * pulse;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// Create shader material with the given texture and optional custom shader code
export const createShaderMaterial = (
  sigilTexture: THREE.Texture, 
  containerWidth: number, 
  containerHeight: number,
  customShaderCode?: string
) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      u_texture: { value: sigilTexture },
      time: { value: 0.0 },
      resolution: { value: new THREE.Vector2(containerWidth, containerHeight) }
    },
    vertexShader,
    fragmentShader: customShaderCode || fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false
  });
};
