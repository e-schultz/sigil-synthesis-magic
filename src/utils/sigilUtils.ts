
export const isApiKeyConfigured = (): boolean => {
  const apiKey = localStorage.getItem('openai_api_key');
  return !!apiKey && 
         apiKey.startsWith('sk-') && 
         apiKey.length > 40 && 
         /^sk-[a-zA-Z0-9]{48}$/.test(apiKey);
};

export const clearApiKey = () => {
  localStorage.removeItem('openai_api_key');
};

export const saveApiKey = (apiKey: string): boolean => {
  // Validate API key format
  if (apiKey.startsWith('sk-') && apiKey.length > 40) {
    localStorage.setItem('openai_api_key', apiKey.trim());
    return true;
  }
  return false;
};
