import { listSystemNotificationCore, notifySystemNotificationCore } from './route';

export function systemNotificationTool(site_id: string) {
  return {
    name: 'system_notification',
    description: 'List team members or send a notification to a specific team member. Set action to "list" to list available team members. Set action to "notify" to send a notification (requires team_member_email, title, message; instance_id is optional but highly recommended). If they are registered and have a phone number, it is sent via WhatsApp and in-app; otherwise, it sends an email.',
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['list', 'notify'], description: 'Action to perform. "list" returns team members, "notify" sends a notification' },
        team_member_email: { type: 'string', description: 'Email address of the team member to notify (required for notify action)' },
        instance_id: { type: 'string', description: 'Instance ID to link in the notification (optional for notify action, but highly recommended)' },
        title: { type: 'string', description: 'Title of the notification (required for notify action)' },
        message: { type: 'string', description: 'Content of the message to notify (required for notify action)' }
      },
      required: ['action']
    },
    execute: async (args: {
      action: 'list' | 'notify';
      team_member_email?: string;
      instance_id?: string;
      title?: string;
      message?: string;
    }) => {
      const { action, ...params } = args;

      try {
        if (action === 'list') {
          const data = await listSystemNotificationCore(site_id);
          return { success: true, data };
        }

        if (action === 'notify') {
          if (!params.team_member_email || !params.message || !params.title) {
            throw new Error('team_member_email, message, and title are required for sending notifications');
          }
          const data = await notifySystemNotificationCore({
            site_id,
            team_member_email: params.team_member_email,
            instance_id: params.instance_id,
            message: params.message,
            title: params.title
          });
          return { success: true, data };
        }

        throw new Error(`Invalid action: ${action}`);
      } catch (error: any) {
        throw new Error(error.message || `Failed to execute system_notification tool for action ${action}`);
      }
    }
  };
}
