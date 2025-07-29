  // Datos de ejemplo
        const currentUser = { id: 1, name: 'Tú', role: 'attendee' };
        
        const sampleMessages = [
            {
                id: 1,
                user: { name: 'Carlos Rodríguez', role: 'organizer' },
                content: '¡Bienvenidos a la Conferencia Tech 2024! Esperamos que disfruten de todas las charlas.',
                time: '10:30 AM',
                isOwn: false
            },
            {
                id: 2,
                user: { name: 'María González', role: 'attendee' },
                content: '¡Muchas gracias! Muy emocionada por la charla de IA.',
                time: '10:32 AM',
                isOwn: false
            },
            {
                id: 3,
                user: { name: 'Tú', role: 'attendee' },
                content: '¿A qué hora inicia la primera charla?',
                time: '10:35 AM',
                isOwn: true
            },
            {
                id: 4,
                user: { name: 'Ana López', role: 'organizer' },
                content: 'La primera charla inicia a las 11:00 AM. ¡No lleguen tarde!',
                time: '10:36 AM',
                isOwn: false
            }
        ];

        // Referencias DOM
        const messagesArea = document.getElementById('messages-area');
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        const contactToggle = document.getElementById('contact-toggle');
        const contactInfo = document.getElementById('contact-info');
        const typingIndicator = document.getElementById('typing-indicator');

        // Variables
        let messageIdCounter = 5;
        let typingTimeout;

        // Renderizar mensajes
        function renderMessage(message) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.user.role} ${message.isOwn ? 'own' : ''}`;
            
            messageDiv.innerHTML = `
                <div class="message-header">
                    <span class="user-name">${message.user.name}</span>
                    <span class="user-role role-${message.user.role}">${message.user.role === 'organizer' ? 'Organizador' : 'Asistente'}</span>
                    <span class="message-time">${message.time}</span>
                </div>
                <div class="message-content">${message.content}</div>
            `;
            
            return messageDiv;
        }

        // Cargar mensajes iniciales
        function loadMessages() {
            sampleMessages.forEach(message => {
                messagesArea.appendChild(renderMessage(message));
            });
            scrollToBottom();
        }

        // Scroll al final
        function scrollToBottom() {
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }

        // Enviar mensaje
        function sendMessage() {
            const content = messageInput.value.trim();
            if (!content) return;

            const newMessage = {
                id: messageIdCounter++,
                user: currentUser,
                content: content,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isOwn: true
            };

            messagesArea.appendChild(renderMessage(newMessage));
            messageInput.value = '';
            adjustTextareaHeight();
            scrollToBottom();

            // Simular respuesta automática después de 2 segundos
            setTimeout(() => {
                simulateResponse();
            }, 2000);
        }

        // Simular respuesta
        function simulateResponse() {
            const responses = [
                { user: { name: 'Carlos Rodríguez', role: 'organizer' }, content: '¡Gracias por tu participación!' },
                { user: { name: 'Ana López', role: 'organizer' }, content: 'Excelente pregunta, te responderé por privado.' },
                { user: { name: 'María González', role: 'attendee' }, content: 'Estoy de acuerdo contigo.' },
                { user: { name: 'Dr. Miguel Torres', role: 'organizer' }, content: 'Muy buen punto, lo discutiremos en la próxima sesión.' }
            ];

            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            const responseMessage = {
                id: messageIdCounter++,
                user: randomResponse.user,
                content: randomResponse.content,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isOwn: false
            };

            // Mostrar indicador de escritura
            showTypingIndicator(randomResponse.user.name);
            
            setTimeout(() => {
                hideTypingIndicator();
                messagesArea.appendChild(renderMessage(responseMessage));
                scrollToBottom();
            }, 1500);
        }

        // Indicador de escritura
        function showTypingIndicator(userName) {
            typingIndicator.style.display = 'flex';
            typingIndicator.querySelector('span').textContent = `${userName} está escribiendo`;
        }

        function hideTypingIndicator() {
            typingIndicator.style.display = 'none';
        }

        // Ajustar altura del textarea
        function adjustTextareaHeight() {
            messageInput.style.height = 'auto';
            messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
        }

        // Event listeners
        sendButton.addEventListener('click', sendMessage);

        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        messageInput.addEventListener('input', () => {
            adjustTextareaHeight();
            
            // Simular indicador de escritura
            clearTimeout(typingTimeout);
            // Aquí iría la lógica para notificar que el usuario está escribiendo
            
            typingTimeout = setTimeout(() => {
                // Aquí iría la lógica para notificar que el usuario dejó de escribir
            }, 1000);
        });

        contactToggle.addEventListener('click', () => {
            contactInfo.classList.toggle('show');
        });

        // Cerrar panel de contacto al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!contactInfo.contains(e.target) && !contactToggle.contains(e.target)) {
                contactInfo.classList.remove('show');
            }
        });

        // Inicializar
        loadMessages();