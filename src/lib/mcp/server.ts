/**
 * Shared MCP server factory: builds a Server with tools/list and tools/call handlers
 * using getAssistantTools. Used by both stdio (mcp-server/index.ts) and HTTP (api/mcp/route.ts).
 */

import { getAssistantTools } from '@/app/api/robots/instance/assistant/utils';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { shouldUseRemoteApi } from '@/lib/mcp/remote-client';

export function getInputSchema(tool: {
  name: string;
  description?: string;
  parameters?: Record<string, unknown> | z.ZodType<unknown>;
}): Record<string, unknown> {
  const params = tool.parameters;
  if (!params) {
    return { type: 'object', properties: {} };
  }
  const isZod =
    typeof params === 'object' && params !== null && '_def' in params;
  if (isZod) {
    return zodToJsonSchema(params as z.ZodType<unknown>, {
      target: 'openApi3',
      $refStrategy: 'none',
    }) as Record<string, unknown>;
  }
  return (params as Record<string, unknown>) ?? { type: 'object', properties: {} };
}

/**
 * Creates an MCP Server with tools/list and tools/call handlers for the given context.
 */
export function createMcpServer(
  siteId: string,
  userId: string | undefined,
  instanceId: string,
  customTools: any[] = []
): Server {
  const tools = getAssistantTools(siteId, userId, instanceId, customTools);

  const server = new Server(
    {
      name: 'uncodie-tools',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    // 🌐 PROXY MODO REMOTO PARA LISTA DE HERRAMIENTAS
    if (shouldUseRemoteApi()) {
      try {
        const apiUrl = process.env.API_URL?.replace(/\/$/, '');
        if (!apiUrl) throw new Error('API_URL is missing but remote mode is enabled');
        
        const apiKey = process.env.REST_API_KEY;
        const url = `${apiUrl}/api/mcp`;
        
        console.error(`[MCP Remote] Proxying tools/list to ${url}`);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream',
            ...(apiKey ? { 'x-api-key': apiKey } : {})
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "tools/list",
            params: {}
          })
        });
        
        if (response.ok) {
          const json = await response.json();
          if (json.result) return json.result;
        }
      } catch (err) {
        console.error(`[MCP Remote] Failed to proxy tools/list, falling back to local list:`, err);
      }
    }

    return {
      tools: tools.map((tool) => ({
        name: tool.name,
        description: tool.description ?? '',
        inputSchema: getInputSchema(tool),
      })),
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    // 🌐 PROXY MODO REMOTO PARA EJECUCIÓN DE HERRAMIENTAS
    if (shouldUseRemoteApi()) {
      try {
        const apiUrl = process.env.API_URL?.replace(/\/$/, '');
        if (!apiUrl) throw new Error('API_URL is missing but remote mode is enabled');
        
        const apiKey = process.env.REST_API_KEY;
        const url = `${apiUrl}/api/mcp`;
        
        console.error(`[MCP Remote] Proxying execution of tool "${name}" to ${url}`);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream',
            ...(apiKey ? { 'x-api-key': apiKey } : {})
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 2,
            method: "tools/call",
            params: {
              name,
              arguments: args
            }
          })
        });
        
        if (!response.ok) {
           const errorText = await response.text();
           return {
             content: [{ type: 'text', text: `Remote MCP Error: ${response.status} ${response.statusText} - ${errorText}` }],
             isError: true
           };
        }
        
        const json = await response.json();
        if (json.error) {
           return {
             content: [{ type: 'text', text: json.error.message || JSON.stringify(json.error) }],
             isError: true
           };
        }
        
        return json.result;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: 'text', text: `Failed to execute remote tool ${name}: ${message}` }],
          isError: true,
        };
      }
    }

    // Lógica local normal
    const tool = tools.find((t) => t.name === name);
    if (!tool?.execute) {
      return {
        content: [{ type: 'text', text: `Unknown tool: ${name}` }],
        isError: true,
      };
    }
    try {
      const result = await tool.execute(args ?? {});
      return {
        content: [
          {
            type: 'text',
            text:
              typeof result === 'string' ? result : JSON.stringify(result),
          },
        ],
        isError: false,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: 'text', text: message }],
        isError: true,
      };
    }
  });

  return server;
}
