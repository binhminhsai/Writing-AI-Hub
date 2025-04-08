/**
 * WritingAI Hub Main JavaScript
 * Handles the application's core functionality including:
 * - UI interactions
 * - Timer management
 * - API communication
 * - Resource display
 */

// Global state variables
let isWritingStarted = false;
let timerInterval = null;
let startTime = null;
let currentSessionData = {
    topic: '',
    level: '',
    task: '',
    resources: null
};

// DOM elements
const elements = {
    // Main buttons and controls
    startWritingBtn: document.getElementById('startWritingBtn'),
    randomTopicBtn: document.getElementById('randomTopicBtn'),
    topicInput: document.getElementById('topicInput'),
    taskType: document.getElementById('taskType'),
    difficultyLevel: document.getElementById('difficultyLevel'),
    
    // Display areas
    timerDisplay: document.getElementById('timerDisplay'),
    timer: document.getElementById('timer'),
    promptDisplay: document.getElementById('promptDisplay'),
    promptText: document.getElementById('promptText'),
    resourcesSection: document.getElementById('resourcesSection'),
    
    // Resource tabs
    outlineTab: document.getElementById('outlineTab'),
    vocabTab: document.getElementById('vocabTab'),
    sentenceTab: document.getElementById('sentenceTab'),
    
    // Resource content areas
    outlineContent: document.getElementById('outlineContent'),
    vocabContent: document.getElementById('vocabContent'),
    sentenceContent: document.getElementById('sentenceContent'),
    
    // UI elements
    loadingIndicator: document.getElementById('loadingIndicator'),
    successToast: document.getElementById('successToast'),
    toastMessage: document.getElementById('toastMessage'),
    
    // Theme toggle
    themeToggle: document.getElementById('themeToggle')
};

/**
 * Initializes the application
 */
function initApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Initial UI state
    disableEditor();
}

/**
 * Sets up event listeners for interactive elements
 */
function setupEventListeners() {
    // Start/Submit button
    elements.startWritingBtn.addEventListener('click', handleStartWriting);
    
    // Random topic generation
    elements.randomTopicBtn.addEventListener('click', generateRandomTopic);
    
    // Topic input - press Enter to start
    elements.topicInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleStartWriting();
        }
    });
    
    // Resource tabs
    elements.outlineTab.addEventListener('click', () => switchResourceTab('outline'));
    elements.vocabTab.addEventListener('click', () => switchResourceTab('vocab'));
    elements.sentenceTab.addEventListener('click', () => switchResourceTab('sentence'));
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
}

/**
 * Handles the start writing button click
 * Changes functionality based on current state (start or submit)
 */
function handleStartWriting() {
    if (!isWritingStarted) {
        // Start writing mode
        startWritingSession();
    } else {
        // Submit essay
        submitEssay();
    }
}

/**
 * Starts a new writing session
 * - Validates input
 * - Generates resources
 * - Sets up UI for writing
 */
async function startWritingSession() {
    const topic = elements.topicInput.value.trim();
    const level = elements.difficultyLevel.value;
    const task = elements.taskType.value;
    
    // Save current session data
    currentSessionData.topic = topic;
    currentSessionData.level = level;
    currentSessionData.task = task;
    
    // Show loading indicator with GenZ animations
    elements.loadingIndicator.classList.remove('hidden');
    startLoadingAnimation();
    
    try {
        // Generate writing resources from API
        const resources = await generateWritingResources(topic, level, task);
        
        // Store resources
        currentSessionData.resources = resources;
        
        // Set up writing interface
        setupWritingInterface(resources);
        
        // Update UI state
        isWritingStarted = true;
        elements.startWritingBtn.textContent = 'Nộp bài';
        elements.startWritingBtn.classList.remove('bg-ueh-green', 'hover:bg-green-700');
        elements.startWritingBtn.classList.add('bg-ueh-orange', 'hover:bg-orange-600');
        
        // Start timer
        startTimer();
        
        // Enable editor
        enableEditor();
        focusEditor();
        
    } catch (error) {
        console.error('Error starting writing session:', error);
        showToast('Có lỗi xảy ra khi tạo bài viết. Vui lòng thử lại!', 'error');
    } finally {
        // Hide loading indicator and stop animation
        stopLoadingAnimation();
        elements.loadingIndicator.classList.add('hidden');
    }
}

/**
 * Submits the completed essay
 */
