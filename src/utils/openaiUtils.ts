
interface ShaderModificationResponse {
  code: string;
  description: string;
}

export const modifyShaderWithOpenAI = async (
  intent: string, 
  baseShader: string, 
  energyLevel: number, 
  complexity: number
): Promise<ShaderModificationResponse> => {
  try {
    // For frontend-only apps, we would require the user to input their API key
    const apiKey = localStorage.getItem('openai_api_key');
    
    if (!apiKey) {
      throw new Error('OpenAI API key not found');
    }

    const prompt = `
      Generate a GLSL fragment shader based on this intent: "${intent}".
      
      Energy level parameter: ${energyLevel} (higher means more energetic animations)
      Complexity parameter: ${complexity} (higher means more complex patterns)
      
      Base this on the following shader template, but modify it to reflect the intent:
      
      ${baseShader}
      
      Your response must be valid GLSL code only, keep the same uniform variables.
      Make the code visually represent the intent through colors, patterns, and animations.
      Return only the modified shader code without explanations.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a GLSL shader expert. You generate or modify fragment shaders based on user intents. Only return valid GLSL code without any explanations or markdown.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const shaderCode = data.choices[0].message.content.trim();
    
    // Generate a brief description
    const descriptionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a mystical sigil expert. Describe the magical properties of the shader sigil in a short, mysterious sentence. Be concise and enigmatic.'
          },
          {
            role: 'user',
            content: `The user's intent was: "${intent}". Describe the mystical properties of the resulting sigil in one short sentence.`
          }
        ],
        max_tokens: 60,
        temperature: 0.7
      })
    });

    if (!descriptionResponse.ok) {
      throw new Error('Failed to generate sigil description');
    }

    const descriptionData = await descriptionResponse.json();
    const description = descriptionData.choices[0].message.content.trim();

    return {
      code: shaderCode,
      description
    };
  } catch (error) {
    console.error('Error modifying shader with OpenAI:', error);
    throw error;
  }
};
