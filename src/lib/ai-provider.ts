/**
 * AI Provider Abstraction Layer — MindGuard
 *
 * Multi-provider support for the AI coach. Each provider implements
 * the same interface so the coach can use any LLM backend.
 *
 * Supported providers:
 *   - z-ai (default, no API key needed)
 *   - openai
 *   - deepseek
 *   - openrouter
 *   - gemini
 *   - anthropic
 *   - ollama (self-hosted)
 */

import ZAI from 'z-ai-web-dev-sdk';
import { logError, logInfo } from '@/lib/logger';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type AIProviderName = 'z-ai' | 'openai' | 'deepseek' | 'openrouter' | 'gemini' | 'anthropic' | 'ollama';

export interface AIProviderConfig {
  provider: AIProviderName;
  apiKey?: string | null;
  model?: string | null;
  ollamaUrl?: string | null;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionResult {
  success: boolean;
  content: string | null;
  error?: string;
  provider: AIProviderName;
  model?: string;
}

// ──────────────────────────────────────────────
// Provider implementations
// ──────────────────────────────────────────────

/** Default model per provider */
const DEFAULT_MODELS: Record<AIProviderName, string> = {
  'z-ai': 'default',
  openai: 'gpt-4o-mini',
  deepseek: 'deepseek-chat',
  openrouter: 'openai/gpt-4o-mini',
  gemini: 'gemini-2.0-flash',
  anthropic: 'claude-3-haiku-20240307',
  ollama: 'llama3',
};

// ──────────────────────────────────────────────
// z-ai-web-dev-sdk (default provider)
// ──────────────────────────────────────────────

let zaiInstance: ZAI | null = null;

async function getZAI(): Promise<ZAI> {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

async function completeWithZai(messages: ChatMessage[]): Promise<AICompletionResult> {
  try {
    const zai = await getZAI();
    // z-ai SDK uses 'assistant' role for system prompts
    const sdkMessages = messages.map(m => ({
      role: m.role === 'system' ? 'assistant' as const : m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const completion = await zai.chat.completions.create({
      messages: sdkMessages,
      thinking: { type: 'disabled' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content || content.trim().length === 0) {
      return { success: false, content: null, error: 'Empty response from z-ai', provider: 'z-ai' };
    }

    return { success: true, content, provider: 'z-ai' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown z-ai error';
    logError('ai-provider', `z-ai completion failed: ${msg}`, e);
    return { success: false, content: null, error: msg, provider: 'z-ai' };
  }
}

// ──────────────────────────────────────────────
// OpenAI-compatible API (OpenAI, DeepSeek, OpenRouter)
// ──────────────────────────────────────────────

interface OpenAICompatibleConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

async function completeWithOpenAICompatible(
  messages: ChatMessage[],
  config: OpenAICompatibleConfig,
  providerName: AIProviderName,
): Promise<AICompletionResult> {
  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return { success: false, content: null, error: `${providerName} API error: ${response.status} ${errBody}`, provider: providerName, model: config.model };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content || content.trim().length === 0) {
      return { success: false, content: null, error: `Empty response from ${providerName}`, provider: providerName, model: config.model };
    }

    return { success: true, content, provider: providerName, model: config.model };
  } catch (e) {
    const msg = e instanceof Error ? e.message : `Unknown ${providerName} error`;
    logError('ai-provider', `${providerName} completion failed: ${msg}`, e);
    return { success: false, content: null, error: msg, provider: providerName, model: config.model };
  }
}

// ──────────────────────────────────────────────
// Gemini (Google AI)
// ──────────────────────────────────────────────

async function completeWithGemini(
  messages: ChatMessage[],
  apiKey: string,
  model: string,
): Promise<AICompletionResult> {
  try {
    // Convert to Gemini format
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    let systemInstruction: string | null = null;

    for (const m of messages) {
      if (m.role === 'system') {
        systemInstruction = m.content;
      } else {
        contents.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        });
      }
    }

    const body: Record<string, unknown> = { contents };
    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const errBody = await response.text();
      return { success: false, content: null, error: `Gemini API error: ${response.status} ${errBody}`, provider: 'gemini', model };
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content || content.trim().length === 0) {
      return { success: false, content: null, error: 'Empty response from Gemini', provider: 'gemini', model };
    }

    return { success: true, content, provider: 'gemini', model };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown Gemini error';
    logError('ai-provider', `Gemini completion failed: ${msg}`, e);
    return { success: false, content: null, error: msg, provider: 'gemini', model };
  }
}

// ──────────────────────────────────────────────
// Anthropic (Claude)
// ──────────────────────────────────────────────

async function completeWithAnthropic(
  messages: ChatMessage[],
  apiKey: string,
  model: string,
): Promise<AICompletionResult> {
  try {
    // Convert to Anthropic format
    const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
    const chatMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role, content: m.content }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        system: systemPrompt,
        messages: chatMessages,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return { success: false, content: null, error: `Anthropic API error: ${response.status} ${errBody}`, provider: 'anthropic', model };
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content || content.trim().length === 0) {
      return { success: false, content: null, error: 'Empty response from Anthropic', provider: 'anthropic', model };
    }

    return { success: true, content, provider: 'anthropic', model };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown Anthropic error';
    logError('ai-provider', `Anthropic completion failed: ${msg}`, e);
    return { success: false, content: null, error: msg, provider: 'anthropic', model };
  }
}

// ──────────────────────────────────────────────
// Ollama (self-hosted)
// ──────────────────────────────────────────────

async function completeWithOllama(
  messages: ChatMessage[],
  baseUrl: string,
  model: string,
): Promise<AICompletionResult> {
  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream: false,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return { success: false, content: null, error: `Ollama API error: ${response.status} ${errBody}`, provider: 'ollama', model };
    }

