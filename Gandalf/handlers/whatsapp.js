function whatsappHandler() {
    const UNREAD_FILTER_BUTTON = '#unread-filter';
    let elementFound = false;

    gandalfSpeaks.log(CONFIG.MESSAGES.HANDLER_INIT('WhatsApp Web'));

    // Wait for the unread filter button to be available
    const waitForButton = setInterval(() => {
        const unreadButton = document.querySelector(UNREAD_FILTER_BUTTON);

        if (unreadButton) {
            gandalfSpeaks.log(CONFIG.MESSAGES.ELEMENT_FOUND('unread filter button'));

            // Check if the button is not already active/pressed
            // WhatsApp uses aria-pressed="true" when the unread filter is active
            const isActive = unreadButton.getAttribute('aria-pressed') === 'true';

            if (!isActive) {
                gandalfSpeaks.log(CONFIG.MESSAGES.CLICK_ATTEMPT('unread filter button', 1));
                unreadButton.click();
                gandalfSpeaks.log(CONFIG.MESSAGES.SUCCESS('clicked unread filter'));
            } else {
                gandalfSpeaks.log('Unread filter already active, skipping click');
            }

            clearInterval(waitForButton);
            elementFound = true;
        } else {
            gandalfSpeaks.log('Still searching for unread filter button...');
        }
    }, CONFIG.INTERVALS.CHECK_ELEMENT);

    // Clear interval after maximum wait time
    setTimeout(() => {
        clearInterval(waitForButton);
        if (!elementFound) {
            gandalfSpeaks.log(CONFIG.MESSAGES.ELEMENT_NOT_FOUND('unread filter button'));
            // Log available elements for debugging
            const chatList = document.querySelector('[data-testid="chat-list"]');
            const sidebar = document.querySelector('[data-testid="sidebar"]');
            gandalfSpeaks.log('Available elements:', {
                chatList: !!chatList,
                sidebar: !!sidebar,
                unreadFilterExists: !!document.querySelector('#unread-filter')
            });
        }
        gandalfSpeaks.log(CONFIG.MESSAGES.INTERVAL_FINISHED);
    }, CONFIG.INTERVALS.MAX_WAIT_TIME);
}