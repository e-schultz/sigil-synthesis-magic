
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
    console.log('Starting OpenAI shader modification request...');
    // For frontend-only apps, we would require the user to input their API key
    const apiKey = localStorage.getItem('openai_api_key');
    
    if (!apiKey) {
      console.error('OpenAI API key not found in localStorage');
      throw new Error('OpenAI API key not found');
    }

    console.log(`Preparing OpenAI request with intent: "${intent}"`);
    console.log(`Parameters - Energy Level: ${energyLevel}, Complexity: ${complexity}`);
    
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

    console.log('Sending request to OpenAI API with model: gpt-4o...');
    console.time('openai_request_time');
    
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

    console.timeEnd('openai_request_time');
    console.log(`OpenAI API response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error details:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log(`Received OpenAI shader response, completion tokens: ${data.usage?.completion_tokens || 'unknown'}`);
    console.log(`Total tokens used: ${data.usage?.total_tokens || 'unknown'}`);
    
    const shaderCode = data.choices[0].message.content.trim();
    
    // Generate a brief description
    console.log('Requesting sigil description from OpenAI...');
    console.time('description_request_time');
    
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

    console.timeEnd('description_request_time');
    console.log(`Description API response status: ${descriptionResponse.status} ${descriptionResponse.statusText}`);
    
    if (!descriptionResponse.ok) {
      const errorData = await descriptionResponse.json();
      console.error('Description API error details:', errorData);
      throw new Error(`Description API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
    }

    const descriptionData = await descriptionResponse.json();
    console.log(`Received description tokens: ${descriptionData.usage?.completion_tokens || 'unknown'}`);
    
    const description = descriptionData.choices[0].message.content.trim();
    console.log(`Generated description: "${description}"`);
    console.log('OpenAI process completed successfully');

    return {
      code: shaderCode,
      description
    };
  } catch (error) {
    console.error('Error in OpenAI shader modification:', error);
    console.trace('Stack trace for OpenAI error');
    throw error;
  }
};
