'use workflow';

import { runAssistantWorkflow } from '@/app/api/robots/instance/assistant/workflow';
import { WhatsAppSendService } from '@/lib/services/whatsapp/WhatsAppSendService';
import { instanceProjectTool, createAccountTool, verifyAccountTool } from './tools';

interface GearAgentWorkflowInput {
  instanceId: string;
  message: string;
  siteId: string;
  userId: string;
  userPhone: string;
  customTools?: any[];
  useSdkTools?: boolean;
  systemPrompt?: string;
}

export async function runGearAgentWorkflow({
  instanceId,
  message,
  siteId,
  userId,
  userPhone,
  customTools = [],
  useSdkTools = false,
  systemPrompt
}: GearAgentWorkflowInput) {
  'use workflow';

  console.log(`[GearAgent] Starting workflow for user ${userId} (${userPhone}) on instance ${instanceId}`);

  try {
    // Add Gear Agent specific tools
    const gearTools = [
      instanceProjectTool(userId),
      createAccountTool(),
      verifyAccountTool()
    ];

    // Merge with customTools
    const allTools = [...customTools, ...gearTools];

    // Execute the assistant workflow
    const result = await runAssistantWorkflow(
      instanceId,
      message,
      siteId,
      userId,
      allTools,
      useSdkTools,
      systemPrompt
    );

    console.log(`[GearAgent] Assistant execution completed. Response length: ${result.assistant_response?.length || 0}`);

    if (result.assistant_response) {
      // Send the response back to WhatsApp
      console.log(`[GearAgent] Sending response to WhatsApp: ${userPhone}`);
      
      await WhatsAppSendService.sendMessage({
        phone_number: userPhone,
        message: result.assistant_response,
        site_id: siteId,
        // We don't need agent_id or conversation_id here necessarily, 
        // but we could pass them if we had them.
        // For now, we rely on the phone number.
        responseWindowEnabled: true // Force response window check to be skipped or handled gracefully
      });

      console.log(`[GearAgent] Response sent to WhatsApp successfully`);
    } else {
      console.warn(`[GearAgent] No assistant response generated`);
    }

    return {
      success: true,
      assistant_response: result.assistant_response,
      instance_id: instanceId
    };

  } catch (error: any) {
    console.error(`[GearAgent] Workflow failed:`, error);
    
    // Attempt to send error message to user
    try {
      await WhatsAppSendService.sendMessage({
        phone_number: userPhone,
        message: "I'm sorry, I encountered an error processing your request.",
        site_id: siteId,
        responseWindowEnabled: true
      });
    } catch (sendError) {
      console.error(`[GearAgent] Failed to send error message:`, sendError);
    }

    throw error;
  }
}
