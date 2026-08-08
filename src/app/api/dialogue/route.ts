import { NextRequest, NextResponse } from 'next/server';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { message, scenario, targetLanguage, history, cefr = 'A1' } = await req.json();

    const systemPrompt = `You are Nurik, a friendly language tutor.
Scenario: ${scenario}. Target language: ${targetLanguage}. CEFR level: ${cefr}.
Keep responses short (1-2 sentences). Speak ONLY in ${targetLanguage}.
Be encouraging and correct mistakes gently.`;

    const messages: Message[] = [
      { role: 'assistant', content: systemPrompt },
      ...(history || []),
      { role: 'user', content: message },
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // or 'mixtral-8x7b-32768' for more complex
        messages,
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      return NextResponse.json({ reply: 'Տեխնիկական խնդիր, փորձիր կրկին։' }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Կրկնի՛ր, խնդրեմ:';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Dialogue error:', error);
    return NextResponse.json({ reply: 'Սխալ կապի մեջ: ✨' }, { status: 500 });
  }
}