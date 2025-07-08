// Make Marked, Reveal.js, and its Markdown plugin available to the renderer process.
// This is possible because we have set nodeIntegration: true and contextIsolation: false in main.js.

window.marked = require('marked');
window.Reveal = require('reveal.js');
window.RevealMarkdown = require('reveal.js/plugin/markdown/markdown.js'); 