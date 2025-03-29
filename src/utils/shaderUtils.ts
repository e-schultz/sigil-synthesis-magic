import * as THREE from 'three';

// Vertex shader remains the same
export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Updated fragment shader for static color rendering
export const fragmentShader = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  
  uniform sampler2D u_texture;
  varying vec2 vUv;
  
  void main() {
    // Texture lookup from sigil
    vec4 tex = texture2D(u_texture, vUv);
    
    // Static purple color matching the UI
    vec3 staticColor = vec3(0.5569, 0.4902, 0.8196); // Approximate purple from the image
    
    // Use sigil texture's alpha/brightness to modulate opacity
    float alpha = tex.r;
    
    gl_FragColor = vec4(staticColor, alpha);
  }
`;

// Create shader material with the given texture
export const createShaderMaterial = (sigilTexture: THREE.Texture, containerWidth: number, containerHeight: number) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      u_texture: { value: sigilTexture },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.NormalBlending,
    depthTest: false,
    depthWrite: false
  });
};
