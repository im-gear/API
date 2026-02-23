/**
 * Assistant Protocol Wrapper for Messages Tool
 * Read-only tool to list messages, optionally filtered by conversation or site-wide.
 */

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export interface MessagesToolParams {
  action: 'list';
  conversation_id?: string;
  limit?: number;
  offset?: number;
}

export function messagesTool(site_id: string) {
  return {
    name: 'messages',
    description:
      'List messages. Use action="list" to get messages. Optionally pass conversation_id to filter by one conversation; when omitted, returns recent messages across the whole site. Each message in the response includes conversation_id when available (optional field per message).',
    parameters: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['list'],
          description: 'Action to perform (list only).'
        },
        conversation_id: {
          type: 'string',
          description: 'Optional. Filter messages by conversation UUID. If omitted, returns recent messages for the entire site. Response messages still include conversation_id per message when available.'
        },
        limit: { type: 'number', description: 'Max results (default 50)' },
        offset: { type: 'number', description: 'Pagination offset' }
      },
      required: ['action']
    },
    execute: async (args: MessagesToolParams) => {
      const { action, ...params } = args;

      if (action !== 'list') {
        throw new Error(`Invalid action: ${action}`);
      }

      const searchParams = new URLSearchParams();
      searchParams.set('site_id', site_id);
      if (params.conversation_id) searchParams.set('conversation_id', params.conversation_id);
      if (params.limit != null) searchParams.set('limit', String(params.limit));
      if (params.offset != null) searchParams.set('offset', String(params.offset));

      const res = await fetch(
        `${getApiBaseUrl()}/api/agents/customerSupport/conversations/messages?${searchParams.toString()}`
      );
      const data = await res.json();

      if (!res.ok) {
        const err = data.error;
        const message = typeof err === 'object' && err?.message ? err.message : err ?? 'List messages failed';
        const code = typeof err === 'object' && err?.code ? err.code : undefined;
        throw new Error(code ? `${code}: ${message}` : message);
      }

      return data?.data ?? data;
    }
  };
}
