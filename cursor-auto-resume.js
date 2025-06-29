// Ultra-simple Cursor Auto Resume Script - Copy & paste into browser console
(function() {
    'use strict';
    
    console.log('Cursor Auto Resume: Running with Never Stop Checker');
    
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
        SIMULATE_DELAY: 1000,                    // Delay before simulate input
        NEVER_STOP_CHECK_INTERVAL: 2000,        // Check send button state every 2 seconds
        NEVER_STOP_COOLDOWN: 3000,              // Cooldown between never stop actions
        ENHANCED_COMMAND_COOLDOWN: 60000        // 1 minute cooldown for enhanced commands
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
        intervalId: null,
        neverStopIntervalId: null,
        lastNeverStopAction: 0,
        previousSendButtonState: null,
        neverStopEnabled: true,
        neverStopActivated: false,
        lastEnhancedCommandTime: 0,
        endCount: 0,
        lastEndCountCheckTime: 0,
        lastEndCountIncrease: 0
    };
    
    // ===========================================
    // Core Functions
    // ===========================================
    
    /**
     * Check if the input text is an enhanced command that needs extra cooldown
     */
    function isEnhancedCommand(inputText) {
        const text = inputText.toLowerCase();
        return text.includes('mcp interactive_feedback') || 
               text.includes('/split and /limit');
    }

    /**
     * Simulate user input in the AI editor
     */
    function simulateUserInput(inputText = 'continue with call MCP interactive_feedback') {
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
            const text = inputText;
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
            
            console.log(`Cursor Auto Resume: Typed "${text}"`);
            
            // Record enhanced command execution time
            if (isEnhancedCommand(inputText)) {
                state.lastEnhancedCommandTime = Date.now();
                console.log('Cursor Auto Resume: Enhanced command executed, 1-minute cooldown activated');
            }
            
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
        state.lastNeverStopAction = 0;
        state.previousSendButtonState = null;
        state.neverStopActivated = false;
        state.lastEnhancedCommandTime = 0;
        state.endCount = 0;
        state.lastEndCountCheckTime = 0;
        state.lastEndCountIncrease = 0;
        console.log('Cursor Auto Resume: Timer and counters reset');
    }
    
    /**
     * Find and handle resume conversation links
     */
    function handleResumeConversation() {
        // First check for infinite no content loop
        // Only check if user has started generation and never stop is activated
        if (state.neverStopEnabled && state.neverStopActivated && isInfiniteNoContentLoop()) {
            const now = Date.now();
            
            // Check enhanced command cooldown first
            if (now - state.lastEnhancedCommandTime < CONFIG.ENHANCED_COMMAND_COOLDOWN) {
                const remainingTime = Math.ceil((CONFIG.ENHANCED_COMMAND_COOLDOWN - (now - state.lastEnhancedCommandTime)) / 1000);
                console.log(`Cursor Auto Resume: Enhanced command cooldown active, ${remainingTime} seconds remaining`);
                return false;
            }
            
            if (now - state.lastNeverStopAction >= CONFIG.NEVER_STOP_COOLDOWN) {
                console.log('Cursor Auto Resume: Infinite "No content" loop detected while looking for resume links, using enhanced input...');
                setTimeout(() => {
                    if (simulateUserInput('continue with /split and /limit')) {
                        console.log('Cursor Auto Resume: Successfully executed enhanced input while handling resume conversation');
                        state.lastNeverStopAction = now;
                    } else {
                        console.log('Cursor Auto Resume: Failed to execute enhanced input while handling resume conversation');
                    }
                }, CONFIG.SIMULATE_DELAY);
                return true;
            }
        }
        
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
        // First check for infinite no content loop in error context
        // Only check if user has started generation and never stop is activated
        if (state.neverStopEnabled && state.neverStopActivated && isInfiniteNoContentLoop()) {
            const now = Date.now();
            
            // Check enhanced command cooldown first
            if (now - state.lastEnhancedCommandTime < CONFIG.ENHANCED_COMMAND_COOLDOWN) {
                const remainingTime = Math.ceil((CONFIG.ENHANCED_COMMAND_COOLDOWN - (now - state.lastEnhancedCommandTime)) / 1000);
                console.log(`Cursor Auto Resume: Enhanced command cooldown active, ${remainingTime} seconds remaining`);
                return false;
            }
            
            if (now - state.lastNeverStopAction >= CONFIG.NEVER_STOP_COOLDOWN) {
                console.log('Cursor Auto Resume: Infinite "No content" loop detected during error handling, using enhanced input...');
                setTimeout(() => {
                    if (simulateUserInput('continue with /split and /limit')) {
                        console.log('Cursor Auto Resume: Successfully executed enhanced input during error handling');
                        state.lastNeverStopAction = now;
                    } else {
                        console.log('Cursor Auto Resume: Failed to execute enhanced input during error handling');
                    }
                }, CONFIG.SIMULATE_DELAY);
                return true;
            }
        }
        
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
    // Never Stop Checker Functions
    // ===========================================
    
    /**
     * Add event listener to detect stop button clicks
     */
    function addStopButtonHandler() {
        // Use event delegation on document to catch dynamically created elements
        document.addEventListener('click', function(event) {
            const target = event.target;
            
            // Check if clicked element is a stop button
            if (target && target.tagName === 'SPAN' && target.classList.contains('codicon-debug-stop')) {
                console.log('Cursor Auto Resume: User clicked stop button, disabling auto resume...');
                
                // Stop all auto resume functionality
                if (state.intervalId) {
                    clearInterval(state.intervalId);
                    state.intervalId = null;
                }
                
                stopNeverStopChecker();
                
                // Reset state
                state.neverStopActivated = false;
                state.neverStopEnabled = false;
                
                console.log('Cursor Auto Resume: Auto resume completely stopped by user action');
                
                // Show confirmation
                setTimeout(() => {
                    console.log('Cursor Auto Resume: All automatic functions disabled. Use start_never_stop() to re-enable if needed.');
                }, 1000);
            }
        }, true); // Use capture phase to catch the event early
        
        console.log('Cursor Auto Resume: Stop button handler added');
    }
    
    /**
     * Get the current state of the send button
     */
    function getSendButtonState() {
        try {
            // Try multiple selectors for better compatibility
            const selectors = [
                // Original specific selector
                '#workbench\\.panel\\.aichat\\.e4fd208d-79ce-4d2f-acf0-d5e73f471b3b > div > div > div.monaco-scrollable-element.mac > div.split-view-container > div > div > div.pane-body > div > div > div:nth-child(2) > div.full-input-box.undefined > div:nth-child(2) > div:nth-child(2) > div > div > div > div.button-container.composer-button-area > div:nth-child(2) > span',
                // More generic selectors
                'div.button-container.composer-button-area > div:nth-child(2) > span',
                'div.button-container.composer-button-area > div:last-child > span',
                '.button-container.composer-button-area span.codicon',
                '.composer-button-area span.codicon',
                '.full-input-box span.codicon-debug-stop',
                '.full-input-box span.codicon-arrow-up-two'
            ];
            
            let sendButton = null;
            let span = null;
            
            // Try each selector until we find a match
            for (const selector of selectors) {
                try {
                    const element = document.querySelector(selector);
                    if (element) {
                        if (element.tagName === 'SPAN') {
                            span = element;
                        } else {
                            span = element.querySelector('span');
                        }
                        
                        if (span && (span.classList.contains('codicon-debug-stop') || span.classList.contains('codicon-arrow-up-two'))) {
                            sendButton = element;
                            break;
                        }
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (!sendButton || !span) {
                // Try fallback: find any span with the specific classes
                const stopSpan = document.querySelector('span.codicon-debug-stop');
                const arrowSpan = document.querySelector('span.codicon-arrow-up-two');
                
                if (stopSpan) {
                    span = stopSpan;
                } else if (arrowSpan) {
                    span = arrowSpan;
                } else {
                    return null;
                }
            }
            
            // Check if it's stop state (debug-stop icon)
            if (span.classList.contains('codicon-debug-stop')) {
                return 'generating';
            }
            
            // Check if it's ready state (arrow-up icon)
            if (span.classList.contains('codicon-arrow-up-two')) {
                return 'ready';
            }
            
            return 'unknown';
        } catch (error) {
            console.error('Cursor Auto Resume: Error getting send button state:', error);
            return null;
        }
    }
    
    /**
     * Check if the last text content is "end"
     */
    function isLastTextContentEnd() {
        try {
            const textSpans = document.querySelectorAll('span[data-lexical-text="true"]');
            if (textSpans.length === 0) {
                return false;
            }
            
            const lastSpan = textSpans[textSpans.length - 1];
            const textContent = lastSpan.textContent.trim().toLowerCase();
            
            console.log('Cursor Auto Resume: Last text content:', textContent);
            return textContent === 'end';
        } catch (error) {
            console.error('Cursor Auto Resume: Error checking last text content:', error);
            return false;
        }
    }

    /**
     * Count {end} occurrences in the conversation
     */
    function countEndOccurrences() {
        try {
            const textSpans = document.querySelectorAll('span[data-lexical-text="true"]');
            let endCount = 0;
            
            for (const span of textSpans) {
                const text = span.textContent.trim().toLowerCase();
                // Count both "end" and "{end}" patterns
                if (text === 'end' || text === '{end}') {
                    endCount++;
                }
            }
            
            return endCount;
        } catch (error) {
            console.error('Cursor Auto Resume: Error counting end occurrences:', error);
            return 0;
        }
    }

    /**
     * Check if {end} count has increased in recent 5 seconds
     */
    function hasEndCountIncreasedRecently() {
        try {
            const now = Date.now();
            const currentEndCount = countEndOccurrences();
            
            // If this is the first check, initialize
            if (state.lastEndCountCheckTime === 0) {
                state.endCount = currentEndCount;
                state.lastEndCountCheckTime = now;
                return false;
            }
            
            // Check if count has increased
            if (currentEndCount > state.endCount) {
                console.log(`Cursor Auto Resume: {end} count increased from ${state.endCount} to ${currentEndCount}`);
                state.endCount = currentEndCount;
                state.lastEndCountIncrease = now;
                state.lastEndCountCheckTime = now;
                return true;
            }
            
            // Update tracking variables
            state.endCount = currentEndCount;
            state.lastEndCountCheckTime = now;
            
            // Check if increase happened within last 5 seconds
            if (state.lastEndCountIncrease > 0 && (now - state.lastEndCountIncrease) <= 5000) {
                console.log('Cursor Auto Resume: {end} count increased within last 5 seconds, preventing auto-continuation');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Cursor Auto Resume: Error checking end count increase:', error);
            return false;
        }
    }

    /**
     * Check if user has already input the enhanced command
     */
    function hasUserInputEnhancedCommand() {
        try {
            const textSpans = document.querySelectorAll('span[data-lexical-text="true"]');
            if (textSpans.length === 0) {
                return false;
            }
            
            // Check if any recent text spans contain the enhanced command
            const recentSpans = Array.from(textSpans).slice(-5); // Check last 5 text spans
            const hasEnhancedCommand = recentSpans.some(span => {
                const text = span.textContent.trim().toLowerCase();
                return text.includes('continue with /split and /limit');
            });
            
            if (hasEnhancedCommand) {
                console.log('Cursor Auto Resume: User has already input enhanced command, skipping automatic input');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Cursor Auto Resume: Error checking enhanced command:', error);
            return false;
        }
    }

    /**
     * Check if last two "No content" responses indicate infinite loop
     */
    function isInfiniteNoContentLoop() {
        try {
            console.log('Cursor Auto Resume: Checking for infinite No content loop...');
            
            // First check if user has already input the enhanced command
            if (hasUserInputEnhancedCommand()) {
                return false;
            }
            
            // Multiple selector strategies for finding "No content" elements
            const selectors = [
                'span.composer-code-block-status span.fade-in',
                'span.composer-code-block-status span',
                '.composer-code-block-status .fade-in',
                '.composer-code-block-status span',
                'span.fade-in',
                '[class*="composer-code-block"] span',
                '[class*="fade-in"]'
            ];
            
            let noContentElements = [];
            
            // Try each selector
            for (const selector of selectors) {
                try {
                    const elements = document.querySelectorAll(selector);
                    const filteredElements = Array.from(elements).filter(el => {
                        const text = el.textContent.trim().toLowerCase();
                        return text.includes('no content');
                    });
                    
                    if (filteredElements.length > 0) {
                        noContentElements = filteredElements;
                        console.log(`Cursor Auto Resume: Found ${filteredElements.length} "No content" elements with selector: ${selector}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            // Fallback: search all elements containing "No content"
            if (noContentElements.length === 0) {
                console.log('Cursor Auto Resume: Using fallback method to find "No content" elements');
                const allElements = document.querySelectorAll('*');
                noContentElements = Array.from(allElements).filter(el => {
                    const text = el.textContent.trim().toLowerCase();
                    return text === 'no content' && el.children.length === 0;
                });
                console.log(`Cursor Auto Resume: Fallback found ${noContentElements.length} "No content" elements`);
            }
            
            if (noContentElements.length < 2) {
                console.log('Cursor Auto Resume: Less than 2 "No content" elements found, no infinite loop detected');
                return false;
            }
            
            // Check last two elements for "No content"
            const lastElement = noContentElements[noContentElements.length - 1];
            const secondLastElement = noContentElements[noContentElements.length - 2];
            
            const lastText = lastElement.textContent.trim().toLowerCase();
            const secondLastText = secondLastElement.textContent.trim().toLowerCase();
            
            console.log('Cursor Auto Resume: Last no-content text:', lastText);
            console.log('Cursor Auto Resume: Second last no-content text:', secondLastText);
            
            const isLoop = lastText.includes('no content') && secondLastText.includes('no content');
            
            if (isLoop) {
                console.log('Cursor Auto Resume: Infinite "No content" loop detected!');
            } else {
                console.log('Cursor Auto Resume: No infinite loop detected');
            }
            
            return isLoop;
        } catch (error) {
            console.error('Cursor Auto Resume: Error checking no content loop:', error);
            return false;
        }
    }
    

    
    /**
     * Handle never stop logic when generation stops
     */
    function handleNeverStopCheck() {
        const now = Date.now();
        
        const currentButtonState = getSendButtonState();
        
        // If we can't detect the button state, skip this check
        if (!currentButtonState) {
            return;
        }
        
        // Detect transition from ready to generating (user started generation)
        if (state.previousSendButtonState === 'ready' && currentButtonState === 'generating') {
            console.log('Cursor Auto Resume: Generation started, never stop checker activated');
            state.neverStopActivated = true;
        }
        
        // Detect transition from generating to ready (generation stopped)
        if (state.previousSendButtonState === 'generating' && currentButtonState === 'ready' && state.neverStopActivated) {
            // Check cooldown
            if (now - state.lastNeverStopAction < CONFIG.NEVER_STOP_COOLDOWN) {
                state.previousSendButtonState = currentButtonState;
                return;
            }
            
            console.log('Cursor Auto Resume: Generation stopped, checking if should continue...');
            
            // Check if last text content is "end"
            if (isLastTextContentEnd()) {
                console.log('Cursor Auto Resume: Last text is "end", stopping never stop checker');
                state.neverStopEnabled = false;
                state.neverStopActivated = false;
                return;
            }
            
            // Check if {end} count has increased recently
            if (hasEndCountIncreasedRecently()) {
                console.log('Cursor Auto Resume: {end} count increased recently, skipping auto-continuation');
                return;
            }
            
            // Check for infinite no content loop
            const isNoContentLoop = isInfiniteNoContentLoop();
            const inputText = isNoContentLoop ? 'continue with /split and /limit' : 'continue with call MCP interactive_feedback';
            
            // Check enhanced command cooldown if using enhanced commands
            if (isEnhancedCommand(inputText) && now - state.lastEnhancedCommandTime < CONFIG.ENHANCED_COMMAND_COOLDOWN) {
                const remainingTime = Math.ceil((CONFIG.ENHANCED_COMMAND_COOLDOWN - (now - state.lastEnhancedCommandTime)) / 1000);
                console.log(`Cursor Auto Resume: Enhanced command cooldown active, ${remainingTime} seconds remaining`);
                return;
            }
            
            // Continue the conversation
            if (isNoContentLoop) {
                console.log('Cursor Auto Resume: Detected infinite "No content" loop, using enhanced input...');
            } else {
                console.log('Cursor Auto Resume: Last text is not "end", continuing conversation...');
            }
            
            setTimeout(() => {
                if (simulateUserInput(inputText)) {
                    console.log(`Cursor Auto Resume: Successfully continued conversation with "${inputText}"`);
                    state.lastNeverStopAction = now;
                } else {
                    console.log('Cursor Auto Resume: Failed to continue conversation');
                }
            }, CONFIG.SIMULATE_DELAY);
        }
        
        // Update previous state
        state.previousSendButtonState = currentButtonState;
    }
    
    /**
     * Start the never stop checker
     */
    function startNeverStopChecker() {
        if (state.neverStopIntervalId) {
            clearInterval(state.neverStopIntervalId);
        }
        
        state.neverStopIntervalId = setInterval(() => {
            if (state.neverStopEnabled) {
                handleNeverStopCheck();
            }
        }, CONFIG.NEVER_STOP_CHECK_INTERVAL);
        
        console.log('Cursor Auto Resume: Never stop checker started');
    }
    
    /**
     * Stop the never stop checker
     */
    function stopNeverStopChecker() {
        if (state.neverStopIntervalId) {
            clearInterval(state.neverStopIntervalId);
            state.neverStopIntervalId = null;
        }
        state.neverStopEnabled = false;
        console.log('Cursor Auto Resume: Never stop checker stopped');
    }
    
    /**
     * Toggle never stop checker
     */
    function toggleNeverStopChecker() {
        if (state.neverStopEnabled) {
            stopNeverStopChecker();
        } else {
            state.neverStopEnabled = true;
            startNeverStopChecker();
        }
        return state.neverStopEnabled;
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
        
                // Check for infinite no content loop first (highest priority)
        // Only check if user has started generation and never stop is activated
        if (state.neverStopEnabled && state.neverStopActivated && isInfiniteNoContentLoop()) {
            // Check enhanced command cooldown first
            if (now - state.lastEnhancedCommandTime < CONFIG.ENHANCED_COMMAND_COOLDOWN) {
                const remainingTime = Math.ceil((CONFIG.ENHANCED_COMMAND_COOLDOWN - (now - state.lastEnhancedCommandTime)) / 1000);
                console.log(`Cursor Auto Resume: Enhanced command cooldown active, ${remainingTime} seconds remaining`);
                return;
            }
            
            // Check regular cooldown before taking action
            if (now - state.lastNeverStopAction >= CONFIG.NEVER_STOP_COOLDOWN) {
                console.log('Cursor Auto Resume: Infinite "No content" loop detected in main loop, taking immediate action...');
                setTimeout(() => {
                    if (simulateUserInput('continue with /split and /limit')) {
                        console.log('Cursor Auto Resume: Successfully executed enhanced input to break loop');
                        state.lastNeverStopAction = now;
                    } else {
                        console.log('Cursor Auto Resume: Failed to execute enhanced input');
                    }
                }, CONFIG.SIMULATE_DELAY);
                return;
            }
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
    
    // Make functions available globally
    window.click_reset = resetState;
    window.toggle_never_stop = toggleNeverStopChecker;
    window.stop_never_stop = stopNeverStopChecker;
    window.start_never_stop = startNeverStopChecker;
    window.test_no_content_detection = isInfiniteNoContentLoop;
    window.test_simulate_input = simulateUserInput;
    window.check_enhanced_command = hasUserInputEnhancedCommand;
    window.test_end_count = countEndOccurrences;
    window.check_end_increase = hasEndCountIncreasedRecently;
    window.get_no_content_state = function() {
        const now = Date.now();
        const enhancedCooldownRemaining = Math.max(0, CONFIG.ENHANCED_COMMAND_COOLDOWN - (now - state.lastEnhancedCommandTime));
        return {
            activated: state.neverStopActivated,
            hasEnhancedCommand: hasUserInputEnhancedCommand(),
            lastEnhancedCommandTime: state.lastEnhancedCommandTime,
            enhancedCooldownRemaining: Math.ceil(enhancedCooldownRemaining / 1000)
        };
    };
    
    // Start the main loop
    state.intervalId = setInterval(mainLoop, 1000);
    mainLoop(); // Run once immediately
    
    // Start the never stop checker
    startNeverStopChecker();
    
    console.log('Cursor Auto Resume: Will stop after 24 hours. Call click_reset() to reset timer.');
    console.log('Cursor Auto Resume: Never Stop Checker enabled. Type "end" to stop auto-continuation.');
    console.log('Cursor Auto Resume: Enhanced commands have 1-minute cooldown: "continue with call MCP interactive_feedback" and "continue with /split and /limit"');
    console.log('Cursor Auto Resume: Use toggle_never_stop() to toggle, stop_never_stop() to disable, start_never_stop() to enable.');
    console.log('Cursor Auto Resume: Debug functions: test_no_content_detection(), test_simulate_input(text), check_enhanced_command(), get_no_content_state()');
    console.log('Cursor Auto Resume: End tracking functions: test_end_count(), check_end_increase()');
    
    // Add stop button handler
    addStopButtonHandler();
    
})(); 