/**
 * Virtual Keypad for Touchscreen Apps
 * Provides an on-screen keyboard for Orange Pi touchscreen (no auto-keyboard)
 * Supports: numbers 0-9, decimal point, negative sign, backspace
 */

class VirtualKeypad {
    constructor(options = {}) {
        this.targetInput = null;
        this.onInput = options.onInput || (() => {});
        this.onClose = options.onClose || (() => {});
        this.allowDecimal = options.allowDecimal !== false;
        this.allowNegative = options.allowNegative !== false;
        this.maxValue = options.maxValue || null;
        this.minValue = options.minValue || null;
        this.keypadElement = null;
        this.isOpen = false;
    }

    createKeypadHTML() {
        const decimalBtn = this.allowDecimal ? 
            `<button class="vk-btn vk-decimal" data-key=".">.</button>` : 
            `<button class="vk-btn vk-disabled" disabled></button>`;
        
        const negativeBtn = this.allowNegative ? 
            `<button class="vk-btn vk-negative" data-key="-">+/-</button>` : 
            `<button class="vk-btn vk-disabled" disabled></button>`;

        return `
            <div class="virtual-keypad" id="virtualKeypad">
                <div class="vk-header">
                    <span class="vk-title">⌨️ Keypad</span>
                    <button class="vk-close" onclick="window.virtualKeypad.close()">✕</button>
                </div>
                <div class="vk-display" id="vkDisplay">0</div>
                <div class="vk-grid">
                    <button class="vk-btn vk-num" data-key="7">7</button>
                    <button class="vk-btn vk-num" data-key="8">8</button>
                    <button class="vk-btn vk-num" data-key="9">9</button>
                    <button class="vk-btn vk-backspace" data-key="backspace">⌫</button>
                    
                    <button class="vk-btn vk-num" data-key="4">4</button>
                    <button class="vk-btn vk-num" data-key="5">5</button>
                    <button class="vk-btn vk-num" data-key="6">6</button>
                    <button class="vk-btn vk-clear" data-key="clear">C</button>
                    
                    <button class="vk-btn vk-num" data-key="1">1</button>
                    <button class="vk-btn vk-num" data-key="2">2</button>
                    <button class="vk-btn vk-num" data-key="3">3</button>
                    <button class="vk-btn vk-enter" data-key="enter" rowspan="2">↵</button>
                    
                    ${negativeBtn}
                    <button class="vk-btn vk-num" data-key="0">0</button>
                    ${decimalBtn}
                </div>
            </div>
        `;
    }

