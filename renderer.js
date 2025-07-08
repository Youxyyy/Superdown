const { ipcRenderer } = require('electron');

// --- DOM Elements ---
const editor = document.getElementById('editor');
const previewArticle = document.getElementById('preview-article');
const previewSlides = document.getElementById('preview-slides');
const slidesContainer = document.getElementById('slides-container');
const modeArticleBtn = document.getElementById('mode-article');
const modeSlidesBtn = document.getElementById('mode-slides');
const btnImage = document.getElementById('btn-image');
const editorContainer = document.querySelector('.editor-container');
const appContainer = document.querySelector('.app-container');
const toolbar = document.querySelector('.toolbar');
const previewScrollHint = document.querySelector('#preview-slides .scroll-hint');
const presentationScrollHint = document.querySelector('#presentation-overlay .scroll-hint');

// --- Presentation Mode Elements ---
const presentationOverlay = document.getElementById('presentation-overlay');
const presentationSlidesContainer = document.getElementById('presentation-slides-container');
const btnPresent = document.getElementById('btn-present');
const btnExitPresentation = document.getElementById('btn-exit-presentation');

// --- Toolbar Buttons ---
const btnBold = document.getElementById('btn-bold');
const btnItalic = document.getElementById('btn-italic');
const btnH1 = document.getElementById('btn-h1');
const btnH2 = document.getElementById('btn-h2');
const btnH3 = document.getElementById('btn-h3');
const btnQuote = document.getElementById('btn-quote');
const btnLink = document.getElementById('btn-link');
const btnCode = document.getElementById('btn-code');
const btnUl = document.getElementById('btn-ul');
const btnOl = document.getElementById('btn-ol');
const btnStrikethrough = document.getElementById('btn-strikethrough');
const btnHr = document.getElementById('btn-hr');

// --- State ---
let currentMode = 'article'; // 'article' or 'slides'
let deck; // Reveal.js instance for the editor preview
let presentationDeck; // Separate Reveal.js instance for fullscreen presentation

// --- Functions ---

/**
 * Updates the active preview pane based on the current mode.
 */
function updateActivePane() {
    if (currentMode === 'article') {
        previewArticle.style.display = 'block';
        previewSlides.style.display = 'none';
        toolbar.classList.remove('mode-slides-active');
        if (deck) {
            deck.destroy();
            deck = null;
        }
    } else {
        previewArticle.style.display = 'none';
        previewSlides.style.display = 'block';
        toolbar.classList.add('mode-slides-active');
    }
}

/**
 * Renders the editor content into the appropriate preview pane.
 */
function renderContent() {
    const markdown = editor.value;

    if (currentMode === 'article') {
        previewArticle.innerHTML = window.marked.parse(markdown);
    } else {
        renderSlides(markdown);
        if (!deck) {
            initializeDeck();
        } else {
            deck.sync();
            deck.layout();
        }
    }
}

/**
 * Creates the DOM structure for Reveal.js slides.
 * @param {string} markdown - The full Markdown content from the editor.
 */
function renderSlides(markdown) {
    const slides = markdown.split(/^\s*---\s*$/m);
    slidesContainer.innerHTML = ''; // Clear existing slides

    for (const slideContent of slides) {
        const section = document.createElement('section');
        section.setAttribute('data-markdown', '');
        const script = document.createElement('script');
        script.type = 'text/template';
        script.textContent = slideContent.trim();
        section.appendChild(script);
        slidesContainer.appendChild(section);
    }
}

/**
 * Initializes the Reveal.js presentation deck.
 */
function initializeDeck() {
    if (deck) {
        deck.destroy(); 
    }
    deck = new window.Reveal(document.querySelector('#preview-slides .reveal'), {
        embedded: true,
        plugins: [ window.RevealMarkdown ]
    });
    deck.initialize().then(() => {
        updateScrollHint(deck, previewScrollHint);
        deck.on('slidechanged', () => updateScrollHint(deck, previewScrollHint));
    });
}

/**
 * Checks if the current slide is overflowing and shows/hides the scroll hint.
 * Also attaches a scroll listener to hide the hint when scrolled to the bottom.
 * @param {object} deckInstance - The Reveal.js deck instance.
 * @param {HTMLElement} hintElement - The hint element to control.
 */
function updateScrollHint(deckInstance, hintElement) {
    if (!deckInstance || !deckInstance.isReady() || !hintElement) return;

    const currentSlide = deckInstance.getCurrentSlide();

    const checkPositionAndToggleHint = () => {
        const isOverflowing = currentSlide.scrollHeight > currentSlide.clientHeight;
        // Check if scrolled to the very bottom (with a small tolerance)
        const isAtBottom = currentSlide.scrollTop + currentSlide.clientHeight >= currentSlide.scrollHeight - 5;

        if (isOverflowing && !isAtBottom) {
            hintElement.classList.add('visible');
        } else {
            hintElement.classList.remove('visible');
        }
    };

    // Attach a scroll listener to the slide itself
    currentSlide.removeEventListener('scroll', checkPositionAndToggleHint); // Prevent duplicate listeners
    currentSlide.addEventListener('scroll', checkPositionAndToggleHint);

    // Check the initial state when the slide loads
    checkPositionAndToggleHint();
}

/**
 * Enters fullscreen presentation mode.
 */
