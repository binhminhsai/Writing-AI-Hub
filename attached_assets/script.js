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

// Function to map BAND to difficulty level
function mapBandToDifficulty(band) {
  const difficultyMap = {
    'BAND PRE 4.5': 'Beginner',
    'BAND 5.0': 'Elementary',
    'BAND 5.5': 'Lower Intermediate',
    'BAND 6.5': 'Intermediate',
    'BAND 7.0': 'Upper Intermediate',
    'BAND 7.5': 'Advanced',
    'BAND 8.0': 'Proficient'
  };
  
  return difficultyMap[band] || 'Intermediate';
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
    const difficulty = difficultyMap[text] || 'Intermediate';
    promptDifficulty.textContent = `Difficulty: ${difficulty}`;
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

// Editor toolbar functionality
document.addEventListener('DOMContentLoaded', () => {
  const editor = document.querySelector('.editor-textarea');
  
  // Bold button
  document.querySelector('.toolbar-btn.bold').addEventListener('click', () => {
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
      document.execCommand('bold', false, null);
    }
  });

  // Italic button
  document.querySelector('.toolbar-btn.italic').addEventListener('click', () => {
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
      document.execCommand('italic', false, null);
    }
  });

  // Underline button
  document.querySelector('.toolbar-btn.underline').addEventListener('click', () => {
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
      document.execCommand('underline', false, null);
    }
  });
});

// Copy outline functionality
document.querySelector('.copy-btn').addEventListener('click', () => {
  const outlineText = document.querySelector('.outline-list').innerText;
  navigator.clipboard.writeText(outlineText).then(() => {
    // Optional: Add visual feedback for successful copy
    const copyBtn = document.querySelector('.copy-btn');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  });
});

// Tab functionality
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.resource-tabs .tab');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and tab panes
      tabs.forEach(t => t.classList.remove('active'));
      tabPanes.forEach(tp => tp.classList.remove('active'));

      // Add active class to clicked tab and corresponding tab pane
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });
});

// Idle and Display State Management
function setIdleState() {
  // Clear previous content
  document.getElementById('writing-area').value = '';
  document.querySelector('.outline-list').innerHTML = `
    <li>I. _
      <ol>
        <li>1. _</li>
        <li>2. _</li>
      </ol>
    </li>
    <li>II. _
      <ol>
        <li>1. _</li>
        <li>2. _</li>
      </ol>
    </li>
    <li>III. _</li>
    <li>IV. _</li>
  `;
  
  // Reset vocabulary and templates
  document.getElementById('vocab').querySelector('ul').innerHTML = `
    <li>1. ...</li>
    <li>2. ...</li>
    <li>3. ...</li>
  `;
  document.getElementById('templates').querySelector('.template-content').innerHTML = '...';
}

function setDisplayState(response) {
  // This function will be called by backend when processing is complete
  // Update writing area
  document.getElementById('writing-area').value = response.writingContent || '';

  // Update outline
  if (response.outline) {
    const outlineList = document.querySelector('.outline-list');
    outlineList.innerHTML = response.outline;
  }

  // Update vocabulary
  if (response.vocabulary) {
    const vocabList = document.getElementById('vocab').querySelector('ul');
    vocabList.innerHTML = response.vocabulary.map(word => `<li>${word}</li>`).join('');
  }

  // Update sentence templates
  if (response.sentenceTemplates) {
    const templatesContent = document.getElementById('templates').querySelector('.template-content');
    templatesContent.innerHTML = response.sentenceTemplates;
  }
}

// Example of how backend might call setDisplayState
// setDisplayState({
//   writingContent: "Your generated writing content...",
//   outline: "Generated outline HTML...",
//   vocabulary: ["word1", "word2", "word3"],
//   sentenceTemplates: "Generated sentence templates..."
// });

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

// Prompt Generation and Management
function getDifficultyLevel(band) {
  const difficultyMap = {
    'BAND PRE 4.5': 'Beginner',
    'BAND 5.0': 'Elementary',
    'BAND 5.5': 'Lower Intermediate',
    'BAND 6.5': 'Intermediate',
    'BAND 7.0': 'Upper Intermediate',
    'BAND 7.5': 'Advanced',
    'BAND 8.0': 'Proficient'
  };
  
  return difficultyMap[band] || 'Intermediate';
}

// Function to generate prompt (for both normal and chaos mode)
function generatePrompt(isChaos = false) {
  const topicInput = document.getElementById('topic-input');
  const currentBand = document.getElementById('bandBtn').textContent.replace('▼', '').trim();
  
  let topic;
  if (isChaos) {
    const randomTopics = [
      "Technology", 
      "Environment", 
      "Education", 
      "Social Change", 
      "Future of Work"
    ];
    topic = randomTopics[Math.floor(Math.random() * randomTopics.length)];
  } else {
    topic = topicInput.value.trim();
    if (!topic) return;
  }

  // Mock prompt response (will be replaced with backend response)
  const mockPromptResponse = {
    prompt: `Write a descriptive essay about the impact of ${topic} on modern society. Explore its current significance, potential future developments, and how it influences human life.`,
    difficulty: currentBand, // Using the current selected band
    estimatedTime: "20-25 mins"
  };

  displayWritingPrompt(mockPromptResponse);
}

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

function startWritingChallenge() {
  const writingPromptSection = document.getElementById('writing-prompt');
  const mainContent = document.querySelector('.main-content');

  // Hide prompt section
  writingPromptSection.classList.add('hidden');
  
  // Ensure main content is visible
  mainContent.classList.remove('hidden');

  // Start timer
  startTimer();
}

// Event listener for chaos button
document.querySelector('.chaos-btn').addEventListener('click', () => generatePrompt(true));

function startWritingProcess() {
  const startWritingBtn = document.getElementById('start-writing-btn');
  
  if (!isWritingStarted) {
    // Start writing process
    startTimer();
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
    // Submit writing process
    submitWriting();
  }
}

function submitWriting() {
  // Placeholder for backend API call
  const writingContent = document.getElementById('writing-area').value;
  
  // TODO: Replace with actual backend API call
  console.log('Submitting writing:', writingContent);
  
  // Simulated API call
  setTimeout(() => {
    alert('Your writing has been submitted for evaluation!');
    resetWritingProcess();
  }, 1000);
}

function resetWritingProcess() {
  const startWritingBtn = document.getElementById('start-writing-btn');
  
  // Reset button
  startWritingBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
    </svg>
    Start Writing
  `;
  startWritingBtn.classList.remove('bg-orange-600');
  startWritingBtn.classList.add('bg-green-600');
  
  // Reset timer
  clearInterval(interval);
  seconds = 0;
  document.getElementById('timer').textContent = '00 : 00';
  
  // Reset writing area
  document.getElementById('writing-area').value = '';
  
  isWritingStarted = false;
}

// On page load, set initial difficulty
document.addEventListener('DOMContentLoaded', () => {
  const initialBand = document.getElementById('bandBtn').textContent.replace('▼', '').trim();
  const promptDifficulty = document.getElementById('prompt-difficulty');
  const difficulty = difficultyMap[initialBand] || 'Intermediate';
  promptDifficulty.textContent = `Difficulty: ${difficulty}`;
}); 