async function submitEssay() {
    // Get the essay content
    const essay = getEditorContent();
    
    // Prepare metadata
    const metadata = {
        topic: currentSessionData.topic,
        level: currentSessionData.level,
        task: currentSessionData.task,
        timeSpent: elements.timer.textContent
    };
    
    // Show loading indicator with GenZ animations
    elements.loadingIndicator.classList.remove('hidden');
    startLoadingAnimation();
    
    try {
        // Submit to API
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                essay,
                metadata
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'submitted') {
            // Show success message
            showToast('Bài viết đã được lưu thành công!', 'success');
            
            // Reset writing session
            resetWritingSession();
        } else {
            // Show error message
            showToast('Có lỗi xảy ra khi lưu bài viết. Vui lòng thử lại!', 'error');
        }
    } catch (error) {
        console.error('Error submitting essay:', error);
        showToast('Có lỗi xảy ra khi lưu bài viết. Vui lòng thử lại!', 'error');
    } finally {
        // Hide loading indicator and stop animation
        stopLoadingAnimation();
        elements.loadingIndicator.classList.add('hidden');
    }
}

/**
 * Resets the writing session to its initial state
 */
function resetWritingSession() {
    // Stop timer
    clearInterval(timerInterval);
    
    // Reset UI state
    isWritingStarted = false;
    elements.startWritingBtn.textContent = 'Bắt đầu làm bài';
    elements.startWritingBtn.classList.remove('bg-ueh-orange', 'hover:bg-orange-600');
    elements.startWritingBtn.classList.add('bg-ueh-green', 'hover:bg-green-700');
    
    // Hide writing components
    elements.timerDisplay.classList.add('hidden');
    elements.promptDisplay.classList.add('hidden');
    elements.resourcesSection.classList.add('hidden');
    
    // Disable editor
    disableEditor();
    clearEditor();
    
    // Reset current session data
    currentSessionData = {
        topic: '',
        level: '',
        task: '',
        resources: null
    };
    
    // Reset timer display
    elements.timer.textContent = '00:00:00';
}

/**
 * Sets up the writing interface with generated resources
 * @param {Object} resources - The resources object from the API
 */
