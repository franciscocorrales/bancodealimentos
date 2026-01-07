// Object to store site-specific handlers
const siteHandlers = {
    '0xxx.ws': xxxHandler,
    'chaturbate.com': chaturbateHandler,
    'web.whatsapp.com': whatsappHandler,
    'youtube.com': youtubeHandler,
    'bancodealimentos.or.cr': bancodealimentosHandler,
};

// Function to get the current domain
function getCurrentDomain() {
    return window.location.hostname.replace('www.', '');
}

// Function to re-enable right-click and text selection on protected websites
function disableRightClickProtection() {
    // Remove all event listeners that might be blocking right-click
    document.addEventListener('contextmenu', function (e) {
        e.stopImmediatePropagation();
        return true;
    }, true);

    document.addEventListener('selectstart', function (e) {
        e.stopImmediatePropagation();
        return true;
    }, true);

    document.addEventListener('dragstart', function (e) {
        e.stopImmediatePropagation();
        return true;
    }, true);

    // Remove CSS properties that disable text selection
    const style = document.createElement('style');
    style.innerHTML = `
        * {
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            user-select: text !important;
            -webkit-touch-callout: default !important;
            -webkit-user-drag: element !important;
            -khtml-user-drag: element !important;
            -moz-user-drag: element !important;
            -o-user-drag: element !important;
            user-drag: element !important;
        }
    `;
    document.head.appendChild(style);

    // Remove oncontextmenu attributes from all elements
    document.querySelectorAll('*').forEach(el => {
        el.oncontextmenu = null;
        el.onselectstart = null;
        el.ondragstart = null;
        el.removeAttribute('oncontextmenu');
        el.removeAttribute('onselectstart');
        el.removeAttribute('ondragstart');
        el.removeAttribute('unselectable');
    });

    // Override common protection functions
    window.oncontextmenu = null;
    document.oncontextmenu = null;
    document.onselectstart = null;
    document.ondragstart = null;

    // Remove any existing protection intervals/timeouts
    for (let i = 1; i < 99999; i++) {
        clearTimeout(i);
        clearInterval(i);
    }

    gandalfSpeaks.log('Right-click and text selection protection disabled!');
    return 'Protection disabled successfully!';
}

// Helper function to check if URL contains a substring
function hasInUrl(substring) {
    return window.location.href.includes(substring);
}

// Custom Gandalf logging functions
const gandalfSpeaks = {
    log: (...args) => console.log('🧙‍♂️ ', ...args),
    warn: (...args) => console.warn('🧙‍♂️ ', ...args),
    error: (...args) => console.error('🧙‍♂️ ', ...args),
    info: (...args) => console.info('🧙‍♂️ ', ...args),
    debug: (...args) => console.debug('🧙‍♂️ ', ...args)
};

// Main initialization function
function initialize() {
    gandalfSpeaks.warn('Gandalf Extension - Initializing content script...');

    const currentDomain = getCurrentDomain();
    gandalfSpeaks.log(`🌐 Current domain: ${currentDomain}`);

    for (const site in siteHandlers) {
        if (currentDomain.includes(site)) {
            gandalfSpeaks.log(`Initializing handler for ${site}`);
            siteHandlers[site]();
            break;
        }
    }

    gandalfSpeaks.log('🎉 Gandalf content script initialization complete!');
}

 initialize();