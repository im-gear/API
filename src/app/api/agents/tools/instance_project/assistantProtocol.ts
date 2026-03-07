import { supabaseAdmin } from '@/lib/database/supabase-client';

export interface InstanceProjectParams {
  action: 'list' | 'set';
  site_id?: string;
}

export function instanceProjectTool(userId?: string | null, phone?: string) {
  return {
    name: 'instance_project',
    description: 'List available projects for the user or set the active project to work on.',
    parameters: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['list', 'set'],
          description: 'The action to perform: "list" to get all available projects, "set" to select one to work on.'
        },
        site_id: {
          type: 'string',
          description: 'The ID of the project to set as active (required if action is "set").'
        }
      },
      required: ['action']
    },
    execute: async (args: InstanceProjectParams) => {
      const { action, site_id } = args;
      try {
        if (!userId) {
          return {
            success: false,
            error: 'You are not logged in. Cannot manage projects.',
          };
        }

        if (action === 'list') {
          // Obtener todos los sitios pertenecientes a este usuario (como owner)
          const { data: userSites } = await supabaseAdmin
            .from('sites')
            .select('id, name')
            .eq('user_id', userId);

          // Obtener todos los sitios donde este usuario es miembro
          const { data: memberSites } = await supabaseAdmin
            .from('site_members')
            .select('site_id, sites:site_id(id, name)')
            .eq('user_id', userId);

          // Combinar y deduplicar sitios
          const allSites = new Map<string, { id: string, name: string }>();
          
          if (userSites) {
            userSites.forEach(site => allSites.set(site.id, site));
          }
          
          if (memberSites) {
            memberSites.forEach(member => {
              const siteData: any = member.sites;
              if (siteData && siteData.id) {
                allSites.set(siteData.id, { id: siteData.id, name: siteData.name });
              }
            });
          }

          const availableSites = Array.from(allSites.values());

          return {
            success: true,
            projects: availableSites,
          };
        } else if (action === 'set' && site_id) {
          // Verify user has access to this site
          const { data: ownerAccess } = await supabaseAdmin
            .from('sites')
            .select('id')
            .eq('id', site_id)
            .eq('user_id', userId)
            .maybeSingle();

          const { data: memberAccess } = await supabaseAdmin
            .from('site_members')
            .select('site_id')
            .eq('site_id', site_id)
            .eq('user_id', userId)
            .maybeSingle();

          if (!ownerAccess && !memberAccess) {
            return {
              success: false,
              error: 'You do not have access to this project.',
            };
          }

          if (!phone) {
             return {
              success: false,
              error: 'Missing phone number to set active project session.',
            };
          }

          // Upsert en remote_sessions
          // Si cambian de proyecto, limpiamos el instance_id para que se genere uno nuevo con el contexto correcto
          const { error } = await supabaseAdmin.from('remote_sessions').upsert({
            phone_number: phone,
            user_id: userId,
            site_id: site_id,
            instance_id: null
          }, { onConflict: 'phone_number' });

          if (error) {
            return {
              success: false,
              error: 'Failed to update active project in database.',
            };
          }

          return {
            success: true,
            message: `Project ${site_id} is now set as your active project. For the next messages, I will assist you within the context of this project.`,
          };
        }

        return {
          success: false,
          error: 'Invalid action or missing parameters.',
        };
      } catch (err: any) {
        return {
          success: false,
          error: `Error: ${err.message}`,
        };
      }
    }
  };
}
