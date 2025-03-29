
import * as THREE from 'three';

// Vertex shader remains the same
export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Updated fragment shader for pulsing white circle on black background
export const fragmentShader = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  
  uniform sampler2D u_texture;
  uniform float time;
  varying vec2 vUv;
  
  void main() {
    // Center the coordinates
    vec2 centeredUv = vUv - 0.5;
    
    // Calculate distance from center (for circle shape)
    float dist = length(centeredUv);
    
    // Create a circle mask based on the texture
    vec4 tex = texture2D(u_texture, vUv);
    float circleMask = tex.r;
    
    // Create pulsing effect
    float pulse = 0.7 + 0.3 * sin(time * 2.0);
    
    // White color with pulsing intensity
    vec3 color = vec3(1.0, 1.0, 1.0) * pulse;
    
    // Final color: white circle on black background
    // Use the sigil texture as a mask for the circle shape
    float alpha = circleMask * pulse;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// Create shader material with the given texture
export const createShaderMaterial = (sigilTexture: THREE.Texture, containerWidth: number, containerHeight: number) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      u_texture: { value: sigilTexture },
      time: { value: 0.0 }
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false
  });
};
