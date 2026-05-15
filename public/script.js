// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.add('scrolled'); // keep transparent optionally, or style
        if(window.scrollY < 10) navbar.classList.remove('scrolled');
    }
});

// Mobile Menu
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links a');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = hamburger.querySelector('i');
    if(navLinks.classList.contains('active')){
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.querySelector('i').classList.remove('fa-times');
        hamburger.querySelector('i').classList.add('fa-bars');
    });
});

// Reveal Animation (Intersection Observer)
const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
};

const revealOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

revealElements.forEach(el => revealObserver.observe(el));

// Animated Counter
const counters = document.querySelectorAll('.counter');
let hasCounted = false;

const startCounters = () => {
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 2000; // ms
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.innerText = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target + "+";
            }
        };
        updateCounter();
    });
};

const statsSection = document.querySelector('.hero-stats');
const statsObserver = new IntersectionObserver((entries) => {
    if(entries[0].isIntersecting && !hasCounted) {
        startCounters();
        hasCounted = true;
    }
}, { threshold: 0.5 });

if(statsSection) statsObserver.observe(statsSection);

// --- Chatbot Logic ---
const chatbotContainer = document.getElementById('chatbot-container');
const chatBody = document.getElementById('chat-body');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const promptBtns = document.querySelectorAll('.prompt-btn');
const chatPrompts = document.getElementById('chat-prompts');

// Conversation State
let conversationHistory = [];

const createMessageElement = (text, sender) => {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    
    const icon = sender === 'ai' ? 'fa-robot' : 'fa-user';
    
    msgDiv.innerHTML = `
        <div class="avatar"><i class="fas ${icon}"></i></div>
        <div class="bubble">${text}</div>
    `;
    return msgDiv;
};

const showTypingIndicator = () => {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'ai');
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="avatar"><i class="fas fa-robot"></i></div>
        <div class="typing-indicator">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
};

const removeTypingIndicator = () => {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
};

const handleSendMessage = async (userText) => {
    if (!userText.trim()) return;

    // Hide prompts after first message
    chatPrompts.style.display = 'none';

    // UI Update - User message
    chatBody.appendChild(createMessageElement(userText, 'user'));
    chatInput.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;

    // Add to history
    conversationHistory.push({ role: 'user', text: userText });

    // Show indicator
    showTypingIndicator();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversation: conversationHistory })
        });

        const data = await response.json();
        removeTypingIndicator();

        if (response.ok) {
            const aiText = data.text;
            chatBody.appendChild(createMessageElement(aiText, 'ai'));
            conversationHistory.push({ role: 'ai', text: aiText });
        } else {
            chatBody.appendChild(createMessageElement("Maaf, terjadi kesalahan saat menghubungi server.", 'ai'));
        }
    } catch (error) {
        removeTypingIndicator();
        chatBody.appendChild(createMessageElement("Gagal terhubung. Pastikan API berjalan.", 'ai'));
        console.error(error);
    }
    
    chatBody.scrollTop = chatBody.scrollHeight;
};

sendBtn.addEventListener('click', () => handleSendMessage(chatInput.value));
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage(chatInput.value);
});

promptBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        handleSendMessage(btn.innerText);
    });
});
