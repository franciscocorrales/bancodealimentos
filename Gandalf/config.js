const CONFIG = {
    URLS: {
        GOOGLE_SEARCH: 'https://www.google.com/search?q='
    },
    RESOLUTIONS: {
        LOW: ['240p', '360p', '480p', '540p', '720p', '960p'],
        GOOD: ['1080p'],
        TOO_HIGH: ['1280p', '2160p', '3072p', '4K', '8K'],
    },
    INTERVALS: {
        CHECK_ELEMENT: 500,       // How often to check for elements (ms)
        MAX_WAIT_TIME: 30000,     // Maximum time to wait for elements (ms)
        RETRY_DELAY: 1000,        // Delay between click attempts (ms)
    },
    MESSAGES: {
        ELEMENT_FOUND: (element) => `Found ${element}`,
        ELEMENT_NOT_FOUND: (element) => `Could not find ${element}`,
        INTERVAL_FINISHED: 'Interval finished',
        HANDLER_INIT: (site) => `Handler for ${site} initialized`,
        CLICK_ATTEMPT: (element, attempt) => `Attempting to click ${element} (attempt ${attempt})`,
        SUCCESS: (action) => `Successfully ${action}`
    }
};