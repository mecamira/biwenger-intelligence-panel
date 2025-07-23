/**
 * Utilidades comunes para Biwenger Intelligence Panel
 */

class BiwengerUtils {
    /**
     * Formatea un precio en euros a millones
     * @param {number} price - Precio en euros
     * @returns {string} Precio formateado
     */
    static formatPrice(price) {
        if (!price || price === 0) return '€0M';
        const millions = price / 1000000;
        return `€${millions.toFixed(1)}M`;
    }

    /**
     * Obtiene el nombre de la posición
     * @param {number} position - Código de posición
     * @returns {string} Nombre de la posición
     */
    static getPositionName(position) {
        const positions = {
            1: 'Portero',
            2: 'Defensa',
            3: 'Centrocampista',
            4: 'Delantero'
        };
        return positions[position] || 'Desconocido';
    }

    /**
     * Obtiene el código corto de la posición
     * @param {number} position - Código de posición
     * @returns {string} Código corto
     */
    static getPositionShort(position) {
        const positions = {
            1: 'POR',
            2: 'DEF',
            3: 'MED',
            4: 'DEL'
        };
        return positions[position] || 'N/A';
    }

    /**
     * Obtiene el color para el estado del jugador
     * @param {string} status - Estado del jugador
     * @returns {string} Color hexadecimal
     */
    static getStatusColor(status) {
        const colors = {
            'ok': '#4CAF50',
            'injured': '#f44336',
            'suspended': '#ff9800',
            'doubt': '#ff9800',
            'yellowcard': '#FFC107',
            'redcard': '#f44336'
        };
        return colors[status] || '#4CAF50';
    }

    /**
     * Formatea una fecha
     * @param {string|Date} date - Fecha a formatear
     * @returns {string} Fecha formateada
     */
    static formatDate(date) {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    /**
     * Calcula días desde una fecha
     * @param {string|Date} date - Fecha de referencia
     * @returns {number} Días transcurridos
     */
    static daysSince(date) {
        if (!date) return 0;
        const now = new Date();
        const then = new Date(date);
        const diffTime = Math.abs(now - then);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Genera un color aleatorio en hexadecimal
     * @returns {string} Color hexadecimal
     */
    static randomColor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    }

    /**
     * Valida un email
     * @param {string} email - Email a validar
     * @returns {boolean} Es válido
     */
    static isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Capitaliza la primera letra de una cadena
     * @param {string} str - Cadena a capitalizar
     * @returns {string} Cadena capitalizada
     */
    static capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * Trunca un texto a una longitud específica
     * @param {string} text - Texto a truncar
     * @param {number} length - Longitud máxima
     * @returns {string} Texto truncado
     */
    static truncate(text, length = 50) {
        if (!text) return '';
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    /**
     * Debounce para funciones
     * @param {Function} func - Función a ejecutar
     * @param {number} wait - Tiempo de espera en ms
     * @returns {Function} Función con debounce
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Genera un ID único
     * @returns {string} ID único
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Almacenamiento local seguro
     * @param {string} key - Clave
     * @param {any} value - Valor a almacenar
     */
    static setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('No se pudo guardar en localStorage:', error);
        }
    }

    /**
     * Recuperación de almacenamiento local
     * @param {string} key - Clave
     * @param {any} defaultValue - Valor por defecto
     * @returns {any} Valor almacenado o valor por defecto
     */
    static getStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('No se pudo leer de localStorage:', error);
            return defaultValue;
        }
    }

    /**
     * Elimina elemento del almacenamiento local
     * @param {string} key - Clave a eliminar
     */
    static removeStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('No se pudo eliminar de localStorage:', error);
        }
    }

    /**
     * Muestra una notificación toast
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación (success, error, warning, info)
     * @param {number} duration - Duración en ms
     */
    static showToast(message, type = 'info', duration = 3000) {
        // Crear elemento toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;

        // Colores según tipo
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
        toast.style.backgroundColor = colors[type] || colors.info;

        toast.textContent = message;

        // Añadir al DOM
        document.body.appendChild(toast);

        // Eliminar después del tiempo especificado
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, duration);

        // Permitir cerrar al hacer clic
        toast.addEventListener('click', () => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        });
    }

    /**
     * Copia texto al portapapeles
     * @param {string} text - Texto a copiar
     * @returns {Promise<boolean>} Éxito de la operación
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copiado al portapapeles', 'success');
            return true;
        } catch (error) {
            console.error('Error copiando al portapapeles:', error);
            this.showToast('Error copiando al portapapeles', 'error');
            return false;
        }
    }

    /**
     * Descarga datos como archivo JSON
     * @param {any} data - Datos a descargar
     * @param {string} filename - Nombre del archivo
     */
    static downloadJSON(data, filename = 'biwenger_data.json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Formatea números grandes con sufijos
     * @param {number} num - Número a formatear
     * @returns {string} Número formateado
     */
    static formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    /**
     * Calcula el porcentaje de cambio
     * @param {number} oldValue - Valor anterior
     * @param {number} newValue - Valor nuevo
     * @returns {number} Porcentaje de cambio
     */
    static percentageChange(oldValue, newValue) {
        if (oldValue === 0) return newValue > 0 ? 100 : 0;
        return ((newValue - oldValue) / oldValue) * 100;
    }

    /**
     * Obtiene la diferencia de tiempo en formato legible
     * @param {Date} date - Fecha a comparar
     * @returns {string} Diferencia formateada
     */
    static timeAgo(date) {
        if (!date) return 'Nunca';
        
        const now = new Date();
        const diffTime = now - new Date(date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffTime / (1000 * 60));

        if (diffDays > 0) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
        if (diffHours > 0) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        if (diffMinutes > 0) return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
        return 'Hace un momento';
    }

    /**
     * Valida y sanitiza entrada de usuario
     * @param {string} input - Entrada del usuario
     * @returns {string} Entrada sanitizada
     */
    static sanitizeInput(input) {
        if (!input) return '';
        return input.toString()
            .replace(/[<>]/g, '') // Eliminar < >
            .trim()
            .substring(0, 255); // Límite de longitud
    }

    /**
     * Detecta si es un dispositivo móvil
     * @returns {boolean} Es móvil
     */
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Obtiene información del navegador
     * @returns {Object} Información del navegador
     */
    static getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        
        if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Edge')) browser = 'Edge';

        return {
            browser,
            userAgent: ua,
            isMobile: this.isMobile(),
            language: navigator.language,
            platform: navigator.platform
        };
    }
}

// Añadir estilos para toasts
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .toast {
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        
        .toast:hover {
            transform: scale(1.02);
        }
    `;
    document.head.appendChild(style);
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.BiwengerUtils = BiwengerUtils;
}

// Para uso en Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BiwengerUtils;
}