    const data = await response.json();
    const content = data.message?.content;

    if (!content || content.trim().length === 0) {
      return { success: false, content: null, error: 'Empty response from Ollama', provider: 'ollama', model };
    }

    return { success: true, content, provider: 'ollama', model };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown Ollama error';
    logError('ai-provider', `Ollama completion failed: ${msg}`, e);
    return { success: false, content: null, error: msg, provider: 'ollama', model };
  }
}

// ──────────────────────────────────────────────
// Unified completion function
// ──────────────────────────────────────────────

/**
 * Send a chat completion request using the configured AI provider.
 * Falls back to z-ai if the configured provider fails.
 */
export async function aiComplete(
  messages: ChatMessage[],
  config: AIProviderConfig,
): Promise<AICompletionResult> {
  const provider = config.provider || 'z-ai';
  const model = config.model || DEFAULT_MODELS[provider];

  logInfo('ai-provider', `Using provider: ${provider}, model: ${model}`);

  switch (provider) {
    case 'z-ai':
      return completeWithZai(messages);

    case 'openai':
      if (!config.apiKey) {
        return { success: false, content: null, error: 'OpenAI API key required', provider: 'openai' };
      }
      return completeWithOpenAICompatible(messages, {
        apiKey: config.apiKey,
        baseUrl: 'https://api.openai.com/v1',
        model,
      }, 'openai');

    case 'deepseek':
      if (!config.apiKey) {
        return { success: false, content: null, error: 'DeepSeek API key required', provider: 'deepseek' };
      }
      return completeWithOpenAICompatible(messages, {
        apiKey: config.apiKey,
        baseUrl: 'https://api.deepseek.com/v1',
        model,
      }, 'deepseek');

    case 'openrouter':
      if (!config.apiKey) {
        return { success: false, content: null, error: 'OpenRouter API key required', provider: 'openrouter' };
      }
      return completeWithOpenAICompatible(messages, {
        apiKey: config.apiKey,
        baseUrl: 'https://openrouter.ai/api/v1',
        model,
      }, 'openrouter');

    case 'gemini':
      if (!config.apiKey) {
        return { success: false, content: null, error: 'Gemini API key required', provider: 'gemini' };
      }
      return completeWithGemini(messages, config.apiKey, model);

    case 'anthropic':
      if (!config.apiKey) {
        return { success: false, content: null, error: 'Anthropic API key required', provider: 'anthropic' };
      }
      return completeWithAnthropic(messages, config.apiKey, model);

    case 'ollama':
      const ollamaUrl = config.ollamaUrl || 'http://localhost:11434';
      return completeWithOllama(messages, ollamaUrl, model);

    default:
      return { success: false, content: null, error: `Unknown provider: ${provider}`, provider };
  }
}

