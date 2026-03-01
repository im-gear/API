'use step';

import { WhatsAppSendService } from '@/lib/services/whatsapp/WhatsAppSendService';

export async function sendWhatsAppResponse(
  userPhone: string,
  message: string,
  siteId: string
) {
  'use step';
  
  console.log(`[GearAgent] Sending response to WhatsApp: ${userPhone}`);
  
  await WhatsAppSendService.sendMessage({
    phone_number: userPhone,
    message: message,
    site_id: siteId,
    responseWindowEnabled: true
  });

  console.log(`[GearAgent] Response sent to WhatsApp successfully`);
  return true;
}

export async function sendWhatsAppError(
  userPhone: string,
  siteId: string
) {
  'use step';
  
  try {
    await WhatsAppSendService.sendMessage({
      phone_number: userPhone,
      message: "I'm sorry, I encountered an error processing your request.",
      site_id: siteId,
      responseWindowEnabled: true
    });
    return true;
  } catch (sendError) {
    console.error(`[GearAgent] Failed to send error message:`, sendError);
    return false;
  }
}
