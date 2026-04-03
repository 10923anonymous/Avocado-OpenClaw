/**
 * Virtual Keyboard for Touchscreen Apps - ALPHABETIC MODE
 * Provides an on-screen QWERTY keyboard for text inputs
 * For Orange Pi touchscreen (no auto-keyboard)
 * Supports: A-Z letters, space, backspace, shift for uppercase
 */

class VirtualKeyboard {
    constructor(options = {}) {
        this.targetInput = null;
        this.onInput = options.onInput || (() => {});
        this.onClose = options.onClose || (() => {});
        this.maxLength = options.maxLength || null;
        this.keypadElement = null;
        this.isOpen = false;
        this.shiftMode = false;
        this.currentValue = '';
    }

    createKeyboardHTML() {
        const rows = this.shiftMode ? [
            ['Q','W','E','R','T','Y','U','I','O','P'],
            ['A','S','D','F','G','H','J','K','L'],
            ['Z','X','C','V','B','N','M'],
        ] : [
            ['q','w','e','r','t','y','u','i','o','p'],
            ['a','s','d','f','g','h','j','k','l'],
            ['z','x','c','v','b','n','m'],
        ];

        const row1 = rows[0].map(char => `<button class="vk-btn vk-alpha" data-key="${char}">${char}</button>`).join('');
        const row2 = rows[1].map(char => `<button class="vk-btn vk-alpha" data-key="${char}">${char}</button>`).join('');
        const row3 = rows[2].map(char => `<button class="vk-btn vk-alpha" data-key="${char}">${char}</button>`).join('');

        const shiftClass = this.shiftMode ? 'active' : '';

        return `
            <div class="virtual-keyboard" id="virtualKeyboard">
                <div class="vk-header">
                    <span class="vk-title">⌨️ Keyboard</span>
                    <button class="vk-close" onclick="window.virtualKeyboard.close()">✕</button>
                </div>
                <div class="vk-display" id="vkDisplay"></div>
                <div class="vk-alpha-grid">
                    <div class="vk-alpha-row">${row1}</div>
                    <div class="vk-alpha-row vk-row-indent">${row2}</div>
                    <div class="vk-alpha-row vk-row-indent2">${row3}</div>
                    <div class="vk-alpha-row vk-bottom-row">
                        <button class="vk-btn vk-shift ${shiftClass}" data-key="shift">⇧</button>
                        <button class="vk-btn vk-punct" data-key=",">,</button>
                        <button class="vk-btn vk-space" data-key="space">Space</button>
                        <button class="vk-btn vk-punct" data-key=".">.</button>
                        <button class="vk-btn vk-backspace" data-key="backspace">⌫</button>
                        <button class="vk-btn vk-enter" data-key="enter">↵</button>
                    </div>
                </div>
            </div>
        `;
    }

