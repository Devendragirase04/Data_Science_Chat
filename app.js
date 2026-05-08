// ===== STATE =====
let messages = [];
let isLoading = false;
let sidebarOpen = true;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  document.getElementById('userInput').addEventListener('input', function () {
    document.getElementById('charCount').textContent = this.value.length;
    autoResize(this);
  });
  initCategories();
});

function checkMobile() {
  if (window.innerWidth <= 768 && sidebarOpen) closeSidebar();
}

// ===== SIDEBAR =====
function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('mainLayout');
  if (sidebarOpen) {
    sidebar.classList.remove('hidden');
    if (window.innerWidth > 768) main.classList.remove('full');
  } else {
    closeSidebar();
  }
}
function closeSidebar() {
  sidebarOpen = false;
  document.getElementById('sidebar').classList.add('hidden');
  document.getElementById('mainLayout').classList.add('full');
}

// ===== CATEGORY ACCORDION =====
function initCategories() {
  document.querySelectorAll('.cat-items').forEach(el => el.style.display = 'none');
}
function toggleCat(id) {
  const el = document.getElementById('cat-' + id);
  const arrow = document.getElementById('arr-' + id);
  const open = el.style.display !== 'none';
  el.style.display = open ? 'none' : 'flex';
  if (arrow) arrow.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
}

// ===== CHAT =====
function newChat() {
  messages = [];
  document.getElementById('messagesContainer').innerHTML = '';
  document.getElementById('welcomeScreen').style.display = 'flex';
  document.getElementById('userInput').value = '';
  document.getElementById('charCount').textContent = '0';
  if (window.innerWidth <= 768) closeSidebar();
}

function setTopic(text) {
  const inp = document.getElementById('userInput');
  inp.value = text;
  inp.focus();
  autoResize(inp);
  document.getElementById('charCount').textContent = text.length;
  if (window.innerWidth <= 768) closeSidebar();
}

function clearInput() {
  const inp = document.getElementById('userInput');
  inp.value = '';
  inp.style.height = 'auto';
  document.getElementById('charCount').textContent = '0';
  inp.focus();
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 200) + 'px';
}

async function sendMessage() {
  const input = document.getElementById('userInput');
  const text = input.value.trim();
  if (!text || isLoading) return;

  document.getElementById('welcomeScreen').style.display = 'none';
  input.value = '';
  input.style.height = 'auto';
  document.getElementById('charCount').textContent = '0';
  messages.push({ role: 'user', content: text });
  appendMessage('user', text);
  updateMsgCount();

  isLoading = true;
  const btn = document.getElementById('sendBtn');
  btn.classList.add('loading');
  const typingEl = appendTyping();

  try {
    // Call our secure Netlify Function
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Server Error');
    }

    typingEl.remove();
    const aiText = data.text;
    messages.push({ role: 'assistant', content: aiText });
    appendMessage('ai', aiText);
    updateMsgCount();

  } catch (err) {
    if (typingEl.parentNode) typingEl.remove();
    console.error("Chat Error:", err);
    appendMessage('ai', `⚠️ ${err.message || 'Something went wrong. Please try again.'}`);
  } finally {
    isLoading = false;
    btn.classList.remove('loading');
  }
}

function updateMsgCount() {
  document.getElementById('msgCount').textContent = messages.length;
}

// ===== RENDER MESSAGES =====
function appendMessage(role, text) {
  const container = document.getElementById('messagesContainer');
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerHTML = `
    <div class="msg-avatar ${role}">
      ${role === 'user'
        ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/></svg>`
        : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      }
    </div>
    <div class="msg-body">
      <div class="msg-label">${role === 'user' ? 'You' : 'DataScience By Dev'}</div>
      <div class="msg-text">${renderMarkdown(text)}</div>
    </div>`;
  container.appendChild(div);

  // Add copy buttons to code blocks
  div.querySelectorAll('pre').forEach(pre => {
    const code = pre.querySelector('code');
    const lang = [...(code?.classList || [])].find(c => c.startsWith('language-'))?.replace('language-', '') || 'code';
    const header = document.createElement('div');
    header.className = 'code-header';
    header.innerHTML = `<span class="code-lang">${lang.toUpperCase()}</span><button class="copy-btn" onclick="copyCode(this)">Copy</button>`;
    pre.prepend(header);
  });

  scrollBottom();
}

function appendTyping() {
  const container = document.getElementById('messagesContainer');
  const div = document.createElement('div');
  div.className = 'message ai';
  div.innerHTML = `
    <div class="msg-avatar ai">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <div class="msg-body">
      <div class="msg-label">DataScience By Dev</div>
      <div class="typing-dots"><span></span><span></span><span></span></div>
    </div>`;
  container.appendChild(div);
  scrollBottom();
  return div;
}

function scrollBottom() {
  const area = document.getElementById('chatArea');
  setTimeout(() => { area.scrollTop = area.scrollHeight; }, 60);
}

function copyCode(btn) {
  const code = btn.closest('pre').querySelector('code');
  navigator.clipboard.writeText(code.innerText).then(() => {
    btn.textContent = '✓ Copied';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
  });
}

// ===== MARKDOWN RENDERER =====
function renderMarkdown(text) {
  const escape = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const blocks = [];
  text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    blocks.push({ lang: lang || 'code', code: escape(code.trim()) });
    return `%%BLK${blocks.length - 1}%%`;
  });

  text = escape(text);
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  text = text.replace(/^\d+\. (.+)$/gm, '<li class="ol">$1</li>');
  text = text.replace(/^[-*] (.+)$/gm, '<li>$1</li>');
  text = text.replace(/(<li[^>]*>.*<\/li>\n?)+/g, m => {
    return m.includes('class="ol"') ? `<ol>${m}</ol>` : `<ul>${m}</ul>`;
  });
  text = text.replace(/^---$/gm, '<hr>');

  const lines = text.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }
    if (/^%%BLK\d+%%$/.test(line) || /^<(h[1-3]|ul|ol|li|hr)/.test(line)) {
      out.push(line);
    } else {
      let p = line;
      while (i + 1 < lines.length) {
        const next = lines[i + 1].trim();
        if (!next || /^%%BLK/.test(next) || /^<(h[1-3]|ul|ol|li|hr)/.test(next)) break;
        p += ' ' + next; i++;
      }
      out.push(`<p>${p}</p>`);
    }
    i++;
  }
  text = out.join('\n');

  text = text.replace(/%%BLK(\d+)%%/g, (_, i) => {
    const { lang, code } = blocks[+i];
    return `<pre><code class="language-${lang}">${code}</code></pre>`;
  });

  return text;
}