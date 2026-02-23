/**
 * Assistant Protocol Wrapper for Conversations Tool
 * Read-only tool to list company conversations (support, chat, email, etc.)
 */

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export interface ConversationsToolParams {
  action: 'list';
  lead_id?: string;
  visitor_id?: string;
  user_id?: string;
  agent_id?: string;
  limit?: number;
  offset?: number;
}

export function conversationsTool(site_id: string, user_id?: string) {
  return {
    name: 'conversations',
    description:
      'List company conversations. Use action="list" to get conversations with optional filters (lead_id, visitor_id, user_id, agent_id). Use this to get context on support chats, email threads, and other customer interactions.',
    parameters: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['list'],
          description: 'Action to perform (list only).'
        },
        lead_id: { type: 'string', description: 'Filter by lead UUID' },
        visitor_id: { type: 'string', description: 'Filter by visitor UUID' },
        user_id: { type: 'string', description: 'Filter by user UUID' },
        agent_id: { type: 'string', description: 'Filter by agent UUID' },
        limit: { type: 'number', description: 'Max results (default 10)' },
        offset: { type: 'number', description: 'Pagination offset' }
      },
      required: ['action']
    },
    execute: async (args: ConversationsToolParams) => {
      const { action, ...params } = args;

      if (action !== 'list') {
        throw new Error(`Invalid action: ${action}`);
      }

      const searchParams = new URLSearchParams();
      searchParams.set('site_id', site_id);
      if (params.lead_id) searchParams.set('lead_id', params.lead_id);
      if (params.visitor_id) searchParams.set('visitor_id', params.visitor_id);
      const uid = params.user_id ?? user_id;
      if (uid) searchParams.set('user_id', uid);
      if (params.agent_id) searchParams.set('agent_id', params.agent_id);
      if (params.limit != null) searchParams.set('limit', String(params.limit));
      if (params.offset != null) searchParams.set('offset', String(params.offset));

      const res = await fetch(
        `${getApiBaseUrl()}/api/agents/customerSupport/conversations?${searchParams.toString()}`
      );
      const data = await res.json();

      if (!res.ok) {
        const err = data.error;
        const message = typeof err === 'object' && err?.message ? err.message : err ?? 'List conversations failed';
        const code = typeof err === 'object' && err?.code ? err.code : undefined;
        throw new Error(code ? `${code}: ${message}` : message);
      }

      return data?.data ?? data;
    }
  };
}
