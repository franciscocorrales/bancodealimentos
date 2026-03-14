// Object to store site-specific handlers
const siteHandlers = {
    'bancodealimentos.or.cr': bancodealimentosHandler,
};

// Function to get the current domain
function getCurrentDomain() {
    return window.location.hostname.replace('www.', '');
}

// Custom logging functions
const bancoLog = {
    log: (...args) => console.log('🛒 ', ...args),
    warn: (...args) => console.warn('🛒 ', ...args),
    error: (...args) => console.error('🛒 ', ...args),
    info: (...args) => console.info('🛒 ', ...args),
    debug: (...args) => console.debug('🛒 ', ...args)
};

// Main initialization function
function initialize() {
    bancoLog.warn('Banco de Alimentos Extension - Initializing content script...');

    const currentDomain = getCurrentDomain();
    bancoLog.log(`🌐 Current domain: ${currentDomain}`);

    for (const site in siteHandlers) {
        if (currentDomain.includes(site)) {
            bancoLog.log(`Initializing handler for ${site}`);
            siteHandlers[site]();
            break;
        }
    }

    bancoLog.log('🎉 Content script initialization complete!');
}

 initialize();