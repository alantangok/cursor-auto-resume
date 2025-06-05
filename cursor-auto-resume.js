// Ultra-simple Cursor Auto Resume Script - Copy & paste into browser console
(function() {
    'use strict';
    
    console.log('Cursor Auto Resume: Running');
    
    // ===========================================
    // Configuration Constants
    // ===========================================
    const CONFIG = {
        CLICK_COOLDOWN: 3000,                    // 3 seconds between clicks
        RETRY_WINDOW: 10000,                     // 10 seconds window for consecutive retries
        SIMULATE_COOLDOWN: 5000,                 // 5 seconds cooldown for simulate input
        MAX_CONSECUTIVE_RETRIES: 3,              // Max retry clicks before trying simulate
        MAX_SIMULATE_ATTEMPTS: 3,                // Max simulate attempts before alert
        MAX_DURATION: 24 * 60 * 60 * 1000,     // 24 hours runtime
        INPUT_DELAY: 100,                        // Delay before pressing Enter
        SIMULATE_DELAY: 1000                     // Delay before simulate input
    };
    
    // ===========================================
    // State Management
    // ===========================================
    const state = {
        startTime: Date.now(),
        lastClickTime: 0,
        consecutiveRetryClicks: 0,
        lastRetryClickTime: 0,
        simulateInputAttempts: 0,
        lastSimulateInputTime: 0,
        intervalId: null
    };
    
    // ===========================================
    // Core Functions
    // ===========================================
    
    /**
     * Simulate user input in the AI editor
     */
    function simulateUserInput() {
        try {
            const inputDiv = document.querySelector('div.aislash-editor-input');
            if (!inputDiv) {
                console.log('Cursor Auto Resume: Input div not found');
                return false;
            }
            
            // Click and focus the input
            inputDiv.dispatchEvent(new MouseEvent('click', {
                view: window, bubbles: true, cancelable: true
            }));
            inputDiv.focus();
            console.log('Cursor Auto Resume: Clicked input div');
            
            // Set content using multiple approaches
            const text = 'continue';
            inputDiv.textContent = text;
            inputDiv.innerText = text;
            if (inputDiv.contentEditable === 'true') {
                inputDiv.innerHTML = text;
            }
            
            // Dispatch input event
            inputDiv.dispatchEvent(new InputEvent('input', {
                bubbles: true,
                cancelable: true,
                inputType: 'insertText',
                data: text
            }));
            
            // Simulate character-by-character typing
            text.split('').forEach(char => {
                ['keydown', 'keyup'].forEach(eventType => {
                    inputDiv.dispatchEvent(new KeyboardEvent(eventType, {
                        key: char,
                        code: `Key${char.toUpperCase()}`,
                        bubbles: true,
                        cancelable: true
                    }));
                });
            });
            
            console.log('Cursor Auto Resume: Typed "continue"');
            
            // Simulate Enter key after delay
            setTimeout(() => {
                const enterEvent = {
                    key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
                    bubbles: true, cancelable: true
                };
                
                ['keydown', 'keyup'].forEach(eventType => {
                    const event = new KeyboardEvent(eventType, enterEvent);
                    inputDiv.dispatchEvent(event);
                    document.dispatchEvent(event);
                });
                
                console.log('Cursor Auto Resume: Pressed Enter');
            }, CONFIG.INPUT_DELAY);
            
            return true;
        } catch (error) {
            console.error('Cursor Auto Resume: Error in simulateUserInput:', error);
            return false;
        }
    }
    
    /**
     * Handle retry logic when consecutive retries exceed limit
     */
    function handleExcessiveRetries() {
        const now = Date.now();
        
        // Track simulate input attempts
        if (state.lastSimulateInputTime > 0 && 
            (now - state.lastSimulateInputTime) < CONFIG.SIMULATE_COOLDOWN) {
            state.simulateInputAttempts++;
        } else {
            state.simulateInputAttempts = 1;
        }
        
        if (state.simulateInputAttempts > CONFIG.MAX_SIMULATE_ATTEMPTS) {
            // Show alert after max attempts
            alert(`Cursor Auto Resume Alert: 已連續點擊 ${CONFIG.MAX_CONSECUTIVE_RETRIES} 次 "Try again/Resume"。可能遇到持續性問題，將嘗試自動輸入 continue 指令。`);
            state.simulateInputAttempts = 0;
            state.lastSimulateInputTime = 0;
        } else {
            // Attempt to simulate user input
            console.log(`Cursor Auto Resume: Attempting to simulate input (attempt ${state.simulateInputAttempts}/${CONFIG.MAX_SIMULATE_ATTEMPTS})`);
            setTimeout(() => {
                if (simulateUserInput()) {
                    console.log('Cursor Auto Resume: Successfully simulated "continue" input');
                } else {
                    console.log('Cursor Auto Resume: Failed to simulate input, please check manually');
                }
            }, CONFIG.SIMULATE_DELAY);
            state.lastSimulateInputTime = now;
        }
        
        // Reset retry counters
        state.consecutiveRetryClicks = 0;
        state.lastRetryClickTime = 0;
    }
    
    /**
     * Handle Try Again/Resume button clicks
     */
    function handleRetryClick(link) {
        const now = Date.now();
        
        // Track consecutive retry clicks
        if (state.lastRetryClickTime > 0 && 
            (now - state.lastRetryClickTime) < CONFIG.RETRY_WINDOW) {
            state.consecutiveRetryClicks++;
        } else {
            state.consecutiveRetryClicks = 1;
        }
        
        // Check if we've exceeded retry limit
        if (state.consecutiveRetryClicks > CONFIG.MAX_CONSECUTIVE_RETRIES) {
            handleExcessiveRetries();
            return;
        }
        
        // Click the retry button
        console.log(`Clicking "Try again/Resume" link (attempt ${state.consecutiveRetryClicks}/${CONFIG.MAX_CONSECUTIVE_RETRIES})`);
        link.click();
        state.lastClickTime = now;
        state.lastRetryClickTime = now;
    }
    
    /**
     * Reset all state counters
     */
    function resetState() {
        state.startTime = Date.now();
        state.consecutiveRetryClicks = 0;
        state.lastRetryClickTime = 0;
        state.simulateInputAttempts = 0;
        state.lastSimulateInputTime = 0;
        console.log('Cursor Auto Resume: Timer and counters reset');
    }
    
    /**
     * Find and handle resume conversation links
     */
    function handleResumeConversation() {
        const elements = document.querySelectorAll('body *');
        
        for (const el of elements) {
            if (!el?.textContent) continue;
            
            // Check for rate limit text
            if (el.textContent.includes('stop the agent after 25 tool calls') || 
                el.textContent.includes('Note: we default stop')) {
                
                const links = el.querySelectorAll('a, span.markdown-link, [role="link"], [data-link]');
                for (const link of links) {
                    if (link.textContent.trim() === 'resume the conversation') {
                        console.log('Clicking "resume the conversation" link');
                        link.click();
                        state.lastClickTime = Date.now();
                        resetState();
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    /**
     * Find and handle error retry buttons
     */
    function handleErrorRetries() {
        const elements = document.querySelectorAll('body *');
        const errorTexts = ['Connection failed', 'hit a rate limit'];
        
        for (const el of elements) {
            if (!el?.textContent) continue;
            
            // Check if element contains any error text
            const hasError = errorTexts.some(errorText => 
                el.textContent.includes(errorText)
            );
            
            if (hasError) {
                const retryButtons = el.querySelectorAll('span');
                for (const button of retryButtons) {
                    const buttonText = button.textContent.trim();
                    if (buttonText === 'Try again' || buttonText === 'Resume') {
                        handleRetryClick(button);
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    // ===========================================
    // Main Loop
    // ===========================================
    
    /**
     * Main function that checks for resume links and handles clicks
     */
    function mainLoop() {
        const now = Date.now();
        
        // Check if max duration exceeded
        if (now - state.startTime > CONFIG.MAX_DURATION) {
            console.log('Cursor Auto Resume: 24 hours elapsed, stopping auto-click');
            clearInterval(state.intervalId);
            return;
        }
        
        // Prevent clicking too frequently
        if (now - state.lastClickTime < CONFIG.CLICK_COOLDOWN) {
            return;
        }
        
        // Try to handle different scenarios in order of priority
        if (handleResumeConversation()) return;
        if (handleErrorRetries()) return;
    }
    
    // ===========================================
    // Initialization
    // ===========================================
    
    // Make reset function available globally
    window.click_reset = resetState;
    
    // Start the main loop
    state.intervalId = setInterval(mainLoop, 1000);
    mainLoop(); // Run once immediately
    
    console.log('Cursor Auto Resume: Will stop after 24 hours. Call click_reset() to reset timer.');
    
})(); 