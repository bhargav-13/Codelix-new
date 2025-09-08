# Codelix Chatbot Widget

This project now includes a lightweight floating chatbot shown on every page.

- css/chatbot.css — widget styles
- js/chatbot.js — widget UI + simple rule-based replies

How it works:
- A round button appears at bottom-right. Click to open the panel.
- The bot greets the user and supports basic questions about services, portfolio, pricing, and contact.
- Typing indicator dots appear while generating a reply.

Customize replies:
- In js/chatbot.js, edit the replyFor(text) function to tweak intents and responses.

Connect a real AI backend (optional):
- Replace the setTimeout block in handleSend() with a fetch('/api/chat') call to your server that forwards to OpenAI, Azure OpenAI, Gemini, etc.

```js
// inside handleSend()
showTyping();
fetch('https://YOUR_ENDPOINT/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: text, threadId: 'optional-user-session-id' })
}).then(r => r.json()).then(data => {
  hideTyping();
  addMessage(data.reply || 'Sorry, no reply received.', 'bot');
}).catch(() => {
  hideTyping();
  addMessage('Sorry, something went wrong. Please try again later.', 'bot');
});
```

Notes:
- Assets are included in index.html, service.html, portfolio.html, contact.html, blog.html.
- Adjust gradients, sizes, or positions in css/chatbot.css.
- No external dependencies required.

