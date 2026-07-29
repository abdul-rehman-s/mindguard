import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { generateAIChat, buildAssistantSystemPrompt } from '@/lib/ai';
import { buildMemoryContext } from '@/lib/memory';
import { logError } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthUserId();
    if (typeof authResult !== 'string') return authResult;
    const userId = authResult;

    const body = await req.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get or create session ID
    const currentSessionId = sessionId || uuidv4();

    // Get user info for system prompt
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, displayName: true },
    });
    const userName = user?.displayName || user?.name || 'friend';

    // Get recent conversation history (last 20 messages in this session)
    const conversationHistory = await db.conversation.findMany({
      where: { userId, sessionId: currentSessionId },
      orderBy: { timestamp: 'asc' },
      take: 20,
      select: { role: true, content: true },
    });

    // Get relevant memories for context
    const memoryContext = await buildMemoryContext(userId, 10);

    // Get stats for context
    const streak = await db.focusSession.count({
      where: { userId, type: { not: 'break' } },
    });

    // Build system prompt
    const systemPrompt = buildAssistantSystemPrompt(userName);

    // Build messages array
    const messages: Array<{ role: 'assistant' | 'user' | 'system'; content: string }> = [
      { role: 'assistant', content: systemPrompt },
      { role: 'assistant', content: `User's relevant memories:\n${memoryContext}\n\nUser has ${streak} total focus sessions. Current streak data and recent patterns are available in the memories above.` },
    ];

    // Add conversation history
    for (const msg of conversationHistory) {
      messages.push({ role: msg.role as 'assistant' | 'user' | 'system', content: msg.content });
    }

    // Add user's new message
    messages.push({ role: 'user', content: message });

    // Save user message to database
    await db.conversation.create({
      data: {
        userId,
        role: 'user',
        content: message.trim(),
        sessionId: currentSessionId,
      },
    });

    // Generate AI response
    const aiResponse = await generateAIChat(messages);

    // Save assistant response to database
    const savedMessage = await db.conversation.create({
      data: {
        userId,
        role: 'assistant',
        content: aiResponse,
        sessionId: currentSessionId,
      },
    });

    return NextResponse.json({
      response: aiResponse,
      sessionId: currentSessionId,
      messageId: savedMessage.id,
    });
  } catch (error) {
    logError('assistant-chat', 'POST /api/assistant/chat failed', error);
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthUserId();
    if (typeof authResult !== 'string') return authResult;
    const userId = authResult;

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const messages = await db.conversation.findMany({
      where: { userId, sessionId },
      orderBy: { timestamp: 'asc' },
      select: {
        id: true,
        role: true,
        content: true,
        timestamp: true,
        sessionId: true,
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    logError('assistant-chat', 'GET /api/assistant/chat failed', error);
    return NextResponse.json({ error: 'Failed to get conversation history' }, { status: 500 });
  }
}
