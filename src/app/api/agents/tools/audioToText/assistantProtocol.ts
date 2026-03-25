import { z } from 'zod';
import OpenAI from 'openai';
import { CreditService } from '@/lib/services/billing/CreditService';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AudioToTextToolParams {
  audio_url: string;
}

export function audioToTextTool(site_id?: string) {
  return {
    name: 'audio_to_text',
    description: 'Converts an audio file from a given URL to text using AI. Supported formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm. Use this to transcribe voice notes, audio files, or extract text from videos.',
    parameters: {
      type: 'object',
      properties: {
        audio_url: {
          type: 'string',
          description: 'The valid public URL of the audio file to transcribe.'
        }
      },
      required: ['audio_url']
    },
    execute: async (args: AudioToTextToolParams) => {
      try {
        console.log(`[AudioToTextTool] Fetching audio from: ${args.audio_url}`);
        
        if (site_id) {
          const requiredCredits = CreditService.PRICING.AUDIO_TRANSCRIPTION;
          const hasCredits = await CreditService.validateCredits(site_id, requiredCredits);
          if (!hasCredits) {
            throw new Error('Insufficient credits for audio transcription');
          }
          await CreditService.deductCredits(site_id, requiredCredits, 'audio_transcription', 'Audio transcription via AI', { audio_url: args.audio_url });
        }

        const headers = new Headers();
        
        // Si la URL es de Twilio, necesitamos autenticarnos
        if (args.audio_url.includes('api.twilio.com')) {
           const accountSid = process.env.GEAR_TWILIO_ACCOUNT_SID;
           const authToken = process.env.GEAR_TWILIO_AUTH_TOKEN;
           if (accountSid && authToken) {
              headers.set('Authorization', `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`);
           }
        }

        let response = await fetch(args.audio_url, { headers, redirect: 'manual' });
        
        // Manejar la redirección de Twilio a S3
        if (response.status >= 300 && response.status < 400 && response.headers.has('location')) {
           const redirectUrl = response.headers.get('location')!;
           response = await fetch(redirectUrl);
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = response.headers.get('content-type') || 'audio/mp3';

        let transcriptionText = '';
        let success = false;
        let lastError: any = null;

        // Try Gemini 1.5 Pro first if available (supports native audio transcription)
        if (process.env.GEMINI_API_KEY && !success) {
          try {
            console.log(`[AudioToTextTool] Attempting transcription via Gemini...`);
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
            
            const result = await model.generateContent([
              "Please transcribe this audio exactly as spoken, without adding any commentary or extra text.",
              {
                inlineData: {
                  mimeType: contentType,
                  data: buffer.toString("base64")
                }
              }
            ]);
            
            transcriptionText = result.response.text();
            success = true;
            console.log(`[AudioToTextTool] Gemini transcription successful.`);
          } catch (err: any) {
            console.warn(`[AudioToTextTool] Gemini failed: ${err.message}`);
            lastError = err;
          }
        }

        // Fallback to OpenAI (via Vercel AI Gateway or direct)
        if (!success) {
          try {
            console.log(`[AudioToTextTool] Attempting transcription via OpenAI Whisper...`);
            const baseURL = process.env.VERCEL_AI_GATEWAY_OPENAI || (process.env.VERCEL_AI_GATEWAY ? `${process.env.VERCEL_AI_GATEWAY}/openai` : undefined);
            const apiKey = process.env.VERCEL_AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY;
            
            if (!apiKey) throw new Error('No OpenAI or Vercel AI Gateway API key configured');

            const openai = new OpenAI({ apiKey, baseURL });
            // Necesitamos asegurarnos de que la extensión sea válida para Whisper.
            // Whisper soporta: mp3, mp4, mpeg, mpga, m4a, wav, webm, ogg
            let fileExt = 'mp3';
            const contentTypeLower = contentType.toLowerCase();
            if (contentTypeLower.includes('ogg')) fileExt = 'ogg';
            else if (contentTypeLower.includes('wav')) fileExt = 'wav';
            else if (contentTypeLower.includes('webm')) fileExt = 'webm';
            else if (contentTypeLower.includes('mp4')) fileExt = 'mp4';
            else if (contentTypeLower.includes('m4a')) fileExt = 'm4a';

            // IMPORTANT: Vercel AI Gateway might not support the /audio/transcriptions endpoint directly
            // or might have issues with the file upload format. We'll use the direct OpenAI API
            // if we encounter the specific 404 error for the audio endpoint.
            const directOpenai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const useClient = baseURL ? openai : directOpenai;

            const file = await OpenAI.toFile(buffer, `audio.${fileExt}`, { type: contentType });
            
            try {
              const transcription = await useClient.audio.transcriptions.create({
                file: file,
                model: 'whisper-1',
              });
              transcriptionText = transcription.text;
              success = true;
              console.log(`[AudioToTextTool] OpenAI Whisper transcription successful.`);
            } catch (err: any) {
              // If we used the gateway and it failed with a 404 for the endpoint, retry directly with OpenAI
              if (useClient !== directOpenai && err.message && err.message.includes('not found')) {
                console.log(`[AudioToTextTool] Gateway failed with 404, retrying directly with OpenAI...`);
                const directTranscription = await directOpenai.audio.transcriptions.create({
                  file: file,
                  model: 'whisper-1',
                });
                transcriptionText = directTranscription.text;
                success = true;
                console.log(`[AudioToTextTool] Direct OpenAI Whisper transcription successful.`);
              } else {
                throw err;
              }
            }
          } catch (err: any) {
            console.warn(`[AudioToTextTool] OpenAI failed: ${err.message}`);
            lastError = err;
          }
        }

        if (!success) {
          throw new Error(`All audio transcription providers failed. Last error: ${lastError?.message}`);
        }
        
        return {
          success: true,
          text: transcriptionText
        };
      } catch (error: any) {
        console.error(`[AudioToTextTool] Error:`, error);
        return {
          success: false,
          error: error.message || 'Unknown error occurred during transcription'
        };
      }
    }
  };
}
