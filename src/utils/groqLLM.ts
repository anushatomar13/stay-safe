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
            content: 'You are a scam listing detector. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: 'json' // Correct value as per OpenAI-compatible API
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
      return JSON.parse(content);
    } catch {
      console.error('JSON Parse Error:', {
        response: response.data,
        content
      });
      throw new Error('Failed to parse Groq response');
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
