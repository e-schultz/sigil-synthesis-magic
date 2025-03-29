
export const generateRandomGLSLCode = (energyLevel: number, complexity: number): string => {
  return `#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_texture;   // Sigil image
uniform float time;
uniform vec2 resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  
  // Distortion based on intent energy (${energyLevel})
  uv.x += sin(uv.y * ${(complexity / 10).toFixed(1)} + time) * 0.01;
  
  // Sigil texture lookup
  vec4 tex = texture2D(u_texture, uv);
  
  // Pulse effect with complexity factor ${(complexity / 20).toFixed(1)}
  float pulse = 0.5 + 0.5 * sin(time * ${(energyLevel / 20).toFixed(1)});
  
  // Alpha modulation
  float alpha = tex.r * pulse;
  
  gl_FragColor = vec4(vec3(tex.r), alpha);
}`;
};

// Add a default shader description for non-AI generated shaders
export const getDefaultShaderDescription = (): string => {
  return "A mystical sigil pulsing with arcane energy, binding intent to reality.";
};
