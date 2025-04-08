/**
 * WritingAI Hub - Grading Module
 * Handles the essay grading functionality with AI assistance
 */

/**
 * Rounds a number to the nearest 0.5 or integer
 * IELTS scores are always in 0.5 increments (e.g., 6.0, 6.5, 7.0)
 * @param {number} num - The number to round
 * @returns {string} The rounded number as a string with one decimal place
 */
function roundToHalf(num) {
    return (Math.round(num * 2) / 2).toFixed(1);
}

// State variables
let isGrading = false;
let essayText = '';

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Hide the loading indicator initially
    const gradingLoading = document.getElementById('gradingLoading');
    if (gradingLoading) {
        gradingLoading.classList.add('hidden');
    }
    
    // Setup event listeners
    setupGradingListeners();
    
    // Initialize loading animation
    if (typeof startLoadingAnimation === 'function') {
        // If loading-animation.js is loaded, customize messages
        const gradingMessages = [
            "Đang phân tích lỗi ngữ pháp và từ vựng ✍️",
            "Đang đánh giá cấu trúc bài viết 📃",
            "Đang tính điểm theo từng tiêu chí 🧮",
            "Đang tìm kiếm từ ngữ cao cấp hơn 📚",
            "Đang soạn các câu mẫu cho bạn 🔍",
            "Sắp hoàn thành bản đánh giá chi tiết 🎯"
        ];
        
        // Set custom messages for grading
        if (window.loadingAnimationConfig) {
            window.loadingAnimationConfig.messages = gradingMessages;
        }
    }
    
    // Check URL for data and auto-grade if essay is present
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('data')) {
        try {
            const data = JSON.parse(decodeURIComponent(urlParams.get('data')));
            
            // Check if we have essay data
            if (data && data.essay) {
                // Set the essay input
                const essayInput = document.getElementById('essayInput');
                if (essayInput) {
                    essayInput.value = data.essay;
                }
                
                // Set the question text if available
                if (data.question) {
                    const questionText = document.getElementById('questionText');
                    if (questionText) {
                        questionText.textContent = data.question;
                    }
                }
                
                // Set the band level if available
                if (data.level) {
                    const bandLevel = document.getElementById('bandLevel');
                    if (bandLevel) {
                        bandLevel.textContent = data.level;
                    }
                    
                    // Also update the difficulty level dropdown if it exists
                    const difficultyLevel = document.getElementById('difficultyLevel');
                    if (difficultyLevel) {
                        for (let i = 0; i < difficultyLevel.options.length; i++) {
                            if (difficultyLevel.options[i].value === data.level) {
                                difficultyLevel.selectedIndex = i;
                                break;
                            }
                        }
                    }
                }
                
                // Set the estimated time if available
                if (data.timeSpent) {
                    const estimatedTime = document.getElementById('estimatedTime');
                    if (estimatedTime) {
                        estimatedTime.textContent = data.timeSpent;
                    }
                }
                
                // Auto-submit for grading after a short delay
                setTimeout(() => {
                    handleSubmitEssay();
                }, 500);
            }
        } catch (error) {
            console.error('Error parsing data from URL:', error);
        }
    }
});

/**
 * Setup event listeners for the grading page
 */
function setupGradingListeners() {
    // Listen for the submit essay button
    const submitButton = document.getElementById('submitEssayBtn');
    if (submitButton) {
        submitButton.addEventListener('click', handleSubmitEssay);
    }
    
    // Listen for random question button
    const randomQuestionButton = document.getElementById('randomQuestionBtn');
    if (randomQuestionButton) {
        randomQuestionButton.addEventListener('click', generateRandomQuestion);
    }
    
    // Listen for task type and level changes to update the UI
    const taskType = document.getElementById('taskType');
    const difficultyLevel = document.getElementById('difficultyLevel');
    
    if (taskType) taskType.addEventListener('change', updatePromptDisplay);
    if (difficultyLevel) difficultyLevel.addEventListener('change', updatePromptDisplay);
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

/**
 * Handles the submission of an essay for grading
 */
async function handleSubmitEssay() {
    // Get the essay text
    const essayInput = document.getElementById('essayInput');
    if (!essayInput) return;
    
    essayText = essayInput.value.trim();
    
    // Validate the essay
    if (!essayText) {
        showToast('Please enter your essay text first', 'error');
        return;
    }
    
    try {
        // Show loading indicator
        const gradingLoading = document.getElementById('gradingLoading');
        if (gradingLoading) {
            gradingLoading.classList.remove('hidden');
        }
        isGrading = true;
        
        // Start the loading animation
        if (typeof startLoadingAnimation === 'function') {
            startLoadingAnimation('loadingProgressBar', 'loadingMessages');
        }
        
        // Get task type and level
        const taskType = document.getElementById('taskType');
        const difficultyLevel = document.getElementById('difficultyLevel');
        
        const taskTypeValue = taskType ? taskType.value : 'IELTS Task 2';
        const levelValue = difficultyLevel ? difficultyLevel.value : 'Band 6.5';
        
        // Get the question text
        const questionText = document.getElementById('questionText');
        const questionValue = questionText ? questionText.textContent : '';
        
        // Make API call to grade the essay
        const response = await fetch('/api/grade', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                essay: essayText,
                question: questionValue,
                level: levelValue
            }),
        });
        
        // Check for errors
        if (!response.ok) {
            throw new Error(`Error grading essay: ${response.status}`);
        }
        
        // Parse the response
        const result = await response.json();
        
        // Display the results
        displayGradingResults(result);
        
        // Show success message
        showToast('Bài viết đã được chấm thành công!');
        
    } catch (error) {
        console.error('Error grading essay:', error);
        showToast('Error grading essay. Please try again.', 'error');
    } finally {
        // Hide loading indicator
        const gradingLoading = document.getElementById('gradingLoading');
        if (gradingLoading) {
            gradingLoading.classList.add('hidden');
        }
        isGrading = false;
        
        // Stop the loading animation
        if (typeof stopLoadingAnimation === 'function') {
            stopLoadingAnimation();
        }
    }
}

