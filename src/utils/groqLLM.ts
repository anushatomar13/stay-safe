
import axios from 'axios';

export const groqLLM = async (prompt: string) => {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a scam listing detector. Always return valid JSON in the exact format: {"suspicion": number, "flags": ["string"], "reasoning": "string"}'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" } 
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const content = response.data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Invalid response structure from Groq API');
    }

    try {
      const parsed = JSON.parse(content);
      
      // Validate the required fields
      if (typeof parsed.suspicion !== 'number' || 
          !Array.isArray(parsed.flags) || 
          typeof parsed.reasoning !== 'string') {
        throw new Error('Invalid response format from Groq API');
      }
      
      return parsed;
    } catch (parseError) {
      console.error('JSON Parse Error:', {
        response: response.data,
        content,
        parseError
      });
      throw new Error('Failed to parse Groq response as valid JSON');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Groq API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    } else if (error instanceof Error) {
      console.error('Groq API Error:', { message: error.message });
    } else {
      console.error('Unknown error type:', error);
    }
    throw error;
  }
};