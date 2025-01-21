const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

class ChatGPTService {
  async processSearchQuery(query) {
    try {
      console.log('🤖 Starting ChatGPT processing for query:', query);
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      console.log('🔑 Using API Key:', OPENAI_API_KEY ? 'Present' : 'Missing');

      const requestBody = {
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: `You are a travel assistant. Extract travel parameters from user input.
            Today's date is: ${today}
            
            Rules for dates:
            - Always provide the three-letter IATA airport code for the destination (e.g., 'Paris' = 'CDG', 'London' = 'LHR')
            - Format all dates as YYYY-MM-DD
            - All dates must be from ${tomorrow} onwards
            - If no specific date is mentioned, use a date 3 months from today
            - If no return date is mentioned for a round trip, assume 7 days after departure
            - Never return dates in the past
            
            Examples: 
            - "tomorrow" → ${tomorrow}
            - "next month" → format as YYYY-MM-DD of next month
            - "December" → format as YYYY-12-01 (if December this year is in the past, use next year)
            - "Christmas" → format as YYYY-12-25 (if Christmas this year is in the past, use next year)`
        }, {
          role: "user",
          content: query
        }],
        functions: [{
          name: "searchTravel",
          description: "Search for travel options",
          parameters: {
            type: "object",
            properties: {
              destination: {
                type: "string",
                description: "Three-letter IATA airport code for the destination (e.g., CDG for Paris)"
              },
              departureDate: {
                type: "string",
                description: `Departure date in YYYY-MM-DD format. Must be ${tomorrow} or later.`
              },
              returnDate: {
                type: "string",
                description: "Return date in YYYY-MM-DD format. Must be after departure date."
              },
              travelers: {
                type: "integer",
                description: "Number of travelers",
                default: 1
              },
              maxBudget: {
                type: "number",
                description: "Maximum budget in USD",
                default: 10000
              },
              preferences: {
                type: "array",
                items: {
                  type: "string"
                },
                description: "Additional preferences or requirements"
              }
            },
            required: ["destination", "departureDate"]
          }
        }],
        function_call: { name: "searchTravel" }
      };

      console.log('📤 Sending request to OpenAI:', requestBody);

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Received response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Raw OpenAI response:', data);

      if (data.error) {
        console.error('❌ OpenAI API Error:', data.error);
        throw new Error(data.error.message || 'OpenAI API Error');
      }

      const functionCall = data.choices[0].message.function_call;
      const parsedArgs = JSON.parse(functionCall.arguments);
      
      // Validate dates are in the future
      const validateDate = (dateStr) => {
        if (!dateStr) return undefined;
        const date = new Date(dateStr);
        const tomorrowDate = new Date(tomorrow);
        return date >= tomorrowDate ? dateStr : undefined;
      };

      // Add default values and validate dates
      const processedParams = {
        ...parsedArgs,
        origin: 'YVR', // Default origin
        departureDate: validateDate(parsedArgs.departureDate),
        returnDate: validateDate(parsedArgs.returnDate),
        maxBudget: parsedArgs.maxBudget || 10000,
        travelers: parsedArgs.travelers || 1
      };
      
      if (!processedParams.departureDate) {
        throw new Error('Departure date must be in the future');
      }
      
      console.log('✅ Processed parameters:', processedParams);
      return processedParams;
    } catch (error) {
      console.error('❌ ChatGPT processing error:', error);
      throw error;
    }
  }
}

export const chatGptService = new ChatGPTService(); 