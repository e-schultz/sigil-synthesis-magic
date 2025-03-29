import { toast } from "@/components/ui/use-toast";
import { blueYellowPulseShader, fragmentShader } from "./shaderUtils";

export const isApiKeyConfigured = (): boolean => {
  const apiKey = localStorage.getItem('openai_api_key');
  return !!apiKey && 
         apiKey.startsWith('sk-') && 
         apiKey.length > 40 && 
         /^sk-[a-zA-Z0-9]{48}$/.test(apiKey);
};

export const clearApiKey = () => {
  localStorage.removeItem('openai_api_key');
  toast({
    title: "API Key Cleared",
    description: "Your OpenAI API key has been removed.",
    variant: "default"
  });
};

export const saveApiKey = (apiKey: string): boolean => {
  if (apiKey.startsWith('sk-') && apiKey.length > 40) {
    localStorage.setItem('openai_api_key', apiKey.trim());
    toast({
      title: "API Key Saved",
      description: "Your OpenAI API key has been saved for this session.",
      variant: "default"
    });
    return true;
  }
  
  toast({
    title: "Invalid API Key",
    description: "Please enter a valid OpenAI API key starting with 'sk-'.",
    variant: "destructive"
  });
  return false;
};

export const generateIntentBasedShader = (intent: string, energyLevel: number, complexity: number): string => {
  const lowerIntent = intent.toLowerCase();
  
  if (lowerIntent.includes("blue") && lowerIntent.includes("yellow") && lowerIntent.includes("pulse")) {
    return blueYellowPulseShader;
  }
  
  if ((lowerIntent.includes("fire") || lowerIntent.includes("flame") || lowerIntent.includes("burn")) && 
       !lowerIntent.includes("water") && !lowerIntent.includes("ice")) {
    return `#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_texture;
uniform float time;
uniform vec2 resolution;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  
  float distortion = ${(energyLevel / 40.0).toFixed(2)} + ${(energyLevel / 100.0).toFixed(2)} * sin(time * 3.0);
  uv.y += sin(uv.x * 20.0) * 0.02 * distortion;
  uv.x += cos(uv.y * 25.0 + time) * 0.02;
  
  vec4 tex = texture2D(u_texture, uv);
  
  vec3 orange = vec3(1.0, 0.6, 0.0);
  vec3 red = vec3(1.0, 0.2, 0.0);
  
  float t = uv.y + 0.2 * sin(time * 2.0 + uv.x * 20.0);
  vec3 fireColor = mix(red, orange, t);
  
  float flicker = 0.8 + 0.2 * sin(time * ${(complexity / 10.0).toFixed(1)});
  
  vec3 color = mix(tex.rgb, fireColor, 0.7) * flicker;
  
  float alpha = tex.r * (0.7 + 0.3 * sin(time * 3.0));
  
  gl_FragColor = vec4(color, alpha);
}`;
  }
  
  if ((lowerIntent.includes("water") || lowerIntent.includes("ocean") || lowerIntent.includes("wave")) && 
       !lowerIntent.includes("fire")) {
    return `#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_texture;
uniform float time;
uniform vec2 resolution;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  
  float waveFactor = ${(energyLevel / 50.0).toFixed(2)};
  uv.x += sin(uv.y * 10.0 + time) * 0.03 * waveFactor;
  uv.y += sin(uv.x * 12.0 + time * 0.7) * 0.02 * waveFactor;
  
  vec4 tex = texture2D(u_texture, uv);
  
  vec3 deepBlue = vec3(0.0, 0.2, 0.8);
  vec3 lightBlue = vec3(0.0, 0.5, 1.0);
  
  float mixFactor = 0.5 + 0.5 * sin(uv.x * 5.0 + uv.y * 7.0 + time * ${(complexity / 30.0).toFixed(1)});
  vec3 waterColor = mix(deepBlue, lightBlue, mixFactor);
  
  vec3 color = mix(tex.rgb, waterColor, 0.6);
  
  float alpha = tex.r * (0.8 + 0.2 * sin(time * 1.5));
  
  gl_FragColor = vec4(color, alpha);
}`;
  }
  
  if ((lowerIntent.includes("forest") || lowerIntent.includes("green") || lowerIntent.includes("nature") || 
       lowerIntent.includes("growth") || lowerIntent.includes("life"))) {
    return `#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_texture;
uniform float time;
uniform vec2 resolution;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  
  float distortion = ${(energyLevel / 75.0).toFixed(2)};
  uv.x += sin(uv.y * 8.0 + time * 0.5) * 0.03 * distortion;
  uv.y += cos(uv.x * 7.0 + time * 0.4) * 0.03 * distortion;
  
  vec4 tex = texture2D(u_texture, uv);
  
  vec3 darkGreen = vec3(0.0, 0.4, 0.1);
  vec3 lightGreen = vec3(0.5, 0.8, 0.2);
  
  float noisePattern = sin(uv.x * ${complexity.toFixed(1)} + uv.y * ${(complexity * 1.3).toFixed(1)} + time * 0.7) * 0.5 + 0.5;
  vec3 greenColor = mix(darkGreen, lightGreen, noisePattern);
  
  vec3 color = mix(tex.rgb, greenColor, 0.7);
  
  float pulse = 0.7 + 0.3 * sin(time * 1.2);
  float alpha = tex.r * pulse;
  
  gl_FragColor = vec4(color, alpha);
}`;
  }
  
  if ((lowerIntent.includes("space") || lowerIntent.includes("cosmic") || lowerIntent.includes("star") || 
       lowerIntent.includes("galaxy") || lowerIntent.includes("universe"))) {
    return `#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_texture;
uniform float time;
uniform vec2 resolution;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  
  float distortion = ${(energyLevel / 60.0).toFixed(2)};
  uv.x += sin(uv.y * 15.0 + time) * 0.03 * distortion;
  uv.y += cos(uv.x * 17.0 + time * 0.8) * 0.03 * distortion;
  
  vec4 tex = texture2D(u_texture, uv);
  
  vec3 purple = vec3(0.5, 0.0, 0.8);
  vec3 blue = vec3(0.0, 0.2, 0.6);
  vec3 starColor = vec3(0.9, 0.9, 1.0);
  
  float cosmicMix = sin(uv.x * ${(complexity * 0.8).toFixed(1)} + uv.y * ${complexity.toFixed(1)} + time * 0.5) * 0.5 + 0.5;
  vec3 cosmicColor = mix(purple, blue, cosmicMix);
  
  float sparkle = pow(sin(uv.x * 50.0 + time) * sin(uv.y * 50.0 + time * 1.1), 8.0);
  cosmicColor = mix(cosmicColor, starColor, sparkle * 0.7);
  
  vec3 color = mix(tex.rgb, cosmicColor, 0.6);
  
  float pulse = 0.7 + 0.3 * sin(time * 1.5);
  float alpha = tex.r * pulse;
  
  gl_FragColor = vec4(color, alpha);
}`;
  }
  
  return `#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_texture;
uniform float time;
uniform vec2 resolution;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  
  float distortionAmount = ${(energyLevel / 100.0).toFixed(2)};
  uv.x += sin(uv.y * ${(complexity * 0.8).toFixed(1)} + time * ${(energyLevel / 25.0).toFixed(1)}) * 0.05 * distortionAmount;
  uv.y += cos(uv.x * ${complexity.toFixed(1)} + time * ${(energyLevel / 30.0).toFixed(1)}) * 0.05 * distortionAmount;
  
  vec4 tex = texture2D(u_texture, uv);
  
  float redIntensity = 0.5 + 0.5 * sin(uv.x * ${(complexity * 0.2).toFixed(1)} + time);
  float greenIntensity = 0.5 + 0.5 * sin(uv.y * ${(complexity * 0.3).toFixed(1)} + time * 1.3);
  float blueIntensity = 0.5 + 0.5 * sin((uv.x + uv.y) * ${(complexity * 0.25).toFixed(1)} + time * 0.7);
  
  float pulse = 0.7 + 0.3 * sin(time * ${(energyLevel / 20.0).toFixed(1)});
  
  vec3 intentColor = vec3(redIntensity, greenIntensity, blueIntensity);
  
  vec3 color = mix(tex.rgb, intentColor, 0.6);
  
  float alpha = tex.r * pulse;
  
  gl_FragColor = vec4(color, alpha);
}`;
};

