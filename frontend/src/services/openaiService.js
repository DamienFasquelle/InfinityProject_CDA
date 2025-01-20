import axios from 'axios';

const APIURL = process.env.OPENAI_API_URL;
const APIKEY = process.env.OPENAI_API_KEY;

export const getChatbotResponse = async (message) => {
  try {
    const response = await axios.post(
        APIURL,
      {
        model: 'gpt-3.5-turbo', 
        messages: [{ role: 'user', content: message }],
        max_tokens: 150, 
        temperature: 0.7, 
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${APIKEY}`,
        },
      }
    );

    return response.data.choices[0].message.content; 
  } catch (error) {
    console.error('Erreur avec l\'API OpenAI :', error);
    return "Je suis désolé, je ne peux pas répondre pour le moment.";
  }
};
