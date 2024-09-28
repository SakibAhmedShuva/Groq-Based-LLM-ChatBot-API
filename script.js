// API endpoints
const API_BASE_URL = 'http://localhost:5000';
const CREATE_SESSION_URL = `${API_BASE_URL}/create-session`;
const STREAM_CHAT_URL = `${API_BASE_URL}/stream-chat`;
const CLEAR_HISTORY_URL = `${API_BASE_URL}/clear-history`;

// Elements
const messageInput = document.getElementById('message-input');
const chatWindow = document.getElementById('chat-window');
const sessionList = document.getElementById('session-list');
const newChatButton = document.getElementById('new-chat');
const sendMessageButton = document.getElementById('send-message');

// Elements for renaming and clearing chat
const chatTitle = document.getElementById('chat-title');
const renameChatButton = document.getElementById('rename-chat');
const clearChatButton = document.getElementById('clear-chat');
const renameModal = document.getElementById('rename-modal');
const closeModalButton = document.querySelector('.close-button');
const newChatNameInput = document.getElementById('new-chat-name');
const saveChatNameButton = document.getElementById('save-chat-name');

// State
let sessions = [];
let currentSessionId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();

  // Check if the URL has a session ID
  const urlParams = new URLSearchParams(window.location.search);
  const sessionIdFromURL = urlParams.get('session_id');
  if (sessionIdFromURL) {
    currentSessionId = sessionIdFromURL;
    loadSessionById(currentSessionId);
  } else {
    loadSessions();
  }
});

// Load sessions from localStorage
function loadSessions() {
  const savedSessions = JSON.parse(localStorage.getItem('sessions')) || [];
  sessions = savedSessions;
  renderSessionList();
  if (sessions.length > 0) {
    selectSession(sessions[0].id);
  } else {
    createNewSession();
  }
}

// Save sessions to localStorage
function saveSessions() {
  localStorage.setItem('sessions', JSON.stringify(sessions));
}

// Setup event listeners
function setupEventListeners() {
  // Send message on Enter key press
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Send message on button click
  sendMessageButton.addEventListener('click', sendMessage);

  // New chat session
  newChatButton.addEventListener('click', createNewSession);

  // Clear chat history
  clearChatButton.addEventListener('click', clearChatHistory); 

  // Delete chat session
  const deleteChatButton = document.getElementById('delete-chat');
  deleteChatButton.addEventListener('click', deleteChatSession); 

  // Rename chat event
  renameChatButton.addEventListener('click', openRenameModal);
  closeModalButton.addEventListener('click', closeRenameModal);
  saveChatNameButton.addEventListener('click', saveChatName);
}

// Create a new chat session and generate a session URL
async function createNewSession() {
  try {
    const response = await fetch(CREATE_SESSION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (data.status === 'success') {
      const sessionId = data.session_id;
      const sessionName = `Chat ${sessions.length + 1}`;
      sessions.unshift({
        id: sessionId,
        name: sessionName,
        messages: [],
      });
      saveSessions();
      renderSessionList();
      selectSession(sessionId);
      window.history.pushState({}, '', `?session_id=${sessionId}`);
    }
  } catch (error) {
    console.error('Error creating new session:', error);
  }
}

// Select a chat session
function selectSession(sessionId) {
  currentSessionId = sessionId;
  document.querySelectorAll('#session-list li').forEach((li) => {
    li.classList.remove('active');
    if (li.dataset.sessionId === sessionId) {
      li.classList.add('active');
    }
  });
  renderChatWindow();
}

// Load session by ID from URL
function loadSessionById(sessionId) {
  currentSessionId = sessionId;
  renderChatWindow();
}

// Render the session list
function renderSessionList() {
  sessionList.innerHTML = '';
  sessions.forEach((session) => {
    const li = document.createElement('li');
    li.dataset.sessionId = session.id;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = session.name;
    input.className = 'session-name';
    input.readOnly = true;

    li.addEventListener('click', () => {
      selectSession(session.id);
      window.history.pushState({}, '', `?session_id=${session.id}`);
    });

    li.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      input.readOnly = false;
      input.classList.add('editing');
      input.focus();
    });

    input.addEventListener('blur', () => {
      input.readOnly = true;
      input.classList.remove('editing');
      const sessionToUpdate = sessions.find(s => s.id === session.id);
      if (sessionToUpdate) {
        sessionToUpdate.name = input.value.trim() || 'Untitled Chat';
        saveSessions();
        chatTitle.textContent = sessionToUpdate.name;
        renderSessionList();
      }
    });

    li.appendChild(input);

    if (session.id === currentSessionId) {
      li.classList.add('active');
    }

    sessionList.appendChild(li);
  });
}

