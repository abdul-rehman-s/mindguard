'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { staggerContainer, staggerItem } from '@/lib/animations';

export const ChatPanel = React.memo(function ChatPanel() {
  const conversationHistory = useAppStore(s => s.conversationHistory);
  const setConversationHistory = useAppStore(s => s.setConversationHistory);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message to display immediately
    const tempUserMsg = {
      id: `temp-user-${Date.now()}`,
      role: 'user' as const,
      content: userMessage,
      timestamp: new Date().toISOString(),
      sessionId: sessionId ?? undefined,
    };
    setConversationHistory([...conversationHistory, tempUserMsg]);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, sessionId: sessionId ?? undefined }),
      });

      if (!res.ok) throw new Error('Chat request failed');
      const data = await res.json();

      setSessionId(data.sessionId ?? undefined);

      // Add AI response
      const aiMsg = {
        id: data.messageId || `temp-ai-${Date.now()}`,
        role: 'assistant' as const,
        content: data.response,
        timestamp: new Date().toISOString(),
        sessionId: data.sessionId ?? undefined,
      };
      setConversationHistory([...conversationHistory, tempUserMsg, aiMsg]);
    } catch (error) {
      const errorMsg = {
        id: `error-${Date.now()}`,
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        sessionId: sessionId ?? undefined,
      };
      setConversationHistory([...conversationHistory, tempUserMsg, errorMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, sessionId, conversationHistory, setConversationHistory]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Typing animation component for AI messages
  const TypingIndicator = () => (
    <div className="flex items-center gap-1.5 px-3 py-2">
      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" />
    </div>
  );

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={staggerItem}>
        <Card className="glass-card glass-glow-edge card-glow overflow-hidden">
          <CardContent className="p-0">
            {/* Chat messages area */}
            <ScrollArea className="h-[400px] sm:h-[500px]">
              <div ref={scrollRef} className="flex flex-col gap-3 p-4">
                {conversationHistory.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10">
                      <Sparkles className="h-6 w-6 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-200">
                      Start a conversation
                    </h3>
                    <p className="text-sm text-zinc-500 max-w-sm">
                      Ask me anything about your productivity, get personalized advice, or plan your day.
                    </p>
                  </div>
                )}

                {conversationHistory.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'flex gap-2.5',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 mt-0.5">
                        <Bot className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'rounded-xl px-3.5 py-2.5 text-sm leading-relaxed max-w-[85%]',
                        msg.role === 'user'
                          ? 'bg-zinc-800/80 text-zinc-100 border border-white/[0.06]'
                          : 'bg-emerald-500/[0.08] text-zinc-200 border border-emerald-500/20'
                      )}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-invert prose-sm max-w-none prose-p:text-zinc-200 prose-p:leading-relaxed prose-headings:text-zinc-100 prose-code:text-emerald-300 prose-code:bg-emerald-500/10 prose-code:px-1 prose-code:rounded">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-700/50 mt-0.5">
                        <User className="h-3.5 w-3.5 text-zinc-300" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start gap-2.5"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Bot className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <div className="rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20">
                      <TypingIndicator />
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input area */}
            <div className="border-t border-white/[0.06] p-3">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask MindGuard AI..."
                  disabled={isLoading}
                  className="flex-1 bg-zinc-900/50 border-white/[0.06] text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-400/50"
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white shrink-0 h-9"
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
});
