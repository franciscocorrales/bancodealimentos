// Import config by loading it as a script
importScripts('config.js');

chrome.runtime.onInstalled.addListener((info, tab) => {
    chrome.contextMenus.create({
        id: "searchInAdultSites",
        title: "Search in Adult sites",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "searchInAdultSites" && info.selectionText) {
        const selectedText = encodeURIComponent(info.selectionText);

        // Array to store the search sites
        const searchSites = [
            "www.pornbb.org",
            "forumophilia.com",
            "hidefporn.ws",
            "naughtyblog.org",
            "dfusporn.net",
            "0xxx.ws",
            "www.adultdb.io",
            "forum.intporn.com",
            "porncoven.com",
            "vipergirls.to"
        ];

        // Construct the 'site:' part of the Google search query
        const siteQuery = searchSites.map(site => `site:${site}`).join(" | ");

        // Use CONFIG.RESOLUTIONS to build the resolution filter
        const unwantedResolutions = [...CONFIG.RESOLUTIONS.LOW, ...CONFIG.RESOLUTIONS.TOO_HIGH];
        const resolutionFilter = unwantedResolutions.map(res => `-${res}`).join(' ');
        const goodResolutions = CONFIG.RESOLUTIONS.GOOD.join(' ');
        const resolutions = `${goodResolutions} ${resolutionFilter}`;

        // Construct the full dynamic URL
        const dynamicUrl = `${CONFIG.URLS.GOOGLE_SEARCH}${selectedText} ${resolutions} ${siteQuery}`;

        gandalfSpeaks.log('Opening search URL:', dynamicUrl);
        chrome.tabs.create({ url: dynamicUrl });
    }
});