function setupWritingInterface(resources) {
    // Show prompt
    elements.promptDisplay.classList.remove('hidden');
    elements.promptText.textContent = resources.prompt || '';
    
    // Update topic input if it was generated
    if (resources.topic && elements.topicInput.value.trim() === '') {
        elements.topicInput.value = resources.topic;
    }
    
    // Process outline - handle both string and object formats
    let outlineContent = 'No outline available';
    if (resources.outline) {
        if (typeof resources.outline === 'string') {
            outlineContent = resources.outline;
        } else if (typeof resources.outline === 'object') {
            try {
                // Convert object to markdown string
                outlineContent = "## Introduction\n";
                if (resources.outline.introduction) {
                    if (typeof resources.outline.introduction === 'string') {
                        outlineContent += `- ${resources.outline.introduction}\n\n`;
                    } else {
                        Object.entries(resources.outline.introduction).forEach(([key, value]) => {
                            outlineContent += `- ${value}\n`;
                        });
                        outlineContent += '\n';
                    }
                }
                
                // Process body paragraphs
                for (let i = 1; i <= 3; i++) {
                    const bodyKey = `bodyParagraph${i}`;
                    if (resources.outline[bodyKey]) {
                        outlineContent += `## Body Paragraph ${i}\n`;
                        const body = resources.outline[bodyKey];
                        
                        if (body.mainIdea) {
                            outlineContent += `- Main idea: ${body.mainIdea}\n`;
                        }
                        
                        if (body.supportingDetails && Array.isArray(body.supportingDetails)) {
                            body.supportingDetails.forEach(detail => {
                                outlineContent += `- ${detail}\n`;
                            });
                        }
                        outlineContent += '\n';
                    }
                }
                
                // Add conclusion
                if (resources.outline.conclusion) {
                    outlineContent += "## Conclusion\n";
                    if (typeof resources.outline.conclusion === 'string') {
                        outlineContent += `- ${resources.outline.conclusion}\n`;
                    } else {
                        Object.entries(resources.outline.conclusion).forEach(([key, value]) => {
                            outlineContent += `- ${value}\n`;
                        });
                    }
                }
            } catch (error) {
                console.error('Error converting outline object to string:', error);
                outlineContent = 'Error displaying outline. Please try again.';
            }
        }
    }
    
    // Process vocabulary list - handle both string and object formats
    let vocabContent = 'No vocabulary available';
    if (resources.vocabList) {
        if (typeof resources.vocabList === 'string') {
            vocabContent = resources.vocabList;
        } else if (Array.isArray(resources.vocabList)) {
            try {
                vocabContent = "";
                resources.vocabList.forEach(vocab => {
                    if (typeof vocab === 'string') {
                        vocabContent += `- ${vocab}\n`;
                    } else if (typeof vocab === 'object') {
                        const word = Object.keys(vocab)[0];
                        const definition = vocab[word];
                        vocabContent += `- **${word}**: ${definition}\n`;
                    }
                });
            } catch (error) {
                console.error('Error converting vocab array to string:', error);
                vocabContent = 'Error displaying vocabulary. Please try again.';
            }
        } else if (typeof resources.vocabList === 'object') {
            try {
                vocabContent = "";
                Object.entries(resources.vocabList).forEach(([word, definition]) => {
                    vocabContent += `- **${word}**: ${definition}\n`;
                });
            } catch (error) {
                console.error('Error converting vocab object to string:', error);
                vocabContent = 'Error displaying vocabulary. Please try again.';
            }
        }
    }
    
    // Process sentence patterns - handle both string and object/array formats
    let sentenceContent = 'No sentence patterns available';
    if (resources.sentencePatterns) {
        if (typeof resources.sentencePatterns === 'string') {
            sentenceContent = resources.sentencePatterns;
        } else if (Array.isArray(resources.sentencePatterns)) {
            try {
                sentenceContent = "";
                resources.sentencePatterns.forEach(pattern => {
                    sentenceContent += `- ${pattern}\n`;
                });
            } catch (error) {
                console.error('Error converting sentence array to string:', error);
                sentenceContent = 'Error displaying sentence patterns. Please try again.';
            }
        } else if (typeof resources.sentencePatterns === 'object') {
            try {
                sentenceContent = "";
                Object.values(resources.sentencePatterns).forEach(pattern => {
                    sentenceContent += `- ${pattern}\n`;
                });
            } catch (error) {
                console.error('Error converting sentence object to string:', error);
                sentenceContent = 'Error displaying sentence patterns. Please try again.';
            }
        }
    }
    
    // Render resources
    renderOutline(outlineContent);
    renderVocabList(vocabContent);
    renderSentencePatterns(sentenceContent);
    
    // Reset tabs to default state (outline tab selected)
    switchResourceTab('outline');
    
    // Show resources section
    elements.resourcesSection.classList.remove('hidden');
    
    // Show timer
    elements.timerDisplay.classList.remove('hidden');
    
    console.log('Resources set up successfully:', resources);
}

/**
 * Safely parse markdown content using marked.js
 * @param {string} content - The markdown content to parse
 * @returns {string} - The HTML representation of the markdown content
 */
function safeMarkdownParse(content) {
    try {
        // Use marked.js API properly based on the loaded version
        if (typeof marked === 'function') {
            // Older versions of marked
            return marked(content);
        } else if (typeof marked.parse === 'function') {
            // Newer versions of marked
            return marked.parse(content);
        } else {
            // Fallback if API is not recognized
            console.warn('Marked.js API not recognized, displaying raw content');
            return content;
        }
    } catch (error) {
        console.error('Error parsing markdown:', error);
        return content; // Return original content on error
    }
}

/**
 * Renders the outline content with markdown formatting
 * @param {string} outline - The outline content in markdown format
 */
function renderOutline(outline) {
    elements.outlineContent.innerHTML = safeMarkdownParse(outline);
}

/**
 * Renders the vocabulary list with markdown formatting
 * @param {string} vocabList - The vocabulary list in markdown format
 */
function renderVocabList(vocabList) {
    elements.vocabContent.innerHTML = safeMarkdownParse(vocabList);
}

/**
 * Renders the sentence patterns with markdown formatting
 * @param {string} sentencePatterns - The sentence patterns in markdown format
 */
function renderSentencePatterns(sentencePatterns) {
    elements.sentenceContent.innerHTML = safeMarkdownParse(sentencePatterns);
}

/**
 * Switches between resource tabs (outline, vocabulary, sentence patterns)
 * @param {string} tab - The tab to switch to ('outline', 'vocab', 'sentence')
 */
