const OpenAI = require('openai'); // Import OpenAI package
require('dotenv').config();       // Load environment variables

// Initialize OpenAI API client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // Make sure the API key is correctly set
});

// Function to generate ESG summary using the chat-based API
async function generateESGSummary(companyName, focusArea) {
  try {
    const messages = [
      {
        role: 'system',
        content: 'You are an expert in environmental, social, and governance (ESG) analysis.',
      },
      {
        role: 'user',
        content: `Generate a detailed ESG report for ${companyName}, focusing on ${focusArea}.`,
      }
    ];

    // Call OpenAI chat completion endpoint (for models like gpt-3.5-turbo, gpt-4)
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',  // Use 'gpt-4' if you have access
      messages: messages,      // Send the conversation as a list of messages
      max_tokens: 300,         // Set token limit for the response
    });

    return response.choices[0].message.content.trim();  // Extract the response text from the message
  } catch (error) {
    console.error('Error generating ESG report:', error.message);
    throw new Error('Failed to generate ESG report');
  }
}

module.exports = { generateESGSummary };
