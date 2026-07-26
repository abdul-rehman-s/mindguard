import ZAI from 'z-ai-web-dev-sdk';
import { logError } from '@/lib/logger';

// Singleton pattern for AI instance
let zaiInstance: InstanceType<typeof ZAI> | null = null;

export async function getAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function generateAIResponse(
  systemPrompt: string,
  userMessage: string,
  context?: string
): Promise<string> {
  try {
    const zai = await getAI();
    const messages: Array<{ role: string; content: string }> = [
      { role: 'assistant', content: systemPrompt },
    ];
    if (context) {
      messages.push({ role: 'assistant', content: `Context data:\n${context}` });
    }
    messages.push({ role: 'user', content: userMessage });

    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' },
    });
    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    logError('ai', 'generateAIResponse failed', error);
    return '';
  }
}

export async function generateAIChat(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  try {
    const zai = await getAI();
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' },
    });
    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    logError('ai', 'generateAIChat failed', error);
    return '';
  }
}

/**
 * System prompt for MindGuard AI assistant.
 * Provides context about the app and the user's data.
 */
export function buildAssistantSystemPrompt(userName?: string): string {
  return `You are MindGuard AI, a personal productivity operating system assistant. You help users manage their focus, missions, habits, and productivity.

Key principles:
- Be concise, actionable, and personalized
- Use the user's actual data (provided in context) to give specific advice
- Never make up data — only use what's provided
- Focus on practical recommendations, not abstract theory
- Use the user's name (${userName || 'friend'}) when appropriate
- Maintain a warm, encouraging tone
- When giving structured data, output valid JSON only (no markdown, no explanation text)

Your capabilities:
1. Morning Briefing: Plan the day based on priorities, predicted focus, best hours
2. Evening Review: Analyze the day's performance, extract lessons
3. Predictions: Estimate burnout risk, focus scores, streak risks
4. Recommendations: Personalized advice based on patterns
5. Timeline: Convert raw activity data into human-readable stories
6. Chat: General productivity coaching and advice
7. Memory: Recall and reference past patterns and insights`;
}