    injectStyles() {
        if (document.getElementById('virtual-keypad-styles')) return;
        
        const styles = `
            <style id="virtual-keypad-styles">
                .virtual-keypad {
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
                    font-size: 28px;
                    font-weight: bold;
                    color: #fff;
                    text-align: right;
                    margin-bottom: 12px;
                    font-variant-numeric: tabular-nums;
                    min-height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                }
                
                .vk-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                }
                
                .vk-btn {
                    padding: 15px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 12px;
                    background: linear-gradient(135deg, rgba(144, 192, 64, 0.4), rgba(107, 156, 46, 0.4));
                    color: #fff;
                    font-size: 20px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    -webkit-tap-highlight-color: transparent;
                }
                
                .vk-btn:hover {
                    background: linear-gradient(135deg, #90c040, #6b9c2e);
                    transform: scale(1.05);
                }
                
                .vk-btn:active {
                    transform: scale(0.95);
                }
                
                .vk-btn.vk-num {
                    background: linear-gradient(135deg, rgba(144, 192, 64, 0.5), rgba(107, 156, 46, 0.5));
                }
                
                .vk-btn.vk-backspace {
                    background: linear-gradient(135deg, rgba(255, 107, 53, 0.6), rgba(231, 76, 60, 0.6));
                    border-color: #ff6b35;
                }
                
                .vk-btn.vk-clear {
                    background: linear-gradient(135deg, rgba(231, 76, 60, 0.7), rgba(192, 57, 43, 0.7));
                    border-color: #e74c3c;
                }
                
                .vk-btn.vk-enter {
                    background: linear-gradient(135deg, #90c040, #6b9c2e);
                    border-color: #c4d600;
                    grid-row: span 2;
                }
                
                .vk-btn.vk-negative {
                    background: linear-gradient(135deg, rgba(139, 69, 19, 0.6), rgba(160, 82, 45, 0.6));
                    border-color: #8b4513;
                    font-size: 14px;
                }
                
                .vk-btn.vk-decimal {
                    background: linear-gradient(135deg, rgba(144, 192, 64, 0.5), rgba(107, 156, 46, 0.5));
                }
                
                .vk-btn.vk-disabled {
                    background: rgba(0,0,0,0.2);
                    border-color: rgba(255,255,255,0.1);
                    cursor: not-allowed;
                }
                
                /* Animation for keypad appearance */
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                .virtual-keypad {
                    animation: slideUp 0.3s ease-out;
                }
                
                /* Input focus state - visual indicator */
                .vk-input-active {
                    border-color: #90c040 !important;
                    box-shadow: 0 0 10px rgba(144, 192, 64, 0.5) !important;
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    open(inputElement, initialValue = '') {
        this.close(); // Close any existing keypad
        
        this.targetInput = inputElement;
        this.currentValue = initialValue || inputElement.value || '0';
        
        // Inject styles if not already present
        this.injectStyles();
        
        // Create and insert keypad
        document.body.insertAdjacentHTML('beforeend', this.createKeypadHTML());
        this.keypadElement = document.getElementById('virtualKeypad');
        
        // Update display
        this.updateDisplay();
        
        // Highlight the input
        if (this.targetInput) {
            this.targetInput.classList.add('vk-input-active');
            this.targetInput.blur(); // Prevent native keyboard
        }
        
        // Bind button events
        this.bindEvents();
        
        // Store reference globally for close button
        window.virtualKeypad = this;
        
        this.isOpen = true;
        
        // Callback
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
            
            // Touch events for better mobile response
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
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.appendDigit(key);
                break;
            case '.':
                this.appendDecimal();
                break;
            case '-':
                this.toggleNegative();
                break;
            case 'backspace':
                this.backspace();
                break;
            case 'clear':
                this.clear();
                break;
            case 'enter':
                this.confirm();
                break;
        }
        
        this.updateDisplay();
        this.onInput(this.currentValue);
    }

    appendDigit(digit) {
        if (this.currentValue === '0') {
            this.currentValue = digit;
        } else {
            this.currentValue += digit;
        }
        this.validateValue();
    }

    appendDecimal() {
        if (!this.currentValue.includes('.')) {
            this.currentValue += '.';
        }
    }

    toggleNegative() {
        if (this.currentValue.startsWith('-')) {
            this.currentValue = this.currentValue.substring(1);
        } else {
            this.currentValue = '-' + this.currentValue;
        }
        this.validateValue();
    }

    backspace() {
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
        this.validateValue();
    }

    clear() {
        this.currentValue = '0';
    }

    validateValue() {
        // Remove invalid patterns
        this.currentValue = this.currentValue.replace(/\.(?=.*\.)/g, ''); // Only one decimal
        this.currentValue = this.currentValue.replace(/--/g, '-'); // No double negatives
        
        // Check min/max
        const numVal = parseFloat(this.currentValue);
        if (!isNaN(numVal)) {
            if (this.maxValue !== null && numVal > this.maxValue) {
                this.currentValue = this.maxValue.toString();
            }
            if (this.minValue !== null && numVal < this.minValue) {
                this.currentValue = this.minValue.toString();
            }
        }
    }

    updateDisplay() {
        const display = document.getElementById('vkDisplay');
        if (display) {
            display.textContent = this.currentValue;
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

// Static method to easily attach keypad to inputs
VirtualKeypad.attachTo = function(selector, options = {}) {
    const inputs = document.querySelectorAll(selector);
    const keypads = [];
    
    inputs.forEach(input => {
        // Prevent native keyboard
        input.setAttribute('readonly', 'readonly');
        input.style.cursor = 'pointer';
        
        // Add click handler
        const openKeypad = () => {
            const keypad = new VirtualKeypad(options);
            keypad.open(input, input.value);
            keypads.push(keypad);
        };
        
        input.addEventListener('click', openKeypad);
        input.addEventListener('focus', (e) => {
            e.preventDefault();
            input.blur();
            openKeypad();
        });
    });
    
    return keypads;
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VirtualKeypad;
}
