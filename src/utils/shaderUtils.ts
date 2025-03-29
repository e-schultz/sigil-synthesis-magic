
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

// Blue and yellow pulsing shader
export const blueYellowPulseShader = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  
  uniform sampler2D u_texture;   // Sigil image
  uniform float time;
  uniform vec2 resolution;
  varying vec2 vUv;
  
  void main() {
    vec2 uv = vUv;
    
    // Distortion based on intent energy (50)
    uv.x += sin(uv.y * 60.0 + time * 2.0) * 0.04;
    uv.y += cos(uv.x * 50.0 + time * 2.0) * 0.04;
    
    // Sigil texture lookup
    vec4 tex = texture2D(u_texture, uv);
    
    // Pulse effect with complexity factor
    float pulse = 0.5 + 0.5 * sin(time * 15.0);
    
    // Intent colors: blue and yellow
    vec3 blue = vec3(0.0, 0.0, 1.0);
    vec3 yellow = vec3(1.0, 1.0, 0.0);
    
    // Blend factor oscillates across UV space and time
    float blendFactor = 0.5 + 0.5 * sin(uv.x * 10.0 + uv.y * 12.0 + time * 2.0);
    vec3 intentColor = mix(blue, yellow, blendFactor);
    
    // Combine texture color with intent color modulation
    vec3 color = mix(tex.rgb, intentColor, 0.5);
    
    // Alpha modulation based on pulse and texture
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

// Utility to get shader for specific intents
export const getShaderForIntent = (intent: string): string => {
  const lowerIntent = intent.toLowerCase();
  
  if (lowerIntent.includes("blue") && lowerIntent.includes("yellow") && lowerIntent.includes("pulse")) {
    return blueYellowPulseShader;
  }
  
  // Default shader if no specific intent matches
  return fragmentShader;
};
