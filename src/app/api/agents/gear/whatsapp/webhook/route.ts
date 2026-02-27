import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/database/supabase-client';
import { start } from 'workflow/api';
import { runGearAgentWorkflow } from '../workflow';

// ------------------------------------------------------------------------------------
// GET /api/agents/gear/whatsapp/webhook
// Webhook verification for WhatsApp
// ------------------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
    
    if (!verifyToken) {
      console.error('❌ WHATSAPP_WEBHOOK_VERIFY_TOKEN environment variable is not configured');
      return new NextResponse('Verification token not configured', { status: 500 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');
    
    console.log(`🔄 Verificación de webhook WhatsApp (Gear): mode=${mode}, token=${token ? 'provided' : 'missing'}`);
    
    if (mode === 'subscribe' && token === verifyToken && challenge) {
      console.log('✅ Verificación de webhook de WhatsApp (Gear) exitosa');
      return new NextResponse(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
    
    console.warn('❌ Verificación de webhook de WhatsApp (Gear) fallida');
    return new NextResponse('Verification Failed', { status: 403 });
  } catch (error) {
    console.error('❌ Error durante la verificación del webhook de WhatsApp (Gear):', error);
    return new NextResponse('Error', { status: 500 });
  }
}

// ------------------------------------------------------------------------------------
// POST /api/agents/gear/whatsapp/webhook
// Handle incoming messages
// ------------------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    console.log('📩 Webhook de WhatsApp (Gear) recibido');
    
    const body = await request.json();
    
    if (!body.object || !body.entry || !Array.isArray(body.entry)) {
      return NextResponse.json({ success: false, error: 'Invalid webhook format' }, { status: 400 });
    }
    
    for (const entry of body.entry) {
      if (!entry.changes || !Array.isArray(entry.changes)) continue;
      
      for (const change of entry.changes) {
        if (change.field !== 'messages') continue;
        
        const businessAccountId = change.value?.metadata?.phone_number_id;
        
        if (change.value?.messages && Array.isArray(change.value.messages)) {
          for (const message of change.value.messages) {
            if (message.from && message.type === 'text') { // Only text for now
              const phoneNumber = message.from;
              const messageContent = message.text.body;
              
              console.log(`📥 Procesando mensaje de WhatsApp (Gear) de ${phoneNumber}: ${messageContent.substring(0, 50)}...`);
              
              // 1. Find Site ID based on Business Account ID
              // We search in settings -> channels -> whatsapp -> account_sid
              // Note: This assumes the account_sid is stored in settings.
              // If not found, we might need a fallback or hardcoded site ID.
              // For "Makinari", we might want to look up by name if account_sid fails.
              
              let siteId: string | null = null;
              
              // Try to find site by account_sid in settings
              if (businessAccountId) {
                // Let's try the JSONB contains query
                const { data: siteBySettings, error: siteError } = await supabaseAdmin
                  .from('settings')
                  .select('site_id')
                  .contains('channels', { whatsapp: { account_sid: businessAccountId } })
                  .maybeSingle();
                  
                if (siteBySettings) {
                  siteId = siteBySettings.site_id;
                  console.log(`✅ Encontrado site_id por account_sid: ${siteId}`);
                }
              }
              
              // Fallback: Find site by name "Makinari" (or similar)
              if (!siteId) {
                const { data: siteByName, error: nameError } = await supabaseAdmin
                  .from('sites')
                  .select('id')
                  .ilike('name', '%Makinari%')
                  .limit(1)
                  .maybeSingle();
                  
                if (siteByName) {
                  siteId = siteByName.id;
                  console.log(`⚠️ Usando site_id por nombre "Makinari": ${siteId}`);
                }
              }
              
              if (!siteId) {
                console.error('❌ No se pudo encontrar un site_id válido para el agente Gear');
                continue; 
              }
              
              // 2. Find User ID based on Phone Number
              // We search in users table or create a new user/visitor?
              // For "manage our own agent", we expect users to be registered.
              // Let's search for a user with this phone number in metadata.
              
              let userId: string | null = null;
              
              // Search in users table (assuming phone is stored in metadata or phone column)
              // Supabase Auth users are in auth.users, but we can't query that easily from here without admin API.
              // We usually have a public users table or profiles table.
              // Let's check `users` table in public schema if it exists, or `visitors`.
              
              // Try to find a visitor first (visitors table usually has custom_data->whatsapp_phone)
              const { data: visitor, error: visitorError } = await supabaseAdmin
                .from('visitors')
                .select('id, user_id') // Assuming visitors might be linked to users
                .contains('custom_data', { whatsapp_phone: phoneNumber })
                .maybeSingle();
                
              if (visitor && visitor.user_id) {
                userId = visitor.user_id;
              } else {
                // If no user found, maybe we should create a temporary user or just use the visitor ID as user ID?
                // The robot/instance logic expects a UUID for user_id.
                // Let's try to find a user in `users` table if it exists (often a copy of auth.users)
                // If not, we might need to create a "shadow" user.
                
                // For now, let's assume we can use the visitor ID if it's a UUID, or create a new user.
                // But `robot/instance` expects `user_id` to be a UUID.
                // Let's try to find a user by email if we can't find by phone? No email.
                
                // Let's create a "Gear User" if not found?
                // Or just use the site's owner user_id?
                // The user said "manage our own agent".
                // Maybe we use the site owner's user_id?
                
                const { data: site, error: siteOwnerError } = await supabaseAdmin
                  .from('sites')
                  .select('user_id')
                  .eq('id', siteId)
                  .single();
                  
                if (site) {
                  userId = site.user_id; // Use site owner as fallback
                  console.log(`⚠️ Usando user_id del dueño del sitio: ${userId}`);
                }
              }
              
              if (!userId) {
                console.error('❌ No se pudo encontrar un user_id válido');
                continue;
              }
              
              // 3. Find/Create Instance
              // We look for an instance for this user and site.
              // We prefer an instance named "Gear Assistant" or similar.
              
              let instanceId: string | null = null;
              
              const { data: instances, error: instanceError } = await supabaseAdmin
                .from('remote_instances')
                .select('id')
                .eq('site_id', siteId)
                .eq('user_id', userId)
                .eq('status', 'running') // Prefer running instances
                .order('created_at', { ascending: false })
                .limit(1);
                
              if (instances && instances.length > 0) {
                instanceId = instances[0].id;
                console.log(`✅ Usando instancia existente: ${instanceId}`);
              } else {
                // Create new instance
                console.log('🆕 Creando nueva instancia para Gear Agent');
                const { data: newInstance, error: createError } = await supabaseAdmin
                  .from('remote_instances')
                  .insert({
                    site_id: siteId,
                    user_id: userId,
                    name: 'Gear Assistant (WhatsApp)',
                    instance_type: 'ubuntu', // Or 'assistant'?
                    status: 'uninstantiated', // Will be started by workflow
                    created_by: userId
                  })
                  .select('id')
                  .single();
                  
                if (newInstance) {
                  instanceId = newInstance.id;
                  console.log(`✅ Nueva instancia creada: ${instanceId}`);
                }
              }
              
              if (!instanceId) {
                console.error('❌ No se pudo obtener/crear una instancia');
                continue;
              }
              
              // 4. Trigger Workflow
              console.log(`🚀 Iniciando workflow GearAgent para ${phoneNumber}...`);
              
              await start(runGearAgentWorkflow, {
                instanceId,
                message: messageContent,
                siteId,
                userId,
                userPhone: phoneNumber,
                customTools: [], // Default tools
                useSdkTools: false
              });
              
              console.log('✅ Workflow iniciado');
            }
          }
        }
      }
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('❌ Error al procesar webhook de WhatsApp (Gear):', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
