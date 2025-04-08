// Timer functionality
let seconds = 0;
let interval;
let isWritingStarted = false;

// Difficulty mapping
const difficultyMap = {
  'BAND PRE 4.5': 'Beginner',
  'BAND 5.0': 'Elementary',
  'BAND 5.5': 'Lower Intermediate',
  'BAND 6.5': 'Intermediate',
  'BAND 7.0': 'Upper Intermediate',
  'BAND 7.5': 'Advanced',
  'BAND 8.0': 'Proficient'
};

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Set up chaos button
  const chaosBtn = document.querySelector('.chaos-btn');
  if (chaosBtn) {
    chaosBtn.addEventListener('click', () => generatePrompt(true));
  }
  
  // Set up generate button
  const generateBtn = document.getElementById('generateBtn');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => generatePrompt(false));
  }
  
  // Set up tab switching
  const vocabTab = document.getElementById('vocabTab');
  const templateTab = document.getElementById('templateTab');
  if (vocabTab && templateTab) {
    vocabTab.removeAttribute('onclick');
    templateTab.removeAttribute('onclick');
    vocabTab.addEventListener('click', () => switchTab('vocab'));
    templateTab.addEventListener('click', () => switchTab('template'));
  }
  
  // Set up start writing button
  const startWritingBtn = document.getElementById('start-writing-btn');
  if (startWritingBtn) {
    startWritingBtn.removeAttribute('onclick');
    startWritingBtn.addEventListener('click', startWritingProcess);
  }
  
  // Set up copy button
  const copyBtn = document.querySelector('.copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const outlineText = document.querySelector('.outline-list').innerText;
      navigator.clipboard.writeText(outlineText).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2000);
      });
    });
  }
  
  // Set initial difficulty display
  const promptDifficulty = document.getElementById('prompt-difficulty');
  const bandBtn = document.getElementById('bandBtn');
  if (promptDifficulty && bandBtn) {
    const initialBand = bandBtn.textContent.replace('▼', '').trim();
    const difficulty = difficultyMap[initialBand] || 'Intermediate';
    promptDifficulty.textContent = `Difficulty: ${difficulty}`;
  }
});

function startTimer() {
  // Clear any existing interval
  clearInterval(interval);
  
  // Start a new interval
  interval = setInterval(() => {
    seconds++;
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `${min} : ${sec}`;
  }, 1000);
}

// Dropdown functionality
function toggleDropdown(id) {
  // Close all other dropdowns
  document.querySelectorAll('.dropdown-menu').forEach(el => {
    if (el.id !== id) {
      el.style.display = 'none';
    }
  });

  // Toggle the clicked dropdown
  const dropdown = document.getElementById(id);
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

// Modify the selectOption function to update difficulty
function selectOption(buttonId, text) {
  // Get the button and update its text
  const button = document.getElementById(buttonId);
  button.textContent = `${text} ▼`;
  
  // Close the dropdown
  document.getElementById(buttonId + 'Dropdown').style.display = 'none';
  
  // Update difficulty display if band is changed
  if (buttonId === 'bandBtn') {
    const promptDifficulty = document.getElementById('prompt-difficulty');
    if (promptDifficulty) {
      const difficulty = difficultyMap[text] || 'Intermediate';
      promptDifficulty.textContent = `Difficulty: ${difficulty}`;
    }
  }
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.relative')) {
    document.querySelectorAll('.dropdown-menu').forEach(el => {
      el.style.display = 'none';
    });
  }
});

// Tab switching function
function switchTab(tab) {
  const vocab = document.getElementById("vocabContent");
  const template = document.getElementById("templateContent");
  const vocabBtn = document.getElementById("vocabTab");
  const templateBtn = document.getElementById("templateTab");

  if (tab === 'vocab') {
    vocab.classList.remove("hidden");
    template.classList.add("hidden");
    vocabBtn.classList.add("bg-green-200");
    vocabBtn.classList.remove("bg-orange-100");
    templateBtn.classList.remove("bg-orange-300");
    templateBtn.classList.add("bg-orange-100");
  } else {
    vocab.classList.add("hidden");
    template.classList.remove("hidden");
    templateBtn.classList.add("bg-orange-300");
    templateBtn.classList.remove("bg-orange-100");
    vocabBtn.classList.remove("bg-green-200");
    vocabBtn.classList.add("bg-orange-100");
  }
}

// Function to display the writing prompt
function displayWritingPrompt(promptData) {
  const promptSection = document.getElementById('prompt-section');
  const writingPromptSection = document.getElementById('writing-prompt');
  const promptText = document.getElementById('prompt-text');
  const promptDifficulty = document.getElementById('prompt-difficulty');
  const estimatedTime = document.getElementById('estimated-time');

  // Hide input section, show prompt section
  promptSection.classList.add('hidden');
  writingPromptSection.classList.remove('hidden');

  // Update prompt details
  promptText.textContent = promptData.prompt;
  promptDifficulty.textContent = `Difficulty: ${promptData.difficulty}`;
  estimatedTime.textContent = promptData.estimatedTime;
}

