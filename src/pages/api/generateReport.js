// pages/api/generateReport.js
import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { checklists } = req.body;

  if (!checklists || !Array.isArray(checklists) || checklists.length === 0) {
    return res.status(400).json({ error: '체크리스트 데이터가 필요합니다.' });
  }

  try {
    // OpenAI API 설정
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 전문적인 ChatGPT 프롬프트 생성
    let prompt = `다음의 시장조사 데이터를 바탕으로, 수입할 물품들의 경쟁력 분석과 잠재적인 이득을 극대화할 수 있는 방안을 포함한 종합적인 보고서를 작성해 주세요.\n\n`;
    prompt += `시장조사의 목적: 사용자가 시장조사한 물품들을 수입하기 위해 어떤 물건들이 더 경쟁력이 있는지를 확인하고, 어떤 물건들을 수입할 경우 더 많은 이득과 경쟁력을 얻을 수 있는지 분석하기 위함입니다.\n\n`;

    checklists.forEach((checklist) => {
      prompt += `마트 이름: ${checklist.storeName}\n`;
      prompt += `카테고리: ${checklist.category}\n`;
      prompt += `체크리스트 항목:\n`;
      checklist.items.forEach((item) => {
        prompt += `- ${item}\n`;
      });
      prompt += `\n`;
    });

    prompt += `보고서에 포함될 내용:
1. 시장 상황 분석
2. 경쟁 물품 분석
3. 추천 수입 물품 및 그 이유
4. 앞으로 추가로 시장조사를 해야 할 상품들
5. 시장분석 방법론 설명

각 항목을 상세히 다루어 주세요.
전문가적인 견해로 전문가적인 내용으로 작성해주세요.`;

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // 'gpt-4o-mini'는 존재하지 않는 모델명입니다. 'gpt-4'로 변경
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const report = completion.choices[0].message.content.trim();

    res.status(200).json({ report });
  } catch (error) {
    console.error('OpenAI API 호출 오류:', error);
    res.status(500).json({ error: '보고서 생성 중 오류가 발생했습니다.' });
  }
}
