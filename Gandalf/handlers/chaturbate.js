function chaturbateHandler() {
    const CHAT_CLOSE_BTN = 'div#chat-close-btn';
    let elementFound = false;

    // Wait for the close button to be available
    const waitForButton = setInterval(() => {
        const closeButton = document.querySelector(CHAT_CLOSE_BTN);
        if (closeButton) {
            gandalfSpeaks.log(CONFIG.MESSAGES.ELEMENT_FOUND('chat close button'));
            closeButton.click();
            clearInterval(waitForButton);
            elementFound = true;
        }
    }, CONFIG.INTERVALS.CHECK_ELEMENT);

    // Clear interval after maximum wait time
    setTimeout(() => {
        clearInterval(waitForButton);
        if (!elementFound) {
            gandalfSpeaks.log(CONFIG.MESSAGES.ELEMENT_NOT_FOUND('chat close button'));
        }
        gandalfSpeaks.log(CONFIG.MESSAGES.INTERVAL_FINISHED);
    }, CONFIG.INTERVALS.MAX_WAIT_TIME);
}