// Function to generate prompt (for both normal and chaos mode)
async function generatePrompt(isChaos = false) {
  const topicInput = document.getElementById('topic-input');
  const currentTask = document.getElementById('taskBtn').textContent.replace('▼', '').trim();
  const currentBand = document.getElementById('bandBtn').textContent.replace('▼', '').trim();
  
  // Show loading indicator if it exists
  const loadingIndicator = document.getElementById('loadingIndicator');
  if (loadingIndicator) {
    loadingIndicator.classList.remove('hidden');
    
    // Start the loading animation if the function exists
    if (typeof startLoadingAnimation === 'function') {
      startLoadingAnimation();
    }
  }
  
  try {
    let topic;
    if (isChaos) {
      // Make API call to get a random topic
      const response = await fetch('/api/random_topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level: currentBand,
          task: currentTask
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error generating random topic');
      }
      
      const result = await response.json();
      topic = result.topic;
      
      // Update the topic input field with the random topic
      if (topicInput) {
        topicInput.value = topic;
      }
    } else {
      topic = topicInput.value.trim();
      if (!topic) {
        if (loadingIndicator) {
          loadingIndicator.classList.add('hidden');
          if (typeof stopLoadingAnimation === 'function') {
            stopLoadingAnimation();
          }
        }
        alert("Please enter a topic or use Chaos mode for a random topic");
        return;
      }
    }
    
    // Call the API to generate writing resources
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: topic,
        level: currentBand,
        task: currentTask
      }),
    });
    
    if (!response.ok) {
      throw new Error('Error generating writing resources');
    }
    
    const result = await response.json();
    
    // Create prompt response object
    const promptResponse = {
      prompt: result.prompt || `Write about ${topic}`,
      difficulty: currentBand,
      estimatedTime: "20-25 mins"
    };
    
    // Display the prompt
    displayWritingPrompt(promptResponse);
    
    // Update outline, vocabulary and templates
    const resources = {
      outline: result.outline || "",
      vocabulary: result.vocabList || "",
      sentenceTemplates: result.sentencePatterns || ""
    };
    
    // Update the display with the resources
    updateResourcesDisplay(resources);
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error generating prompt. Please try again.');
  } finally {
    // Hide loading indicator
    if (loadingIndicator) {
      loadingIndicator.classList.add('hidden');
      if (typeof stopLoadingAnimation === 'function') {
        stopLoadingAnimation();
      }
    }
  }
}

// Function to update resources display
function updateResourcesDisplay(resources) {
  // Update outline if available
  if (resources.outline) {
    const outlineList = document.querySelector('.outline-list');
    if (outlineList) {
      // Check if the outline is HTML or plain text
      if (resources.outline.includes('<li>')) {
        outlineList.innerHTML = resources.outline;
      } else {
        // Format the plain text outline as HTML
        const formattedOutline = resources.outline
          .split('\n')
          .map(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return '';
            
            // Count the leading spaces/indentation
            const indentation = line.search(/\S|$/);
            const indentLevel = Math.floor(indentation / 2);
            
            // Check if this is a heading (contains "Introduction:", "Body Paragraph", "Conclusion:")
            const isHeading = /^(Introduction|Body Paragraph|Conclusion)/.test(trimmedLine);
            
            // Create appropriate HTML based on indentation level and if it's a heading
            if (isHeading || indentLevel === 0) {
              // Main heading - in bold
              return `<li><strong>${trimmedLine}</strong></li>`;
            } else if (indentLevel === 1) {
              // Subheading - semi-bold
              return `<li style="margin-left:${indentLevel * 20}px"><b>${trimmedLine}</b></li>`;
            } else {
              // Regular content
              return `<li style="margin-left:${indentLevel * 20}px">${trimmedLine}</li>`;
            }
          })
          .join('');
        
        outlineList.innerHTML = formattedOutline;
      }
    }
  }
  
  // Update vocabulary if available
  if (resources.vocabulary) {
    const vocabContent = document.getElementById('vocabContent');
    if (vocabContent) {
      // Convert the string to HTML
      if (typeof resources.vocabulary === 'string') {
        // Replace newlines with <br> and create list items
        const formattedVocab = resources.vocabulary
          .split('\n')
          .filter(line => line.trim()) // Remove empty lines
          .map(line => `<li>${line}</li>`)
          .join('');
        
        vocabContent.innerHTML = `<ul>${formattedVocab}</ul>`;
      } else if (Array.isArray(resources.vocabulary)) {
        vocabContent.innerHTML = `<ul>${resources.vocabulary.map(word => `<li>${word}</li>`).join('')}</ul>`;
      }
    }
  }
  
  // Update sentence templates if available
  if (resources.sentenceTemplates) {
    const templateContent = document.getElementById('templateContent');
    if (templateContent) {
      // Check if it's a string or array
      if (typeof resources.sentenceTemplates === 'string') {
        // Convert markdown to HTML if needed
        if (resources.sentenceTemplates.includes('###')) {
          // Simple markdown conversion
          const formattedTemplates = resources.sentenceTemplates
            .replace(/###\s+(.*)/g, '<h4>$1</h4>') // Replace ### headers
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Replace bold text
            .replace(/\n/g, '<br>'); // Replace newlines
          
          templateContent.innerHTML = formattedTemplates;
        } else {
          templateContent.innerHTML = resources.sentenceTemplates;
        }
      } else if (Array.isArray(resources.sentenceTemplates)) {
        templateContent.innerHTML = resources.sentenceTemplates.join('<br><br>');
      }
    }
  }
}

