(function () {
	const WIDGET_ID = 'clx-chatbot';

	function createElement(tag, className, attrs) {
		const el = document.createElement(tag);
		if (className) el.className = className;
		if (attrs) Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
		return el;
	}

	function ensureWidget() {
		if (document.getElementById(WIDGET_ID)) return;

		// Toggle button
		const button = createElement('button', 'clx-chatbot-button', { id: WIDGET_ID + '-button', 'aria-label': 'Open chat' });
		button.innerHTML = svgChatIcon();

		// Panel
		const panel = createElement('div', 'clx-chatbot-panel', { id: WIDGET_ID + '-panel', role: 'dialog', 'aria-modal': 'false', 'aria-label': 'Assistant' });

		const header = createElement('div', 'clx-chatbot-header');
		const left = createElement('div', 'clx-header-left');
		const avatar = createElement('div', 'clx-avatar');
		avatar.innerHTML = svgBotBadge();
		const title = createElement('div', 'clx-title');
		title.textContent = 'Codelix Assistant';
		const subtitle = createElement('div', 'clx-subtitle');
		subtitle.textContent = 'Always here to help';
		const titleCol = createElement('div', 'clx-title-col');
		titleCol.appendChild(title);
		titleCol.appendChild(subtitle);
		left.appendChild(avatar);
		left.appendChild(titleCol);
		const actions = createElement('div', 'clx-actions');
		const menuBtn = createElement('button', 'clx-icon-button', { title: 'Menu', 'aria-haspopup': 'true', 'aria-expanded': 'false' });
		menuBtn.innerHTML = svgMenuIcon();
		const menu = createElement('div', 'clx-menu', { role: 'menu', 'aria-label': 'Chat options' });
		const optNew = createElement('button', 'clx-menu-item', { role: 'menuitem' });
		optNew.textContent = 'Start new conversation';
		menu.appendChild(optNew);
		const closeBtn = createElement('button', 'clx-icon-button', { title: 'Close' });
		closeBtn.innerHTML = svgCloseIcon();
		actions.appendChild(menuBtn);
		actions.appendChild(menu);
		actions.appendChild(closeBtn);
		header.appendChild(left);
		header.appendChild(actions);

		const messages = createElement('div', 'clx-chatbot-messages', { id: WIDGET_ID + '-messages' });
		const quick = createElement('div', 'clx-quick');
		const quickLabel = createElement('div', 'clx-quick-label');
		quickLabel.textContent = 'Quick questions:';
		const quickList = createElement('div', 'clx-quick-list');
		quick.appendChild(quickLabel);
		quick.appendChild(quickList);
		const inputWrap = createElement('div', 'clx-chatbot-input');
		const input = createElement('input', null, { type: 'text', placeholder: 'Type your message...', 'aria-label': 'Message' });
		const sendBtn = createElement('button', 'clx-send-button', { disabled: 'true', 'aria-label': 'Send message' });
		sendBtn.innerHTML = svgSendIcon();
		inputWrap.appendChild(input);
		inputWrap.appendChild(sendBtn);

		panel.appendChild(header);
		panel.appendChild(messages);
		panel.appendChild(quick);
		panel.appendChild(inputWrap);

		document.body.appendChild(button);
		document.body.appendChild(panel);

		function toggle(open) {
			const isOpen = panel.classList.contains('clx-open');
			const next = open !== undefined ? open : !isOpen;
			panel.classList.toggle('clx-open', next);
			panel.setAttribute('aria-modal', String(next));
			// Hide the floating button when open so the panel replaces it
			button.classList.toggle('clx-hidden', next);
			if (!next) closeMenu();
			if (next) input.focus();
		}

		function openMenu() {
			menu.classList.add('open');
			menuBtn.setAttribute('aria-expanded', 'true');
		}

		function closeMenu() {
			menu.classList.remove('open');
			menuBtn.setAttribute('aria-expanded', 'false');
		}

		button.addEventListener('click', () => toggle());
		menuBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			if (menu.classList.contains('open')) closeMenu(); else openMenu();
		});
		document.addEventListener('click', (e) => {
			if (!actions.contains(e.target)) closeMenu();
		});
		optNew.addEventListener('click', () => { closeMenu(); newConversation(); });
		closeBtn.addEventListener('click', () => { closeMenu(); toggle(false); });

		input.addEventListener('input', () => {
			sendBtn.disabled = input.value.trim().length === 0;
		});

		sendBtn.addEventListener('click', handleSend);
		input.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				handleSend();
			}
		});

		let threadId = getThreadId();
		let conversation = loadConversation(threadId);
		welcome();
		initQuickQuestions();

		function handleSend() {
			const text = input.value.trim();
			if (!text) return;
			addMessage(text, 'user');
			// remove quick questions after first typed message
			const quickSection = panel.querySelector('.clx-quick');
			if (quickSection) quickSection.remove();
			input.value = '';
			sendBtn.disabled = true;
			showTyping();
			sendToWebhook(text, threadId, conversation).then((reply) => {
				hideTyping();
				addMessage(reply, 'bot');
			}).catch(() => {
				hideTyping();
				addMessage('Sorry, something went wrong. Please try again later.', 'bot');
			});
		}

		function addMessage(text, who) {
			const row = createElement('div', `clx-msg-row ${who === 'user' ? 'clx-row-user' : 'clx-row-bot'}`);
			const msg = createElement('div', `clx-msg ${who === 'user' ? 'clx-msg-user' : 'clx-msg-bot'}`);
			msg.textContent = text;
			row.appendChild(msg);
			messages.appendChild(row);
			messages.scrollTop = messages.scrollHeight;

			// persist conversation memory
			try {
				conversation.push({ role: who, content: text, ts: Date.now() });
				saveConversation(threadId, conversation);
			} catch (_) {}
		}

		let typingRow = null;
		function showTyping() {
			if (typingRow) return;
			typingRow = createElement('div', 'clx-msg-row');
			const bubble = createElement('div', 'clx-msg clx-msg-bot');
			const dots = createElement('div', 'clx-typing');
			for (let i = 0; i < 3; i++) dots.appendChild(createElement('span', 'dot'));
			bubble.appendChild(dots);
			typingRow.appendChild(bubble);
			messages.appendChild(typingRow);
			messages.scrollTop = messages.scrollHeight;
		}

		function hideTyping() {
			if (!typingRow) return;
			messages.removeChild(typingRow);
			typingRow = null;
		}

		function welcome() {
			addMessage('Welcome to Codelix IT Solutions Pvt. Ltd.! I\'m your virtual assistant. What can I do for you today?', 'bot');
		}

		function initQuickQuestions() {
			const examples = [
				'What services do you offer?',
				'How can I get a quote for my project?',
				'Do you provide ongoing support after project delivery?'
			];
			const container = panel.querySelector('.clx-quick-list');
			examples.forEach(text => {
				const chip = createElement('button', 'clx-quick-chip');
				chip.textContent = text;
				chip.addEventListener('click', () => {
					addMessage(text, 'user');
					// remove quick questions after first interaction
					const quickSection = panel.querySelector('.clx-quick');
					if (quickSection) quickSection.remove();
					showTyping();
					sendToStaticWebhook(text, threadId).then((reply) => {
						hideTyping();
						addMessage(reply, 'bot');
					}).catch(() => {
						hideTyping();
						addMessage('Sorry, something went wrong. Please try again later.', 'bot');
					});
				});
				container.appendChild(chip);
			});
		}

		function getThreadId() { try { let id = localStorage.getItem('clxChatThreadId'); if (!id) { id = 'clx_' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10); localStorage.setItem('clxChatThreadId', id); } return id; } catch (_) { return 'clx_' + Date.now().toString(36); } }
		function storageKeyFor(id) { return 'clxChatHistory:' + id; }
		function loadConversation(id) { try { const raw = localStorage.getItem(storageKeyFor(id)); return raw ? JSON.parse(raw) : []; } catch (_) { return []; } }
		function saveConversation(id, items) { try { const trimmed = items.slice(-50); localStorage.setItem(storageKeyFor(id), JSON.stringify(trimmed)); } catch (_) {} }

		function createNewThreadId() {
			try {
				const id = 'clx_' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
				localStorage.setItem('clxChatThreadId', id);
				return id;
			} catch (_) {
				return 'clx_' + Date.now().toString(36);
			}
		}

		function recreateQuickSection() {
			const existing = panel.querySelector('.clx-quick');
			if (existing) existing.remove();
			const quick = createElement('div', 'clx-quick');
			const quickLabel = createElement('div', 'clx-quick-label');
			quickLabel.textContent = 'Quick questions:';
			const quickList = createElement('div', 'clx-quick-list');
			quick.appendChild(quickLabel);
			quick.appendChild(quickList);
			panel.insertBefore(quick, inputWrap);
			initQuickQuestions();
		}

		function newConversation() {
			messages.innerHTML = '';
			try { localStorage.removeItem(storageKeyFor(threadId)); } catch (_) {}
			conversation = [];
			threadId = createNewThreadId();
			welcome();
			recreateQuickSection();
			input.value = '';
			sendBtn.disabled = true;
		}

		async function sendToWebhook(userText, id, history) {
			const url = 'https://n8n.realxr.in/webhook/chatbot';
			const payload = { message: userText, threadId: id, history: (history || []).map(({ role, content }) => ({ role, content })) };
			try {
				const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
				const contentType = res.headers.get('content-type') || '';
				if (contentType.includes('application/json')) { const data = await res.json(); return extractReplyFromJson(data); }
				else { const text = await res.text(); if (text && text.trim().startsWith('{')) { try { return extractReplyFromJson(JSON.parse(text)); } catch {} } return text && text.trim().length ? text : 'Received an empty response.'; }
			} catch (e) { return Promise.reject(e); }
		}

		async function sendToStaticWebhook(question, id) {
			const url = 'https://n8n.realxr.in/webhook/static-question';
			const payload = { question, threadId: id };
			try {
				const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
				const contentType = res.headers.get('content-type') || '';
				if (contentType.includes('application/json')) { const data = await res.json(); return extractReplyFromJson(data); }
				else { const text = await res.text(); if (text && text.trim().startsWith('{')) { try { return extractReplyFromJson(JSON.parse(text)); } catch {} } return text && text.trim().length ? text : 'Received an empty response.'; }
			} catch (e) { return Promise.reject(e); }
		}

		function extractReplyFromJson(data) {
			// If it's a string, return directly
			if (typeof data === 'string') return data;
			// If array like [{"answer":"..."}] or [{"output":"..."}] return first meaningful field
			if (Array.isArray(data) && data.length > 0) {
				const first = data[0];
				if (first && typeof first === 'object') {
					if (first.answer) return String(first.answer);
					if (first.output) return String(first.output);
					if (first.message) return String(first.message);
					if (first.text) return String(first.text);
				}
			}
			// If object
			if (!data || typeof data !== 'object') return 'Received an empty response.';
			if (data.answer) return String(data.answer);
			if (data.output) return String(data.output);
			if (data.reply) return String(data.reply);
			if (data.message) return String(data.message);
			if (data.text) return String(data.text);
			try { return JSON.stringify(data); } catch { return 'Received a response.'; }
		}

		function replyFor(text) {
			const t = text.toLowerCase();
			if (includesAny(t, ['hi', 'hello', 'hey'])) { return 'Hello! How can I help you today?'; }
			if (includesAny(t, ['service', 'services', 'what do you offer'])) { return 'We offer web development, UI/UX design, branding, and SEO. Check the Services page for details.'; }
			if (includesAny(t, ['portfolio', 'work', 'case study'])) { return 'You can browse our recent projects on the Portfolio page.'; }
			if (includesAny(t, ['price', 'pricing', 'cost', 'quote'])) { return 'Pricing depends on scope. Share your requirements via the Contact page and we will provide a quote.'; }
			if (includesAny(t, ['contact', 'email', 'phone'])) { return 'Use the Contact page form or email us. We typically reply within 1 business day.'; }
			if (includesAny(t, ['help', 'support'])) { return 'I can guide you around the site. Ask about services, portfolio, or contact options.'; }
			return 'Thanks! I\'ll pass this along. For specific inquiries, the Contact page is the fastest way to reach us.';
		}

		function includesAny(text, keywords) { return keywords.some(k => text.includes(k)); }

		function svgChatIcon() { return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9.5l-3.7 3.7A1 1 0 0 1 4 19.99V5z" fill="currentColor"/></svg>'; }
		function svgBotBadge() { return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.35)"/><path d="M8 10a4 4 0 0 1 8 0v2a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-2z" stroke="#fff" stroke-width="1.5" fill="none"/><circle cx="10" cy="11" r="1" fill="#fff"/><circle cx="14" cy="11" r="1" fill="#fff"/></svg>'; }
		function svgCloseIcon() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'; }
		function svgMinimizeIcon() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'; }
		function svgSendIcon() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3.4 11.2l16.7-7.1c.6-.3 1.2.3.9.9l-7.1 16.7c-.2.6-1.1.5-1.3-.1l-1.9-6.1-6.1-1.9c-.6-.2-.7-1.1-.1-1.4z"/></svg>'; }
		function svgMenuIcon() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4z" fill="currentColor"/></svg>'; }
	}

	if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', ensureWidget); } else { ensureWidget(); }
})();


