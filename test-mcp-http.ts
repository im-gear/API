import { createMcpServer } from './src/lib/mcp/server';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';

async function test() {
  const server = createMcpServer('test-site-id', 'test-user', 'test-instance');
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  
  const req = new Request('http://localhost:3000/api/mcp', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'webSearch',
        arguments: { query: 'test' }
      }
    })
  });
  
  const res = await transport.handleRequest(req, {
    parsedBody: await req.json()
  });
  
  console.log(res.status);
  console.log(await res.text());
}

test().catch(console.error);
