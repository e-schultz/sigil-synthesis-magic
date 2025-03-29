
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
  uv.x += sin(uv.y * 30.0 + time * 0.5) * 0.02;
  uv.y += cos(uv.x * 25.0 + time * 0.5) * 0.02;

  // Sigil texture lookup
  vec4 tex = texture2D(u_texture, uv);

  // Pulse effect with complexity factor ${(complexity / 20).toFixed(1)}
  float pulse = 0.5 + 0.5 * sin(time * 5.0);

  // Color modulation based on intent
  float bluIntensity = 0.5 + 0.5 * sin(uv.y * 10.0 + time);

  // Combine texture color with blue modulation
  vec3 color = mix(tex.rgb, vec3(0.0, 0.0, bluIntensity), 0.5);

  // Alpha modulation
  float alpha = tex.r * pulse;

  gl_FragColor = vec4(color, alpha);
}`;
};

// Add a default shader description for non-AI generated shaders
export const getDefaultShaderDescription = (): string => {
  return "A mystical sigil pulsing with arcane energy, binding intent to reality.";
};

// Check if the API key is properly set in localStorage
export const isApiKeyConfigured = (): boolean => {
  const apiKey = localStorage.getItem('openai_api_key');
  return !!apiKey && apiKey.startsWith('sk-') && apiKey.length > 20;
};
