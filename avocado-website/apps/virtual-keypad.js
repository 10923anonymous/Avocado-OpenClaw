/**
 * Virtual Keypad for Touchscreen Apps
 * Provides an on-screen keyboard for Orange Pi touchscreen (no auto-keyboard)
 * Supports: numbers 0-9, decimal point, negative sign, backspace
 * Supports: alphabetic keyboard (A-Z) for text inputs
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
        this.maxLength = options.maxLength || null;
        this.keypadElement = null;
        this.isOpen = false;
        this.mode = options.mode || 'numeric'; // 'numeric' or 'alphabetic'
        this.shiftMode = false; // For alphabetic uppercase/lowercase
    }

    createKeypadHTML() {
        if (this.mode === 'alphabetic') {
            return this.createAlphabeticKeypad();
        }
        return this.createNumericKeypad();
    }

    createNumericKeypad() {
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

    createAlphabeticKeypad() {
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
            <div class="virtual-keypad vk-alphabetic" id="virtualKeypad">
                <div class="vk-header">
                    <span class="vk-title">⌨️ Keyboard</span>
                    <button class="vk-close" onclick="window.virtualKeypad.close()">✕</button>
                </div>
                <div class="vk-display" id="vkDisplay"></div>
                <div class="vk-alpha-grid">
                    <div class="vk-alpha-row">${row1}</div>
                    <div class="vk-alpha-row vk-row-indent">${row2}</div>
                    <div class="vk-alpha-row vk-row-indent2">${row3}</div>
                    <div class="vk-alpha-row vk-bottom-row">
                        <button class="vk-btn vk-shift ${shiftClass}" data-key="shift">⇧</button>
                        <button class="vk-btn vk-space" data-key="space">Space</button>
                        <button class="vk-btn vk-backspace" data-key="backspace">⌫</button>
                        <button class="vk-btn vk-enter" data-key="enter">↵</button>
                    </div>
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
                
                /* Numeric Keypad Grid */
                .vk-grid {
                    display: grid;
                    grid-template