function enterPresentationMode() {
    const markdown = editor.value;
    const slides = markdown.split(/^\s*---\s*$/m);
    presentationSlidesContainer.innerHTML = ''; // Clear existing slides

    for (const slideContent of slides) {
        const section = document.createElement('section');
        section.setAttribute('data-markdown', '');
        const script = document.createElement('script');
        script.type = 'text/template';
        script.textContent = slideContent.trim();
        section.appendChild(script);
        presentationSlidesContainer.appendChild(section);
    }
    
    presentationOverlay.style.display = 'block';

    if (presentationDeck) {
        presentationDeck.destroy();
    }
    
    presentationDeck = new window.Reveal(presentationOverlay.querySelector('.reveal'), {
        // Fullscreen, standalone configuration
        plugins: [ window.RevealMarkdown ]
    });
    presentationDeck.initialize().then(() => {
        updateScrollHint(presentationDeck, presentationScrollHint);
        presentationDeck.on('slidechanged', () => updateScrollHint(presentationDeck, presentationScrollHint));
    });
}

/**
 * Exits fullscreen presentation mode.
 */
function exitPresentationMode() {
    if (presentationDeck) {
        presentationDeck.destroy();
        presentationDeck = null;
    }
    presentationOverlay.style.display = 'none';
    presentationSlidesContainer.innerHTML = '';
}

/**
 * Wraps selected text in the editor with given markdown syntax.
 * @param {string} prefix - The string to add before the selection.
 * @param {string} suffix - The string to add after the selection.
 * @param {string} placeholder - The default text if nothing is selected.
 */
function wrapText(prefix, suffix = '', placeholder = '') {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);
    const textToInsert = selectedText || placeholder;

    const newText = `${editor.value.substring(0, start)}${prefix}${textToInsert}${suffix}${editor.value.substring(end)}`;
    editor.value = newText;
    
    // Update selection
    if (selectedText) {
        editor.selectionStart = start + prefix.length;
        editor.selectionEnd = end + prefix.length;
    } else {
        editor.selectionStart = start + prefix.length;
        editor.selectionEnd = start + prefix.length + placeholder.length;
    }
    
    editor.focus();
    renderContent();
}

/**
 * Formats selected lines as a markdown list.
 * @param {string} listType - 'ul' for unordered, 'ol' for ordered.
 */
function formatList(listType) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    let selectedLines = editor.value.substring(start, end).split('\n');

    let lineCounter = 1;
    const formattedLines = selectedLines.map(line => {
        if (line.trim() === '') return line;
        
        if (listType === 'ul') {
            return `- ${line}`;
        } else if (listType === 'ol') {
            return `${lineCounter++}. ${line}`;
        }
        return line;
    }).join('\n');

    const newText = `${editor.value.substring(0, start)}${formattedLines}${editor.value.substring(end)}`;
    editor.value = newText;

    editor.selectionStart = start;
    editor.selectionEnd = start + formattedLines.length;
    
    editor.focus();
    renderContent();
}

// --- Event Listeners ---

editor.addEventListener('input', renderContent);

modeArticleBtn.addEventListener('click', () => {
    currentMode = 'article';
    modeArticleBtn.classList.add('active');
    modeSlidesBtn.classList.remove('active');
    updateActivePane();
    renderContent();
});

modeSlidesBtn.addEventListener('click', () => {
    currentMode = 'slides';
    modeSlidesBtn.classList.add('active');
    modeArticleBtn.classList.remove('active');
    updateActivePane();
    renderContent();
});

// --- Toolbar Event Listeners ---
btnBold.addEventListener('click', () => wrapText('**', '**', 'bold text'));
btnItalic.addEventListener('click', () => wrapText('*', '*', 'italic text'));
btnH1.addEventListener('click', () => wrapText('\n# ', '\n', 'Heading 1'));
btnH2.addEventListener('click', () => wrapText('\n## ', '\n', 'Heading 2'));
btnH3.addEventListener('click', () => wrapText('\n### ', '\n', 'Heading 3'));
btnQuote.addEventListener('click', () => wrapText('\n> ', '\n', 'Quote'));
btnLink.addEventListener('click', () => wrapText('[', '](url)', 'link text'));
btnCode.addEventListener('click', () => wrapText('\n```\n', '\n```\n', 'code'));
btnUl.addEventListener('click', () => formatList('ul'));
btnOl.addEventListener('click', () => formatList('ol'));
btnStrikethrough.addEventListener('click', () => wrapText('~~', '~~', 'deleted text'));
btnHr.addEventListener('click', () => wrapText('\n\n---\n\n', '', ''));
btnImage.addEventListener('click', () => wrapText('![', '](image_url)', 'alt text'));

// --- Presentation Listeners ---
btnPresent.addEventListener('click', enterPresentationMode);
btnExitPresentation.addEventListener('click', exitPresentationMode);
window.addEventListener('keyup', (e) => {
    if (e.key === 'Escape' && presentationDeck) {
        exitPresentationMode();
    }
});

// --- IPC Comms ---
ipcRenderer.on('file-opened', (event, content) => {
    editor.value = content;
    renderContent();
});

ipcRenderer.on('get-content-for-save', () => {
    ipcRenderer.send('save-content', editor.value);
});

ipcRenderer.on('export-pdf', () => {
    // 确保我们在文章模式下
    if (currentMode !== 'article') {
        modeArticleBtn.click();
    }
    
    // 获取当前的 Markdown 内容并转换为 HTML
    const markdown = editor.value;
    const htmlContent = window.marked.parse(markdown);
    
    // 创建一个临时容器来应用样式
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = htmlContent;
    tempContainer.className = 'markdown-body';
    
    // 隐藏编辑器界面
    appContainer.classList.add('printing');
    
    // 发送内容到主进程进行 PDF 生成
    setTimeout(() => {
        ipcRenderer.send('pdf-content', {
            html: tempContainer.outerHTML,
            css: document.querySelector('link[href*="style.css"]').href
        });
    }, 100);
});

ipcRenderer.on('pdf-generation-complete', () => {
    // Restore the UI
    appContainer.classList.remove('printing');
});

// --- Initial Setup ---
window.addEventListener('DOMContentLoaded', () => {
    updateActivePane();
    renderContent();
}); 