/**
 * Displays the grading results in the UI
 * @param {Object} result - The grading result object
 */
function displayGradingResults(result) {
    if (!result) return;
    
    // Make sure user writing section is visible
    const userWritingSection = document.getElementById('userWritingSection');
    if (userWritingSection) {
        userWritingSection.classList.remove('hidden');
    }
    
    // Parse the highlighted essay
    const highlightedEssay = result.highlightedEssay || '';
    
    // Replace error, suggestion, and good tags with appropriate HTML
    const formattedEssay = highlightedEssay
        .replace(/<e>(.*?)<\/e>/g, '<span class="highlight-red">$1</span>')
        .replace(/<suggestion>(.*?)<\/suggestion>/g, '<span class="highlight-yellow">$1</span>')
        .replace(/<good>(.*?)<\/good>/g, '<span class="highlight-green">$1</span>');
    
    // Update the user writing content
    const userWritingContent = document.getElementById('userWritingContent');
    if (userWritingContent) {
        userWritingContent.innerHTML = `<div class="prose max-w-none">${formattedEssay}</div>`;
    }
    
    // Update the feedback sections
    const grammarFeedback = document.getElementById('grammarFeedback');
    const lexicalFeedback = document.getElementById('lexicalFeedback');
    const taskFeedback = document.getElementById('taskFeedback');
    const coherenceFeedback = document.getElementById('coherenceFeedback');
    
    if (grammarFeedback) grammarFeedback.innerHTML = formatFeedbackList(result.grammarFeedback || []);
    if (lexicalFeedback) lexicalFeedback.innerHTML = formatFeedbackList(result.lexicalFeedback || []);
    if (taskFeedback) taskFeedback.innerHTML = formatFeedbackList(result.taskFeedback || []);
    if (coherenceFeedback) coherenceFeedback.innerHTML = formatFeedbackList(result.coherenceFeedback || []);
    
    // Show the feedback content
    const aiFeedbackContent = document.getElementById('aiFeedbackContent');
    if (aiFeedbackContent) {
        aiFeedbackContent.classList.remove('hidden');
    }
    
    // Update the scores
    if (result.scores) {
        const grammarScore = document.getElementById('grammarScore');
        const lexicalScore = document.getElementById('lexicalScore');
        const taskScore = document.getElementById('taskScore');
        const coherenceScore = document.getElementById('coherenceScore');
        const overallScore = document.getElementById('overallScore');
        
        // Round scores to nearest 0.5 or 0.0 as per IELTS standards
        if (grammarScore) grammarScore.textContent = roundToHalf(result.scores.grammar);
        if (lexicalScore) lexicalScore.textContent = roundToHalf(result.scores.lexical);
        if (taskScore) taskScore.textContent = roundToHalf(result.scores.task);
        if (coherenceScore) coherenceScore.textContent = roundToHalf(result.scores.coherence);
        if (overallScore) overallScore.textContent = roundToHalf(result.scores.overall);
        
        // Show the score box
        const scoreBox = document.getElementById('scoreBox');
        if (scoreBox) {
            scoreBox.classList.remove('hidden');
        }
    }
    
    // Update improvement suggestions
    const vocabSuggestions = document.getElementById('vocabSuggestions');
    const templateSuggestions = document.getElementById('templateSuggestions');
    
    if (result.vocabSuggestions && result.vocabSuggestions.length > 0 && vocabSuggestions) {
        vocabSuggestions.innerHTML = formatSuggestionsList(result.vocabSuggestions);
    }
    
    if (result.templateSuggestions && result.templateSuggestions.length > 0 && templateSuggestions) {
        templateSuggestions.innerHTML = formatTemplatesList(result.templateSuggestions);
    }
    
    // Show the improvement suggestions section
    const improvementSuggestions = document.getElementById('improvementSuggestions');
    if (improvementSuggestions) {
        improvementSuggestions.classList.remove('hidden');
    }
}