export const generateRandomGLSLCode = (energyLevel: number, complexity: number): string => {
  return `#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_texture;   // Sigil image
uniform float time;
uniform vec2 resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  uv.x += sin(uv.y * 30.0 + time * 0.5) * 0.02;
  uv.y += cos(uv.x * 25.0 + time * 0.5) * 0.02;

  vec4 tex = texture2D(u_texture, uv);

  float pulse = 0.5 + 0.5 * sin(time * 5.0);

  float bluIntensity = 0.5 + 0.5 * sin(uv.y * 10.0 + time);

  vec3 color = mix(tex.rgb, vec3(0.0, 0.0, bluIntensity), 0.5);

  float alpha = tex.r * pulse;

  gl_FragColor = vec4(color, alpha);
}`;
};

export const getDefaultShaderDescription = (): string => {
  return "A mystical sigil pulsing with arcane energy, binding intent to reality.";
};

export const generateShaderDescription = (intent: string): string => {
  const descriptions = [
    `A sigil that embodies "${intent}", channeling energy through vibrant patterns.`,
    `Mystical energies of "${intent}" flow through this animated sigil.`,
    `This living sigil manifests the intent of "${intent}" with dynamic precision.`,
    `Arcane forces swirl within this sigil, binding "${intent}" to reality.`,
    `A gateway between worlds, this sigil pulses with the essence of "${intent}".`
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};
