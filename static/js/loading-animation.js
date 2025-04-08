/**
 * WritingAI Hub - GenZ Loading Animation Module
 * Provides engaging loading animation effects with GenZ style messages and visual elements
 */

/**
 * Customizable loading animation messages that cycle through during API calls
 */
let loadingMessages = [
    "Đang tìm kiếm từ ngữ nổi bật và sáng tạo ✨",
    "Đang xây dựng cấu trúc bài viết mạch lạc 📊",
    "Đang chốt ý tưởng bá đạo nhất 🚀",
    "Đang đọc hàng trăm bài IELTS band cao 📑",
    "Đang phân tích xu hướng đề thi mới nhất 📈",
    "Đang loại bỏ những từ ngữ nhàm chán 🔍",
    "Đang tìm những ví dụ thực tế thú vị 🌎",
    "Đang trộn từ vựng đa dạng cho bài viết 🧩",
    "Đang tạo các cụm từ hoa mỹ cho bạn ✏️"
];

/**
 * Global configuration for loading animation
 */
window.loadingAnimationConfig = {
    messages: loadingMessages,
    messagesElement: null,
    progressBar: null,
    interval: null,
    messageIndex: 0,
    progressValue: 30
};

/**
 * Start the loading animation
 * @param {string} progressBarId - ID of the progress bar element
 * @param {string} messagesId - ID of the element containing loading messages
 */
function startLoadingAnimation(progressBarId = 'loadingProgressBar', messagesId = 'loadingMessages') {
    // Get DOM elements
    const progressBar = document.getElementById(progressBarId);
    const messagesContainer = document.getElementById(messagesId);
    
    if (!progressBar || !messagesContainer) {
        console.error('Loading animation elements not found');
        return;
    }
    
    // Store references in the global config
    window.loadingAnimationConfig.progressBar = progressBar;
    window.loadingAnimationConfig.messagesElement = messagesContainer;
    window.loadingAnimationConfig.messageIndex = 0;
    window.loadingAnimationConfig.progressValue = 30;
    
    // Clear any existing interval
    if (window.loadingAnimationConfig.interval) {
        clearInterval(window.loadingAnimationConfig.interval);
    }
    
    // Set initial message
    const currentMessage = window.loadingAnimationConfig.messages[0];
    messagesContainer.innerHTML = `<p class="loadingMessage">${currentMessage}</p>`;
    
    // Set initial progress
    progressBar.style.width = '30%';
    
    // Start cycling through messages and updating progress
    window.loadingAnimationConfig.interval = setInterval(() => {
        updateLoadingAnimation();
    }, 2000);
}

/**
 * Update the loading animation (messages and progress)
 */
function updateLoadingAnimation() {
    const { messages, messagesElement, progressBar, messageIndex, progressValue } = window.loadingAnimationConfig;
    
    // Update message index
    const newIndex = (messageIndex + 1) % messages.length;
    window.loadingAnimationConfig.messageIndex = newIndex;
    
    // Update message with fade effect
    const nextMessage = messages[newIndex];
    messagesElement.style.opacity = 0;
    
    setTimeout(() => {
        messagesElement.innerHTML = `<p class="loadingMessage">${nextMessage}</p>`;
        messagesElement.style.opacity = 1;
    }, 300);
    
    // Update progress
    const newProgress = Math.min(90, progressValue + Math.random() * 10);
    window.loadingAnimationConfig.progressValue = newProgress;
    progressBar.style.width = `${newProgress}%`;
}

/**
 * Stop the loading animation
 */
function stopLoadingAnimation() {
    // Stop the animation interval
    if (window.loadingAnimationConfig.interval) {
        clearInterval(window.loadingAnimationConfig.interval);
    }
    
    // Complete the progress bar
    if (window.loadingAnimationConfig.progressBar) {
        window.loadingAnimationConfig.progressBar.style.width = '100%';
    }
    
    // Wait a moment to show the completed progress
    setTimeout(() => {
        // If the loading indicator still exists, hide it
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
        
        // Reset the progress bar for next time
        if (window.loadingAnimationConfig.progressBar) {
            window.loadingAnimationConfig.progressBar.style.width = '30%';
        }
    }, 500);
}