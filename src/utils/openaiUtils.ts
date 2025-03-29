
interface ShaderModificationResponse {
  code: string;
  description: string;
}

export const modifyShaderWithOpenAI = async (
  intent: string, 
  baseShader: string, 
  energyLevel: number, 
  complexity: number,
  showToast?: (props: { title: string; description: string; variant?: "default" | "destructive" }) => void
): Promise<ShaderModificationResponse> => {
  try {
    console.log('Starting OpenAI shader modification request...');
    if (showToast) {
      showToast({
        title: "Starting API Request",
        description: `Processing intent: "${intent}"`,
      });
    }
    
    // For frontend-only apps, we would require the user to input their API key
    const apiKey = localStorage.getItem('openai_api_key');
    
    if (!apiKey) {
      console.error('OpenAI API key not found in localStorage');
      if (showToast) {
        showToast({
          title: "API Key Error",
          description: "OpenAI API key not found",
          variant: "destructive"
        });
      }
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
    
    if (showToast) {
      showToast({
        title: "OpenAI Request Sent",
        description: "Generating shader code, please wait...",
      });
    }
    
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
      if (showToast) {
        showToast({
          title: "API Error",
          description: `Error: ${errorData.error?.message || "Unknown API error"}`,
          variant: "destructive"
        });
      }
      throw new Error(`OpenAI API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log(`Received OpenAI shader response, completion tokens: ${data.usage?.completion_tokens || 'unknown'}`);
    console.log(`Total tokens used: ${data.usage?.total_tokens || 'unknown'}`);
    
    if (showToast) {
      showToast({
        title: "Shader Generated",
        description: `Used ${data.usage?.total_tokens || 'unknown'} tokens`,
      });
    }
    
    // Make sure the content doesn't have markdown backticks
    let shaderCode = data.choices[0].message.content.trim();
    if (shaderCode.startsWith("```") && shaderCode.endsWith("```")) {
      shaderCode = shaderCode.substring(3, shaderCode.length - 3).trim();
    }
    if (shaderCode.startsWith("```glsl") && shaderCode.endsWith("```")) {
      shaderCode = shaderCode.substring(7, shaderCode.length - 3).trim();
    }
    
    // Generate a brief description
    console.log('Requesting sigil description from OpenAI...');
    console.time('description_request_time');
    
    if (showToast) {
      showToast({
        title: "Generating Description",
        description: "Creating mystical sigil description...",
      });
    }
    
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
      if (showToast) {
        showToast({
          title: "Description Error",
          description: "Failed to generate mystical description",
          variant: "destructive"
        });
      }
      throw new Error(`Description API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
    }

    const descriptionData = await descriptionResponse.json();
    console.log(`Received description tokens: ${descriptionData.usage?.completion_tokens || 'unknown'}`);
    
    const description = descriptionData.choices[0].message.content.trim();
    console.log(`Generated description: "${description}"`);
    console.log('OpenAI process completed successfully');
    
    if (showToast) {
      showToast({
        title: "Sigil Complete",
        description: `${description.substring(0, 60)}${description.length > 60 ? '...' : ''}`,
      });
    }

    return {
      code: shaderCode,
      description
    };
  } catch (error) {
    console.error('Error in OpenAI shader modification:', error);
    console.trace('Stack trace for OpenAI error');
    if (showToast) {
      showToast({
        title: "Synthesis Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
    throw error;
  }
};
