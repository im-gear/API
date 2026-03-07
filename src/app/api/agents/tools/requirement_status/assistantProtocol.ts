export function requirementStatusTool(site_id: string) {
  return {
    name: 'requirement_status',
    description: 'Updates or notifies the progress of a client requirement. Saves information in the requirement_status collection.',
    parameters: {
      type: 'object',
      properties: {
        instance_id: { type: 'string', description: 'ID of the related instance' },
        asset_id: { type: 'string', description: 'ID of the related asset' },
        requirement_id: { type: 'string', description: 'ID of the requirement to update' },
        repo_url: { type: 'string', description: 'URL of the related repository (optional)' },
        status: { type: 'string', description: 'Progress status (e.g. in-progress, completed, failed)' },
        message: { type: 'string', description: 'Message or detail of the progress' }
      },
      required: ['instance_id', 'asset_id', 'requirement_id', 'status']
    },
    execute: async (args: {
      instance_id: string;
      asset_id: string;
      requirement_id: string;
      repo_url?: string;
      status: string;
      message?: string;
    }) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      const res = await fetch(`${baseUrl}/api/agents/tools/requirement_status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...args,
          site_id
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update requirement status');
      }

      return data;
    }
  };
}