// Render the chat window
function renderChatWindow() {
  const session = sessions.find((s) => s.id === currentSessionId);
  if (!session) return;

  chatTitle.textContent = session.name;

  chatWindow.innerHTML = '';
  session.messages.forEach((msg) => {
    const messageElem = document.createElement('div');
    messageElem.classList.add('message', msg.role);
    const contentElem = document.createElement('div');
    contentElem.classList.add('message-content');
    contentElem.textContent = msg.content;
    messageElem.appendChild(contentElem);
    chatWindow.appendChild(messageElem);
  });
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Open rename modal
function openRenameModal() {
  const session = sessions.find((s) => s.id === currentSessionId);
  if (!session) return;
  newChatNameInput.value = session.name;
  renameModal.style.display = 'block';
}

// Close rename modal
function closeRenameModal() {
  renameModal.style.display = 'none';
}

// Save new chat name
function saveChatName() {
  const newName = newChatNameInput.value.trim();
  if (!newName) return;
  const session = sessions.find((s) => s.id === currentSessionId);
  if (!session) return;
  session.name = newName;
  saveSessions();
  renderSessionList();
  chatTitle.textContent = session.name;
  closeRenameModal();
}

// Send message to the server
async function sendMessage() {
  const content = messageInput.value.trim();
  if (!content) return;

  addMessageToChat('user', content);
  messageInput.value = '';

  const payload = {
    session_id: currentSessionId,
    messages: [{ role: 'user', content }],
  };

  try {
    const response = await fetch(STREAM_CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data.status === 'success') {
      addMessageToChat('assistant', data.response);
    } else {
      addMessageToChat('assistant', 'Error: ' + data.message);
    }
  } catch (error) {
    addMessageToChat('assistant', 'Error: ' + error.message);
  }
}

// Add message to the chat and session
function addMessageToChat(role, content) {
  const session = sessions.find((s) => s.id === currentSessionId);
  if (!session) return;

  const message = { role, content };
  session.messages.push(message);
  saveSessions();
  renderChatWindow();
}

// Clear chat history for the current session
async function clearChatHistory() {
  if (!currentSessionId) return;

  const confirmClear = confirm('Are you sure you want to clear the chat history?');
  if (!confirmClear) return;

  const payload = { session_id: currentSessionId };

  try {
    const response = await fetch(CLEAR_HISTORY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data.status === 'success') {
      const session = sessions.find(s => s.id === currentSessionId);
      if (session) {
        session.messages = []; 
        saveSessions(); 
        renderChatWindow();
        alert('Chat history cleared successfully.');
      }
    } else {
      alert('Error clearing chat history: ' + data.message);
    }
  } catch (error) {
    console.error('Error clearing chat history:', error);
    alert('Error clearing chat history.');
  }
}

// Function to delete the entire chat session
function deleteChatSession() {
  if (!currentSessionId) return;

  const confirmDelete = confirm('Are you sure you want to delete this chat session?');
  if (!confirmDelete) return;

  sessions = sessions.filter(session => session.id !== currentSessionId);
  saveSessions();
  renderSessionList();

  if (sessions.length > 0) {
    selectSession(sessions[0].id);
    window.history.pushState({}, '', `?session_id=${sessions[0].id}`);
  } else {
    createNewSession();
  }
}
