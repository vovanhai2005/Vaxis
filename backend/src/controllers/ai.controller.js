import { getVaccinationAdvice } from '../lib/gemini.js';

export const chatWithAI = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const result = await getVaccinationAdvice(message, conversationHistory || []);

    res.status(200).json({
      response: result.response,
      conversationHistory: result.conversationHistory
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      message: 'Failed to process chat message',
      error: error.message 
    });
  }
};
