const processNaturalLanguageQuery = async (query) => {
  // This would connect to your backend LLM service
  try {
    const response = await fetch('/api/llm/process-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to process query');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in LLM processing:', error);
    throw error;
  }
};

const generateItinerarySummary = async (searchResults) => {
  try {
    const response = await fetch('/api/llm/generate-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ searchResults }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate summary');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
};

export const llmService = {
  processNaturalLanguageQuery,
  generateItinerarySummary,
}; 