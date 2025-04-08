/**
 * Editor functionality for WritingAI Hub
 * Provides text formatting features for the writing area
 */

document.addEventListener('DOMContentLoaded', () => {
  // Get references to editor elements
  const writingArea = document.getElementById('writing-area');
  const boldBtn = document.getElementById('boldBtn');
  const italicBtn = document.getElementById('italicBtn');
  const underlineBtn = document.getElementById('underlineBtn');
  const bulletBtn = document.getElementById('bulletBtn');
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  const styleSelect = document.getElementById('styleSelect');

  // Track undo/redo history
  const undoStack = [];
  const redoStack = [];
  let lastSavedValue = "";

  // Save current state for undo
  function saveState() {
    if (writingArea.value !== lastSavedValue) {
      undoStack.push(lastSavedValue);
      lastSavedValue = writingArea.value;
      redoStack.length = 0; // Clear redo stack
    }
  }

  // Initialize state
  if (writingArea) {
    lastSavedValue = writingArea.value;
    writingArea.addEventListener('input', saveState);
  }

  // Helper function to get selected text and position
  function getSelectionInfo() {
    if (!writingArea) return null;
    
    const start = writingArea.selectionStart;
    const end = writingArea.selectionEnd;
    const selectedText = writingArea.value.substring(start, end);
    
    return {
      start,
      end,
      selectedText,
      fullText: writingArea.value
    };
  }

  // Apply formatting to selection
  function applyFormatting(prefix, suffix = prefix) {
    if (!writingArea) return;
    
    const selInfo = getSelectionInfo();
    if (!selInfo) return;
    
    saveState();
    
    // Replace the selection with the formatted text
    const formattedText = prefix + selInfo.selectedText + suffix;
    writingArea.value = 
      selInfo.fullText.substring(0, selInfo.start) + 
      formattedText + 
      selInfo.fullText.substring(selInfo.end);
    
    // Restore selection with formatting
    writingArea.selectionStart = selInfo.start + prefix.length;
    writingArea.selectionEnd = selInfo.start + prefix.length + selInfo.selectedText.length;
    writingArea.focus();
  }

  // Add bullet points to selected lines
  function addBulletPoints() {
    if (!writingArea) return;
    
    const selInfo = getSelectionInfo();
    if (!selInfo) return;
    
    saveState();
    
    // Split the selected text into lines and add bullets
    const lines = selInfo.selectedText.split('\n');
    const bulleted = lines.map(line => line.trim() ? '• ' + line : line).join('\n');
    
    writingArea.value = 
      selInfo.fullText.substring(0, selInfo.start) + 
      bulleted + 
      selInfo.fullText.substring(selInfo.end);
    
    writingArea.selectionStart = selInfo.start;
    writingArea.selectionEnd = selInfo.start + bulleted.length;
    writingArea.focus();
  }

  // Apply heading style to selected text
  function applyStyle(style) {
    if (!writingArea) return;
    
    const selInfo = getSelectionInfo();
    if (!selInfo || !selInfo.selectedText) return;
    
    saveState();
    
    let formattedText = selInfo.selectedText;
    
    switch (style) {
      case 'heading':
        formattedText = '# ' + formattedText;
        break;
      case 'subheading':
        formattedText = '## ' + formattedText;
        break;
      default:
        // Normal style, no changes
        break;
    }
    
    writingArea.value = 
      selInfo.fullText.substring(0, selInfo.start) + 
      formattedText + 
      selInfo.fullText.substring(selInfo.end);
    
    writingArea.selectionStart = selInfo.start;
    writingArea.selectionEnd = selInfo.start + formattedText.length;
    writingArea.focus();
    
    // Reset style select to default
    if (styleSelect) styleSelect.value = 'normal';
  }

  // Undo last action
  function undo() {
    if (undoStack.length > 0) {
      redoStack.push(writingArea.value);
      writingArea.value = undoStack.pop();
      lastSavedValue = writingArea.value;
    }
  }

  // Redo last undone action
  function redo() {
    if (redoStack.length > 0) {
      undoStack.push(writingArea.value);
      writingArea.value = redoStack.pop();
      lastSavedValue = writingArea.value;
    }
  }

  // Attach event listeners to buttons
  if (boldBtn) {
    boldBtn.addEventListener('click', () => applyFormatting('**'));
  }
  
  if (italicBtn) {
    italicBtn.addEventListener('click', () => applyFormatting('*'));
  }
  
  if (underlineBtn) {
    underlineBtn.addEventListener('click', () => applyFormatting('<u>', '</u>'));
  }
  
  if (bulletBtn) {
    bulletBtn.addEventListener('click', addBulletPoints);
  }
  
  if (undoBtn) {
    undoBtn.addEventListener('click', undo);
  }
  
  if (redoBtn) {
    redoBtn.addEventListener('click', redo);
  }
  
  if (styleSelect) {
    styleSelect.addEventListener('change', () => {
      applyStyle(styleSelect.value);
    });
  }
});