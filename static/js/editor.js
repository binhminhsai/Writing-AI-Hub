/**
 * Editor initialization and management
 * Sets up the Quill rich text editor and provides utility functions
 */

// Initialize Quill editor when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the editor with custom undo/redo buttons
    const quill = new Quill('#editor', {
        theme: 'snow',
        placeholder: 'Bắt đầu viết tại đây...',
        modules: {
            toolbar: '#editorToolbar'
        }
    });
    
    // Store the editor instance globally
    window.quillEditor = quill;
    
    // Add custom undo/redo functionality
    const undoButton = document.querySelector('.ql-undo');
    const redoButton = document.querySelector('.ql-redo');
    
    if (undoButton) {
        undoButton.addEventListener('click', () => {
            quill.history.undo();
        });
    }
    
    if (redoButton) {
        redoButton.addEventListener('click', () => {
            quill.history.redo();
        });
    }
    
    // Custom text counter to display word count (future feature)
    quill.on('text-change', function() {
        const text = quill.getText();
        const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        // Could update a word counter element here
    });
});

/**
 * Gets the current content from the Quill editor
 * @returns {string} HTML content of the editor
 */
function getEditorContent() {
    if (window.quillEditor) {
        return window.quillEditor.root.innerHTML;
    }
    return '';
}

/**
 * Gets the text content from the Quill editor (without HTML)
 * @returns {string} Text content of the editor
 */
function getEditorTextContent() {
    if (window.quillEditor) {
        return window.quillEditor.getText();
    }
    return '';
}

/**
 * Sets the content of the Quill editor
 * @param {string} content - HTML content to set
 */
function setEditorContent(content) {
    if (window.quillEditor) {
        window.quillEditor.root.innerHTML = content;
    }
}

/**
 * Clears the content of the Quill editor
 */
function clearEditor() {
    if (window.quillEditor) {
        window.quillEditor.setText('');
    }
}

/**
 * Enables the editor for writing
 */
function enableEditor() {
    const editorToolbar = document.getElementById('editorToolbar');
    if (editorToolbar) {
        editorToolbar.classList.remove('hidden');
    }
    
    if (window.quillEditor) {
        window.quillEditor.enable();
    }
}

/**
 * Disables the editor to prevent writing
 */
function disableEditor() {
    const editorToolbar = document.getElementById('editorToolbar');
    if (editorToolbar) {
        editorToolbar.classList.add('hidden');
    }
    
    if (window.quillEditor) {
        window.quillEditor.enable(false);
    }
}

/**
 * Focuses the cursor in the editor
 */
function focusEditor() {
    if (window.quillEditor) {
        window.quillEditor.focus();
    }
}
