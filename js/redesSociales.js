 function shareOnFacebook() {
            const url = encodeURIComponent(window.location.href);
            const text = encodeURIComponent("¡Acabo de tener una experiencia increíble!");
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank', 'width=600,height=400');
        }

        function shareOnTwitter() {
            const url = encodeURIComponent(window.location.href);
            const text = encodeURIComponent("¡Acabo de tener una experiencia increíble! 🚀");
            window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
        }

        function shareOnWhatsApp() {
            const url = encodeURIComponent(window.location.href);
            const text = encodeURIComponent("¡Hola! Te comparto esta experiencia increíble: ");
            window.open(`https://wa.me/?text=${text}${url}`, '_blank');
        }

        function shareOnInstagram() {
            // Instagram no permite compartir URLs directamente, así que copiamos al clipboard
            const text = "¡Acabo de tener una experiencia increíble! 🚀 " + window.location.href;
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => {
                    // Crear notificación temporal
                    const notification = document.createElement('div');
                    notification.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: linear-gradient(135deg, #E4405F, #833AB4);
                        color: white;
                        padding: 16px 24px;
                        border-radius: 12px;
                        font-weight: 600;
                        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                        z-index: 1000;
                        animation: slideInRight 0.3s ease-out;
                    `;
                    notification.textContent = '📋 ¡Copiado! Pégalo en tu Story de Instagram';
                    document.body.appendChild(notification);
                    
                    setTimeout(() => {
                        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
                        setTimeout(() => notification.remove(), 300);
                    }, 3000);
                });
            }
            
            // Intentar abrir Instagram (funciona mejor en móviles)
            setTimeout(() => {
                window.open('https://www.instagram.com/', '_blank');
            }, 500);
        }

        // Efecto de ripple al hacer click
        document.querySelectorAll('.social-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255,255,255,0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                `;
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // CSS para la animación del ripple
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);