// Function to handle the writing process
function startWritingProcess() {
  const startWritingBtn = document.getElementById('start-writing-btn');
  
  if (!isWritingStarted) {
    // If we're in the input state, show the prompt section first
    const promptSection = document.getElementById('prompt-section');
    const writingPromptSection = document.getElementById('writing-prompt');
    
    if (!promptSection.classList.contains('hidden')) {
      // There's no prompt yet, so generate one
      const topicInput = document.getElementById('topic-input');
      if (topicInput && topicInput.value.trim()) {
        generatePrompt(false);
      } else {
        alert("Please enter a topic or generate one first");
        return;
      }
    } else if (!writingPromptSection.classList.contains('hidden')) {
      // Hide the prompt section, user is ready to write
      writingPromptSection.classList.add('hidden');
    }
    
    // Start timer
    startTimer();
    
    // Change button text to submit
    startWritingBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
      </svg>
      Submit Your Effort
    `;
    startWritingBtn.classList.remove('bg-green-600');
    startWritingBtn.classList.add('bg-orange-600');
    
    isWritingStarted = true;
  } else {
    // Writing is already started, submit the essay
    submitWriting();
  }
}

// Function to submit the writing
async function submitWriting() {
  const writingArea = document.getElementById('writing-area');
  const essay = writingArea.value;
  
  if (essay.trim().length < 50) {
    alert("Please write more content before submitting (minimum 50 characters)");
    return;
  }
  
  // Show loading indicator if it exists
  const loadingIndicator = document.getElementById('loadingIndicator');
  if (loadingIndicator) {
    loadingIndicator.classList.remove('hidden');
    if (typeof startLoadingAnimation === 'function') {
      startLoadingAnimation();
    }
  }
  
  try {
    // Get task, level, prompt information
    const taskBtn = document.getElementById('taskBtn');
    const bandBtn = document.getElementById('bandBtn');
    const promptText = document.getElementById('prompt-text');
    
    const task = taskBtn ? taskBtn.textContent.replace('▼', '').trim() : 'IELTS WRITING TASK 2';
    const level = bandBtn ? bandBtn.textContent.replace('▼', '').trim() : 'BAND 6.5';
    const question = promptText ? promptText.textContent : '';
    
    // Calculate time spent
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    const timeSpent = `${min}:${sec.toString().padStart(2, '0')}`;
    
    // Prepare data for grading
    const data = {
      essay: essay,
      question: question,
      level: level,
      task: task,
      timeSpent: timeSpent
    };
    
    // Navigate to grading page with data
    window.location.href = `/grading?data=${encodeURIComponent(JSON.stringify(data))}`;
    
  } catch (error) {
    console.error('Error submitting essay:', error);
    alert('Error submitting essay. Please try again.');
    
    if (loadingIndicator) {
      loadingIndicator.classList.add('hidden');
      if (typeof stopLoadingAnimation === 'function') {
        stopLoadingAnimation();
      }
    }
  }
}

// Add a hidden loading indicator if it doesn't exist
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('loadingIndicator')) {
    const loadingHTML = `
      <div id="loadingIndicator" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 hidden backdrop-blur-sm">
        <div class="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center max-w-md w-full">
          <div class="flex items-center justify-center mb-4">
            <div class="text-4xl mr-2 animate-spin">⚙️</div>
            <div class="text-4xl mx-1 animate-bounce">🧠</div>
            <div class="text-4xl ml-2 animate-pulse">✨</div>
          </div>
          <h3 class="text-xl font-bold mb-3">AI đang chạy hết công suất...</h3>
          <div id="loadingMessages" class="text-center mb-4 font-medium text-gray-600 h-12 overflow-hidden">
            <p class="loadingMessage">Đang tạo tài liệu chất lượng cao cho bạn...</p>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5 mb-6 overflow-hidden">
            <div id="loadingProgressBar" class="bg-gradient-to-r from-green-500 to-orange-500 h-2.5 rounded-full" style="width: 30%"></div>
          </div>
          <div class="text-sm text-gray-500 italic">
            <span class="font-semibold">Fact:</span> Tạo 1 bài IELTS chuẩn đòi hỏi 180+ giây tư duy!
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
  }
});