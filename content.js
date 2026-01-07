// Object to store site-specific handlers
const siteHandlers = {
    'bancodealimentos.or.cr': bancodealimentosHandler,
};

// Function to get the current domain
function getCurrentDomain() {
    return window.location.hostname.replace('www.', '');
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