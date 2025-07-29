  let selectedRating = 0;
        const stars = document.querySelectorAll('.star');
        const ratingFeedback = document.getElementById('rating-feedback');
        const textarea = document.getElementById('comments');
        const charCounter = document.getElementById('char-counter');
        const form = document.getElementById('feedback-form');
        const submitBtn = document.getElementById('submit-btn');
        const successMessage = document.getElementById('success-message');

        const ratingMessages = {
            1: { text: "😞 Lo sentimos, ¿qué podemos mejorar?", color: "#ef4444" },
            2: { text: "😐 Hay margen para mejorar", color: "#f97316" },
            3: { text: "😊 Una experiencia decente", color: "#eab308" },
            4: { text: "😃 ¡Nos alegra que te haya gustado!", color: "#22c55e" },
            5: { text: "🤩 ¡Increíble! Eres fantástico", color: "#8b5cf6" }
        };

        // Manejo de estrellas
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.value);
                updateStars();
                showRatingFeedback();
            });

            star.addEventListener('mouseenter', () => {
                const value = parseInt(star.dataset.value);
                highlightStars(value);
            });
        });

        document.querySelector('.stars').addEventListener('mouseleave', () => {
            updateStars();
        });

        function highlightStars(rating) {
            stars.forEach((star, index) => {
                if (index < rating) {
                    star.style.color = '#fbbf24';
                    star.style.transform = 'scale(1.1)';
                } else {
                    star.style.color = '#e2e8f0';
                    star.style.transform = 'scale(1)';
                }
            });
        }

        function updateStars() {
            stars.forEach((star, index) => {
                star.classList.toggle('active', index < selectedRating);
                if (index < selectedRating) {
                    star.style.color = '#f59e0b';
                } else {
                    star.style.color = '#e2e8f0';
                    star.style.transform = 'scale(1)';
                }
            });
        }

        function showRatingFeedback() {
            if (selectedRating > 0) {
                const message = ratingMessages[selectedRating];
                ratingFeedback.textContent = message.text;
                ratingFeedback.style.color = message.color;
                ratingFeedback.style.opacity = '1';
                ratingFeedback.style.transform = 'translateY(0)';
            }
        }

        // Contador de caracteres
        textarea.addEventListener('input', () => {
            const length = textarea.value.length;
            charCounter.textContent = `${length}/500`;
            
            if (length > 450) {
                charCounter.style.color = '#ef4444';
            } else if (length > 400) {
                charCounter.style.color = '#f97316';
            } else {
                charCounter.style.color = '#a0aec0';
            }
        });

        // Manejo del formulario
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (selectedRating === 0) {
                // Animar las estrellas para indicar que son requeridas
                stars.forEach(star => {
                    star.style.animation = 'none';
                    setTimeout(() => {
                        star.style.animation = 'shake 0.5s ease-in-out';
                    }, 10);
                });
                return;
            }

            // Simular envío
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
            
            setTimeout(() => {
                // Mostrar mensaje de éxito
                successMessage.classList.add('show');
                
                setTimeout(() => {
                    successMessage.classList.remove('show');
                    
                    // Reset form
                    selectedRating = 0;
                    textarea.value = '';
                    charCounter.textContent = '0/500';
                    ratingFeedback.style.opacity = '0';
                    updateStars();
                    
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Enviar Feedback';
                }, 2000);
            }, 1500);
        });

        // Animación de shake para validación
        const shakeStyle = document.createElement('style');
        shakeStyle.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(shakeStyle);

        // Inicializar contador
        charCounter.textContent = '0/500';