// Utility to count a character in a string
function countChar(str, char) {
  return [...str].filter(c => c === char).length;
}

/**
 * Cleans up the text to close unfinished Markdown elements.
 * - Closes a single unclosed backtick at the end.
 * - Closes unclosed bold/italic at the end.
 */
function completePartialElements(input) {
  let text = input;

  // --- Inline code (backticks) ---
  const backtickCount = countChar(text, '`');
  // Look for a single unclosed backtick after some text
  if (backtickCount === 1 && /`[^`]*$/.test(text)) {
    text += '`'; // auto-close it
  }

  // --- Unclosed strong/italic (asterisks) ---
  // Match at the end: *, **, ***, _, __, ___ NOT followed by same character(s)
  const emphasisMatch = text.match(/(\*{1,3}|_{1,3})([^*_]+)$/);
  if (emphasisMatch) {
    const mark = emphasisMatch[1];
    // Only auto-close if there's an odd number of markers (unclosed)
    const closing = mark;
    text += closing;
  }

  return text;
}

/**
 * Enhanced function to safely handle partial markdown content during streaming
 * Combines the existing code block handling with the new partial element completion
 */
function getSafePartialContent(content, isStreaming) {
  let safeContent = content;

  // First, handle code blocks (existing logic)
  const codeBlockMatches = (safeContent.match(/```/g) || []).length;
  if (codeBlockMatches % 2 === 1) {
    safeContent += '\n```';
  }

  // Then, complete partial markdown elements
  safeContent = completePartialElements(safeContent);

  // Add streaming cursor if streaming
  if (isStreaming) {
    safeContent += '\n▍';
  }

  return safeContent;
}

export { countChar, completePartialElements, getSafePartialContent }; 