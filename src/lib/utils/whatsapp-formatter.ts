/**
 * Converts standard Markdown to WhatsApp compatible formatting.
 * WhatsApp supports:
 * - *bold*
 * - _italic_
 * - ~strikethrough~
 * - ```code```
 */
export function formatMarkdownForWhatsApp(text: string): string {
  if (!text) return text;

  let formatted = text;

  // 1. Headers to Bold: # Header -> *Header*
  formatted = formatted.replace(/^#+\s+(.+)$/gm, '*$1*');

  // 2. Bold: **text** -> *text*
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '*$1*');

  // 3. Bold: __text__ -> *text*
  formatted = formatted.replace(/__(.*?)__/g, '*$1*');

  // 4. Links: [text](url) -> text: url
  formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '$1: $2');

  // 5. Strikethrough: ~~text~~ -> ~text~
  formatted = formatted.replace(/~~(.*?)~~/g, '~$1~');

  // 6. Unordered lists using asterisks: * item -> - item 
  // This avoids accidental bolding in WhatsApp when asterisks are used for lists
  formatted = formatted.replace(/^\*\s+/gm, '- ');

  // 7. Strip language from code blocks: ```json -> ```
  formatted = formatted.replace(/```[a-zA-Z0-9]+/g, '```');

  return formatted;
}
