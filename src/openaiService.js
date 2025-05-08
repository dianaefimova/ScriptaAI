import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const getChatCompletion = async (messages) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: messages,
    });
    return completion.choices[0].message.content; // Return the assistant's response
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
};



