// Initialize elements
const textEditor = document.getElementById('textEditor');
const markdownEditor = document.getElementById('markdownEditor');
const preview = document.getElementById('preview');
const convertBtn = document.getElementById('convertBtn');
const headingSelect = document.getElementById('headingSelect');
const colorPicker = document.getElementById('color');

// NEW: Copy functions
async function copyLeftEditor() {
    const text = textEditor.innerText || textEditor.textContent;
    try {
        await navigator.clipboard.writeText(text);
        showCopyFeedback('copy-left');
    } catch(err) {
        fallbackCopyText(text);
    }
}

async function copyMarkdownEditor() {
    const text = markdownEditor.textContent;
    try {
        await navigator.clipboard.writeText(text);
        showCopyFeedback('copy-markdown');
    } catch(err) {
        fallbackCopyText(text);
    }
}

function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showCopyFeedback('copy-fallback');
}

function showCopyFeedback(type) {
    const btn = type === 'copy-left' ? 
        document.querySelector('.left .copy-btn') : 
        document.querySelector('.right .copy-btn');
    
    btn.classList.add('copied');
    btn.title = 'Copied!';
    
    setTimeout(() => {
        btn.classList.remove('copied');
        btn.title = 'Copy Markdown';
    }, 2000);
}

// Theme management
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    
    if (newTheme === 'dark') {
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light';
    } else {
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark';
    }
    
    localStorage.setItem('theme', newTheme);
}

// Image Modal
function openImageModal() {
    document.getElementById('imageModal').classList.add('show');
}

function closeImageModal() {
    document.getElementById('imageModal').classList.remove('show');
    document.getElementById('imageUrl').value = '';
    document.getElementById('imageFile').value = '';
}

async function insertImage() {
    const url = document.getElementById('imageUrl').value.trim();
    const fileInput = document.getElementById('imageFile');
    const file = fileInput.files;
    
    let imageMarkdown = '';
    
    if (url) {
        imageMarkdown = `\n\n`;
        insertAtCursor(imageMarkdown);
    } else if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imageMarkdown = `\n\n`;
            insertAtCursor(imageMarkdown);
            closeImageModal();
        };
        reader.readAsDataURL(file);
        return;
    }
    
    if (imageMarkdown) {
        insertAtCursor(imageMarkdown);
    }
    closeImageModal();
}

// Insert at cursor position
function insertAtCursor(text) {
    textEditor.focus();
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        document.execCommand('insertText', false, text);
    }
}

// Turndown service with cleanup
const turndownService = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    fence: '```',
    blankReplacement: (content, node) => ''
});

function cleanMarkdown(markdown) {
    return markdown
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim()
        .replace(/^- +/gm, '- ')
        .replace(/^\n+|\n+$/g, '');
}

function convertToMarkdown() {
    const html = textEditor.innerHTML;
    if (!html.trim()) return;
    
    let markdown = turndownService.turndown(html);
    markdown = cleanMarkdown(markdown);
    
    markdownEditor.textContent = markdown;
    preview.innerHTML = marked.parse(markdown, { breaks: true });
}

// Formatting functions
function formatText(command, value = null) {
    textEditor.focus();
    document.execCommand(command, false, value);
}

function increaseFontSize() {
    document.execCommand('fontSize', false, '7');
}

function decreaseFontSize() {
    document.execCommand('fontSize', false, '1');
}

function getQuoteHTML() {
    return '<blockquote style="border-left:4px solid var(--primary);padding-left:16px;margin:16px 0;">Text</blockquote>';
}

function insertLink() {
    const url = prompt('Enter URL:');
    if (url) {
        textEditor.focus();
        document.execCommand('createLink', false, url);
    }
}

function insertCodeBlock() {
    textEditor.focus();
    document.execCommand('insertHTML', false, '\n``````\n');
}

// Event listeners
headingSelect.addEventListener('change', () => {
    document.execCommand('formatBlock', false, headingSelect.value);
    headingSelect.blur();
});

colorPicker.addEventListener('change', () => {
    document.execCommand('foreColor', false, colorPicker.value);
});

document.addEventListener('keydown', (e) => {
    if (textEditor !== document.activeElement) return;
    
    if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
            case 'b': e.preventDefault(); formatText('bold'); break;
            case 'i': e.preventDefault(); formatText('italic'); break;
            case 'u': e.preventDefault(); formatText('underline'); break;
            case 'enter': 
                if (e.ctrlKey) {
                    e.preventDefault();
                    convertToMarkdown();
                }
                break;
        }
    }
    if (e.ctrlKey && e.shiftKey) {
        if (e.key === '>') { 
            e.preventDefault(); 
            increaseFontSize();
        }
        if (e.key === '<') { 
            e.preventDefault(); 
            decreaseFontSize();
        }
    }
});

convertBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    convertToMarkdown();
});

document.getElementById('imageModal').addEventListener('click', (e) => {
    if (e.target.classList.contains('image-modal')) {
        closeImageModal();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    
    if (savedTheme === 'dark') {
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light';
    }
    
    textEditor.focus();
});