/**
 * Updates the prompt display based on the selected task type and level
 */
function updatePromptDisplay() {
    const taskType = document.getElementById('taskType');
    const difficultyLevel = document.getElementById('difficultyLevel');
    
    if (!taskType || !difficultyLevel) return;
    
    // Update the band level display
    const bandLevel = document.getElementById('bandLevel');
    if (bandLevel) {
        bandLevel.textContent = difficultyLevel.value;
    }
}

/**
 * Formats a list of feedback items as HTML
 * @param {Array} feedbackList - List of feedback strings
 * @returns {string} HTML formatted list
 */
function formatFeedbackList(feedbackList) {
    if (!feedbackList || feedbackList.length === 0) {
        return '<p class="text-gray-500">No feedback available</p>';
    }
    
    return feedbackList.map(item => `<p class="my-1">• ${item}</p>`).join('');
}

/**
 * Formats a list of vocabulary suggestions as HTML
 * @param {Array} suggestionsList - List of vocabulary suggestion strings
 * @returns {string} HTML formatted list
 */
function formatSuggestionsList(suggestionsList) {
    if (!suggestionsList || suggestionsList.length === 0) {
        return '<li class="text-gray-500">No vocabulary suggestions available</li>';
    }
    
    return suggestionsList.map(item => `<li class="mb-2">${item}</li>`).join('');
}

/**
 * Formats a list of sentence templates as HTML
 * @param {Array} templatesList - List of template strings
 * @returns {string} HTML formatted list
 */
function formatTemplatesList(templatesList) {
    if (!templatesList || templatesList.length === 0) {
        return '<p class="text-gray-500">No sentence templates available</p>';
    }
    
    return templatesList.map(item => {
        // Wrap the template in a styled div
        return `<div class="p-3 bg-gray-50 border border-gray-200 rounded mb-3">${item}</div>`;
    }).join('');
}

/**
 * Generates a random question for practice
 */
async function generateRandomQuestion() {
    try {
        // Get the current task type and level
        const taskType = document.getElementById('taskType');
        const difficultyLevel = document.getElementById('difficultyLevel');
        
        if (!taskType || !difficultyLevel) return;
        
        // Show a small loading indicator or change button text
        const randomQuestionBtn = document.getElementById('randomQuestionBtn');
        if (!randomQuestionBtn) return;
        
        const originalText = randomQuestionBtn.innerHTML;
        randomQuestionBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Generating...';
        randomQuestionBtn.disabled = true;
        
        // Make API call to get a random topic
        const response = await fetch('/api/random_topic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                level: difficultyLevel.value,
                task: taskType.value
            }),
        });
        
        // Check for errors
        if (!response.ok) {
            throw new Error(`Error generating random topic: ${response.status}`);
        }
        
        // Parse the response
        const result = await response.json();
        
        // Update the question text
        if (result.topic) {
            const questionText = document.getElementById('questionText');
            if (questionText) {
                questionText.textContent = result.topic;
            }
        }
        
        // Show success message
        showToast('Câu hỏi mới đã được tạo!');
        
    } catch (error) {
        console.error('Error generating random topic:', error);
        showToast('Error generating random topic. Please try again.', 'error');
    } finally {
        // Restore button text
        const randomQuestionBtn = document.getElementById('randomQuestionBtn');
        if (randomQuestionBtn) {
            randomQuestionBtn.innerHTML = '<i class="fas fa-random mr-2"></i> Generate Random Question';
            randomQuestionBtn.disabled = false;
        }
    }
}

/**
 * Shows a toast message to the user
 * @param {string} message - The message to show
 * @param {string} type - The type of toast ('success' or 'error')
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('successToast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    // Update the message
    toastMessage.textContent = message;
    
    // Update styling based on type
    if (type === 'error') {
        toast.classList.remove('bg-green-100', 'border-green-500', 'text-green-700');
        toast.classList.add('bg-red-100', 'border-red-500', 'text-red-700');
    } else {
        toast.classList.remove('bg-red-100', 'border-red-500', 'text-red-700');
        toast.classList.add('bg-green-100', 'border-green-500', 'text-green-700');
    }
    
    // Show the toast
    toast.classList.remove('hidden');
    
    // Hide after 5 seconds
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 5000);
}

/**
 * Toggles between light and dark theme
 */
function toggleTheme() {
    // This is a placeholder for theme toggling functionality
    // You can implement actual theme switching logic here
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    const icon = themeToggle.querySelector('i');
    if (!icon) return;
    
    if (icon.classList.contains('fa-moon')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        // Add dark theme
        document.documentElement.classList.add('dark');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        // Remove dark theme
        document.documentElement.classList.remove('dark');
    }
}