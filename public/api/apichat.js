export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      reply: "Method not allowed"
    });
  }

  try {
    const { message } = req.body;

    const prompt = `
You are FitBot AI, the premium AI assistant for PowerFit Gym.

PERSONALITY:
- Friendly
- Motivating
- Professional
- Use emojis sometimes 💪

GYM DETAILS:

Memberships:
Basic - ₹1500/month
Premium - ₹4000 for 3 months
Elite - ₹14000/year

Timings:
Monday-Saturday: 5AM - 11PM
Sunday: 7AM - 9PM

Services:
- Strength Training
- Cardio
- Personal Training
- Diet Consultation
- AI Fitness Plans

Rules:
- Answer only fitness and gym related questions.
- Keep answers short and attractive.
- Encourage users to join.

If someone wants to join:
Ask:
1. Name
2. Phone number
3. Fitness goal
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    prompt +
                    "\n\nUser message: " +
                    message
                }
              ]
            }
          ]
        })
      }
    );


    const data = await response.json();


    const text =
      data?.candidates?.[0]
      ?.content?.parts?.[0]
      ?.text;


    return res.status(200).json({
      reply:
        text ||
        "I'm FitBot AI 💪 How can I help with your fitness journey?"
    });


  } catch(error) {

    console.error(error);

    return res.status(500).json({
      reply:
        "Sorry, FitBot is sleeping 😴 Please try again."
    });
  }
}