/**
 * Send a chat completion with retry + fallback to z-ai.
 * Used by the coach for reliability — if the user's chosen provider
 * fails, we fall back to the default z-ai provider.
 */
export async function aiCompleteWithFallback(
  messages: ChatMessage[],
  config: AIProviderConfig,
  retries = 2,
): Promise<AICompletionResult> {
  let lastResult: AICompletionResult | null = null;

  // Try with configured provider (with retries)
  for (let attempt = 1; attempt <= retries; attempt++) {
    const result = await aiComplete(messages, config);
    if (result.success) return result;
    lastResult = result;

    logInfo('ai-provider', `Attempt ${attempt} failed with ${config.provider}: ${result.error}`);

    // Wait before retry (exponential backoff)
    if (attempt < retries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  // If configured provider is already z-ai, no fallback needed
  if (config.provider === 'z-ai') {
    return lastResult!;
  }

  // Fall back to z-ai
  logInfo('ai-provider', `Falling back to z-ai after ${config.provider} failed`);
  const fallbackResult = await completeWithZai(messages);
  if (fallbackResult.success) {
    fallbackResult.content = `[Fallback from ${config.provider}] ${fallbackResult.content}`;
    return fallbackResult;
  }

  // Both failed — return the original provider's error
  return lastResult!;
}

// ──────────────────────────────────────────────
// Provider metadata (for settings UI)
// ──────────────────────────────────────────────

export interface AIProviderInfo {
  name: AIProviderName;
  label: string;
  requiresApiKey: boolean;
  defaultModel: string;
  availableModels: string[];
  supportsOllamaUrl: boolean;
}

export const AI_PROVIDERS: AIProviderInfo[] = [
  {
    name: 'z-ai',
    label: 'MindGuard AI (Built-in)',
    requiresApiKey: false,
    defaultModel: 'default',
    availableModels: ['default'],
    supportsOllamaUrl: false,
  },
  {
    name: 'openai',
    label: 'OpenAI',
    requiresApiKey: true,
    defaultModel: 'gpt-4o-mini',
    availableModels: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    supportsOllamaUrl: false,
  },
  {
    name: 'deepseek',
    label: 'DeepSeek',
    requiresApiKey: true,
    defaultModel: 'deepseek-chat',
    availableModels: ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'],
    supportsOllamaUrl: false,
  },
  {
    name: 'openrouter',
    label: 'OpenRouter',
    requiresApiKey: true,
    defaultModel: 'openai/gpt-4o-mini',
    availableModels: ['openai/gpt-4o-mini', 'openai/gpt-4o', 'anthropic/claude-3-haiku', 'google/gemini-2.0-flash'],
    supportsOllamaUrl: false,
  },
  {
    name: 'gemini',
    label: 'Google Gemini',
    requiresApiKey: true,
    defaultModel: 'gemini-2.0-flash',
    availableModels: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    supportsOllamaUrl: false,
  },
  {
    name: 'anthropic',
    label: 'Anthropic (Claude)',
    requiresApiKey: true,
    defaultModel: 'claude-3-haiku-20240307',
    availableModels: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229', 'claude-3.5-sonnet-20241022'],
    supportsOllamaUrl: false,
  },
  {
    name: 'ollama',
    label: 'Ollama (Self-hosted)',
    requiresApiKey: false,
    defaultModel: 'llama3',
    availableModels: ['llama3', 'mistral', 'codellama', 'phi3', 'gemma2'],
    supportsOllamaUrl: true,
  },
];
