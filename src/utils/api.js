const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || ''

export async function draftSummary(employeeName, entries) {
  const entryText = entries
    .map((e) => `- [${e.cat}] ${e.title}: ${e.body}`)
    .join('\n')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `Write a concise 2-3 sentence manager summary for ${employeeName} based on these file notes:\n\n${entryText}\n\nBe factual, balanced, and professional. No bullet points.`,
        },
      ],
    }),
  })

  if (!response.ok) throw new Error('API request failed')
  const data = await response.json()
  return data.content[0].text
}