function switchResourceTab(tab) {
    // Reset all tabs
    elements.outlineTab.classList.remove('text-ueh-green', 'border-b-2', 'border-ueh-orange');
    elements.outlineTab.classList.add('text-gray-600');
    elements.vocabTab.classList.remove('text-ueh-green', 'border-b-2', 'border-ueh-orange');
    elements.vocabTab.classList.add('text-gray-600');
    elements.sentenceTab.classList.remove('text-ueh-green', 'border-b-2', 'border-ueh-orange');
    elements.sentenceTab.classList.add('text-gray-600');
    
    // Hide all content
    elements.outlineContent.classList.add('hidden');
    elements.vocabContent.classList.add('hidden');
    elements.sentenceContent.classList.add('hidden');
    
    // Activate selected tab
    switch (tab) {
        case 'outline':
            elements.outlineTab.classList.remove('text-gray-600');
            elements.outlineTab.classList.add('text-ueh-green', 'border-b-2', 'border-ueh-orange');
            elements.outlineContent.classList.remove('hidden');
            break;
        case 'vocab':
            elements.vocabTab.classList.remove('text-gray-600');
            elements.vocabTab.classList.add('text-ueh-green', 'border-b-2', 'border-ueh-orange');
            elements.vocabContent.classList.remove('hidden');
            break;
        case 'sentence':
            elements.sentenceTab.classList.remove('text-gray-600');
            elements.sentenceTab.classList.add('text-ueh-green', 'border-b-2', 'border-ueh-orange');
            elements.sentenceContent.classList.remove('hidden');
            break;
    }
}

/**
 * Generates a random topic using the API
 */
async function generateRandomTopic() {
    const level = elements.difficultyLevel.value;
    const task = elements.taskType.value;
    
    // Show loading indicator with GenZ animations
    elements.loadingIndicator.classList.remove('hidden');
    startLoadingAnimation();
    
    try {
        // Generate resources with empty topic (API will create random topic)
        const resources = await generateWritingResources('', level, task);
        
        // Update topic input field
        if (resources.topic) {
            elements.topicInput.value = resources.topic;
        }
        
    } catch (error) {
        console.error('Error generating random topic:', error);
        showToast('Có lỗi xảy ra khi tạo chủ đề ngẫu nhiên. Vui lòng thử lại!', 'error');
    } finally {
        // Hide loading indicator and stop animation
        stopLoadingAnimation();
        elements.loadingIndicator.classList.add('hidden');
    }
}

/**
 * Calls the API to generate writing resources
 * @param {string} topic - The writing topic
 * @param {string} level - The difficulty level
 * @param {string} task - The task type
 * @returns {Promise<Object>} - The generated resources
 */
async function generateWritingResources(topic, level, task) {
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            topic,
            level,
            task
        })
    });
    
    if (!response.ok) {
        throw new Error('Failed to generate writing resources');
    }
    
    return await response.json();
}

/**
 * Starts the timer for the writing session
 */
function startTimer() {
    startTime = new Date();
    
    timerInterval = setInterval(() => {
        const currentTime = new Date();
        const elapsedTime = new Date(currentTime - startTime);
        
        const hours = String(elapsedTime.getUTCHours()).padStart(2, '0');
        const minutes = String(elapsedTime.getUTCMinutes()).padStart(2, '0');
        const seconds = String(elapsedTime.getUTCSeconds()).padStart(2, '0');
        
        elements.timer.textContent = `${hours}:${minutes}:${seconds}`;
    }, 1000);
}

/**
 * Shows a toast message to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of message ('success' or 'error')
 */
function showToast(message, type = 'success') {
    elements.toastMessage.textContent = message;
    
    if (type === 'error') {
        elements.successToast.classList.remove('bg-green-100', 'border-green-500', 'text-green-700');
        elements.successToast.classList.add('bg-red-100', 'border-red-500', 'text-red-700');
    } else {
        elements.successToast.classList.remove('bg-red-100', 'border-red-500', 'text-red-700');
        elements.successToast.classList.add('bg-green-100', 'border-green-500', 'text-green-700');
    }
    
    elements.successToast.classList.remove('hidden');
    
    // Automatically hide after 5 seconds
    setTimeout(() => {
        elements.successToast.classList.add('hidden');
    }, 5000);
}

// Note: Loading animation functions have been moved to loading-animation.js

/**
 * Toggles between light and dark theme (future feature)
 */
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    
    const themeIcon = elements.themeToggle.querySelector('i');
    if (themeIcon.classList.contains('fa-moon')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);
