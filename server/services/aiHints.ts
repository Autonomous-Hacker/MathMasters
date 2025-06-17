import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "default_key"
});

export async function generateAIHint(
  question: string, 
  operation: string, 
  grade: number
): Promise<string> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful math tutor for grade ${grade} students. Provide encouraging, age-appropriate hints that guide students toward the answer without giving it away directly. Keep hints simple and positive. Respond with JSON in this format: { "hint": "your hint here" }`
        },
        {
          role: "user",
          content: `Give a helpful hint for this ${operation} problem: "${question}". The student is in grade ${grade}. Make the hint encouraging and educational, but don't give away the answer.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 150,
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.hint || "Try thinking about this step by step!";
    
  } catch (error) {
    console.error("OpenAI API error:", error);
    
    // Fallback hints based on operation type
    const fallbackHints: { [key: string]: string[] } = {
      addition: [
        "Try counting up from the bigger number!",
        "You can use your fingers to help count!",
        "Think about combining the two groups together!",
        "What happens when you put these numbers together?"
      ],
      subtraction: [
        "Start with the bigger number and count backwards!",
        "Think about taking away from the first number!",
        "What's left when you remove some from the group?",
        "Try using objects to help you visualize!"
      ],
      multiplication: [
        "Think about adding the same number multiple times!",
        "Remember your times tables!",
        "You can draw groups to help you!",
        "What pattern do you see in the numbers?"
      ],
      division: [
        "How many equal groups can you make?",
        "Think about sharing equally!",
        "What number times the divisor gives you this answer?",
        "Try counting how many times the smaller number fits!"
      ]
    };

    const hints = fallbackHints[operation] || fallbackHints.addition;
    return hints[Math.floor(Math.random() * hints.length)];
  }
}