    injectStyles() {
        if (document.getElementById('virtual-keyboard-styles')) return;
        
        const styles = `
            <style id="virtual-keyboard-styles">
                .virtual-keyboard {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(180deg, #2d5016 0%, #1a3d1a 100%);
                    border-top: 3px solid #90c040;
                    border-radius: 20px 20px 0 0;
                    padding: 15px;
                    z-index: 99999;
                    box-shadow: 0 -10px 30px rgba(0,0,0,0.5);
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                }
                
                .vk-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid rgba(144, 192, 64, 0.3);
                }
                
                .vk-title {
                    font-size: 16px;
                    font-weight: bold;
                    color: #90c040;
                }
                
                .vk-close {
                    background: linear-gradient(135deg, #e74c3c, #c0392b);
                    border: none;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    color: #fff;
                    font-size: 14px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .vk-display {
                    background: rgba(0,0,0,0.5);
                    border: 2px solid #90c040;
                    border-radius: 10px;
                    padding: 12px;
                    font-size: 24px;
                    font-weight: bold;
                    color: #fff;
                    text-align: left;
                    margin-bottom: 12px;
                    min-height: 50px;
                    display: flex;
                    align-items: center;
                    overflow-x: auto;
                    white-space: nowrap;
                }
                
                .vk-alpha-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .vk-alpha-row {
                    display: flex;
                    justify-content: center;
                    gap: 6px;
                }
                
                .vk-row-indent {
                    padding-left: 25px;
                }
                
                .vk-row-indent2 {
                    padding-left: 50px;
                }
                
                .vk-bottom-row {
                    margin-top: 5px;
                    padding-top: 10px;
                    border-top: 1px solid rgba(144, 192, 64, 0.3);
                }
                
                .vk-btn {
                    padding: 12px 14px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 10px;
                    background: linear-gradient(135deg, rgba(144, 192, 64, 0.4), rgba(107, 156, 46, 0.4));
                    color: #fff;
                    font-size: 18px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    -webkit-tap-highlight-color: transparent;
                    min-width: 42px;
                }
                
                .vk-btn:hover {
                    background: linear-gradient(135deg, #90c040, #6b9c2e);
                    transform: scale(1.05);
                }
                
                .vk-btn:active {
                    transform: scale(0.95);
                }
                
                .vk-btn.vk-alpha {
                    background: linear-gradient(135deg, rgba(144, 192, 64, 0.5), rgba(107, 156, 46, 0.5));
                }
                
                .vk-btn.vk-shift {
                    background: linear-gradient(135deg, rgba(139, 69, 19, 0.6), rgba(160, 82, 45, 0.6));
                    border-color: #8b4513;
                    font-size: 20px;
                    padding: 12px 16px;
                }
                
                .vk-btn.vk-shift.active {
                    background: linear-gradient(135deg, #ff6b35, #e74c3c);
                    border-color: #ff6b35;
                }
                
                .vk-btn.vk-space {
                    background: linear-gradient(135deg, rgba(100, 100, 100, 0.5), rgba(80, 80, 80, 0.5));
                    border-color: rgba(255,255,255,0.4);
                    font-size: 14px;
                    min-width: 120px;
                }
                
                .vk-btn.vk-backspace {
                    background: linear-gradient(135deg, rgba(255, 107, 53, 0.6), rgba(231, 76, 60, 0.6));
                    border-color: #ff6b35;
                    font-size: 18px;
                }
                
                .vk-btn.vk-enter {
                    background: linear-gradient(135deg, #90c040, #6b9c2e);
                    border-color: #c4d600;
                    font-size: 18px;
                    padding: 12px 20px;
                }
                
                .vk-btn.vk-punct {
                    background: linear-gradient(135deg, rgba(100, 100, 100, 0.5), rgba(80, 80, 80, 0.5));
                    border-color: rgba(255,255,255,0.4);
                    font-size: 20px;
                    min-width: 42px;
                }
                
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                .virtual-keyboard {
                    animation: slideUp 0.3s ease-out;
                }
                
                .vk-input-active {
                    border-color: #90c040 !important;
                    box-shadow: 0 0 10px rgba(144, 192, 64, 0.5) !important;
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    open(inputElement, initialValue = '') {
        this.close();
        
        this.targetInput = inputElement;
        this.currentValue = initialValue || inputElement.value || '';
        
        this.injectStyles();
        
        document.body.insertAdjacentHTML('beforeend', this.createKeyboardHTML());
        this.keypadElement = document.getElementById('virtualKeyboard');
        
        this.updateDisplay();
        
        if (this.targetInput) {
            this.targetInput.classList.add('vk-input-active');
            this.targetInput.blur();
        }
        
        this.bindEvents();
        
        window.virtualKeyboard = this;
        
        this.isOpen = true;
        
        this.onInput(this.currentValue);
    }

    bindEvents() {
        if (!this.keypadElement) return;
        
        const buttons = this.keypadElement.querySelectorAll('.vk-btn[data-key]');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const key = btn.getAttribute('data-key');
                this.handleKey(key);
            });
            
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                btn.style.transform = 'scale(0.95)';
            });
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                btn.style.transform = '';
                const key = btn.getAttribute('data-key');
                this.handleKey(key);
            });
        });
    }

    handleKey(key) {
        switch(key) {
            case 'shift':
                this.toggleShift();
                return;
            case 'space':
                this.appendChar(' ');
                break;
            case 'backspace':
                this.backspace();
                break;
            case 'enter':
                this.confirm();
                return;
            default:
                this.appendChar(key);
                break;
        }
        
        this.updateDisplay();
        this.onInput(this.currentValue);
    }

    toggleShift() {
        this.shiftMode = !this.shiftMode;
        // Re-render the keyboard with new shift state
        if (this.keypadElement) {
            this.keypadElement.outerHTML = this.createKeyboardHTML();
            this.keypadElement = document.getElementById('virtualKeyboard');
            this.bindEvents();
            this.updateDisplay();
        }
    }

    appendChar(char) {
        if (this.maxLength && this.currentValue.length >= this.maxLength) {
            return;
        }
        this.currentValue += char;
        // Auto-disable shift after typing one letter (like mobile keyboards)
        if (this.shiftMode && char.match(/[a-zA-Z]/)) {
            this.shiftMode = false;
            if (this.keypadElement) {
                this.keypadElement.outerHTML = this.createKeyboardHTML();
                this.keypadElement = document.getElementById('virtualKeyboard');
                this.bindEvents();
            }
        }
    }

    backspace() {
        this.currentValue = this.currentValue.slice(0, -1);
    }

    updateDisplay() {
        const display = document.getElementById('vkDisplay');
        if (display) {
            display.textContent = this.currentValue || ' ';
        }
    }

    confirm() {
        if (this.targetInput) {
            this.targetInput.value = this.currentValue;
            this.targetInput.dispatchEvent(new Event('input', { bubbles: true }));
            this.targetInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        this.close();
    }

    close() {
        if (this.keypadElement) {
            this.keypadElement.remove();
            this.keypadElement = null;
        }
        
        if (this.targetInput) {
            this.targetInput.classList.remove('vk-input-active');
        }
        
        this.isOpen = false;
        this.onClose();
    }

    getValue() {
        return this.currentValue;
    }
}

// Static method to easily attach keyboard to inputs
VirtualKeyboard.attachTo = function(selector, options = {}) {
    const inputs = document.querySelectorAll(selector);
    const keyboards = [];
    
    inputs.forEach(input => {
        // Prevent native keyboard
        input.setAttribute('readonly', 'readonly');
        input.style.cursor = 'pointer';
        
        // Add click handler
        const openKeyboard = () => {
            const keyboard = new VirtualKeyboard(options);
            keyboard.open(input, input.value);
            keyboards.push(keyboard);
        };
        
        input.addEventListener('click', openKeyboard);
        input.addEventListener('focus', (e) => {
            e.preventDefault();
            input.blur();
            openKeyboard();
        });
    });
    
    return keyboards;
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = VirtualKeyboard;
}
