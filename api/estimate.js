// Vercel Serverless Function: 텍스트로 설명된 음식/식사의 칼로리를 Gemini API로 추정한다.
// 로컬 FOOD_DB 매칭에 실패했을 때만 프론트(src/App.jsx)에서 호출된다.
const GEMINI_MODEL = "gemini-2.5-flash";

function fallback(text) {
  return { name: text, calories: 300 };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const { text } = req.body || {};
  if (!text || typeof text !== "string" || !text.trim()) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // 키가 아직 설정되지 않은 경우에도 프론트가 항상 정상 흐름을 타도록 폴백을 반환한다.
    res.status(200).json(fallback(text));
    return;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `다음 음식/식사 설명의 대략적인 칼로리를 추정해줘: "${text}"`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING", description: "간결한 음식명(한글)" },
              calories: { type: "NUMBER", description: "추정 칼로리(kcal)" },
            },
            required: ["name", "calories"],
          },
        },
      }),
    });

    if (!response.ok) {
      res.status(200).json(fallback(text));
      return;
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(raw);

    const name = typeof parsed.name === "string" && parsed.name.trim() ? parsed.name : text;
    const calories = Math.round(Number(parsed.calories));

    if (!Number.isFinite(calories) || calories <= 0) {
      res.status(200).json(fallback(text));
      return;
    }

    res.status(200).json({ name, calories });
  } catch (e) {
    res.status(200).json(fallback(text));
  }
}
