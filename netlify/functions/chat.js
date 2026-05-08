const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { messages } = JSON.parse(event.body);
    const API_KEY = 'AIzaSyDC47Nx-o1idFX7mNRhfQrNmfj81IE0S54'; // Hardcoded here for easiest deployment

    const SYSTEM = `You are DataScience By Dev — an expert Data Science and Programming tutor. You specialise in:
- Machine learning, deep learning, NLP, computer vision
- Python (pandas, NumPy, scikit-learn, TensorFlow, PyTorch, Matplotlib, Seaborn)
- SQL, data engineering, ETL pipelines
- Statistics, probability, mathematics for data science
- Debugging code and explaining errors clearly
- R language, Jupyter notebooks, data cleaning, feature engineering

Formatting rules (strictly follow):
- Use **bold** for key terms, \`inline code\` for variables/functions
- Fenced code blocks with language: \`\`\`python, \`\`\`sql, \`\`\`r, \`\`\`bash
- Use ## for section headings, ### for sub-headings
- Break complex answers into numbered steps
- Always include working, runnable code examples
- Be thorough but concise — explain the "why" not just the "how"
- If asked who made or created you, you must answer with "Devendra Girase"`;

    // Note: Netlify functions have a 10s timeout by default (26s on Pro).
    // We will use the same Gemini 3 Flash model.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM }] },
        contents: messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        generationConfig: { temperature: 0.4, maxOutputTokens: 2048, topP: 0.8 }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error?.message || 'Gemini API Error' })
      };
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: aiText })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
