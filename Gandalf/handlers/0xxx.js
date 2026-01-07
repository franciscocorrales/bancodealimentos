function xxxHandler() {
    const WEBSITE = 'https://0xxx.ws/'
    // Selector for the download links button
    const DOWNLOAD_BUTTON_SELECTOR = 'form#captcha button.h-captcha';
    const TITLE_SELECTOR = '#detail-table h1';
    const HOME_TABLE_SELECTOR = '#home-table tbody tr'; // Selector for table rows on the home page
    const COMPACT_TABLE_SELECTOR = '#detail-table'; // Selector for compact view tables
    const COMPACT_TITLE_SELECTOR = '#detail-table h1 a'; // Selector for titles in compact view

    // Selectors for elements to remove
    const BACKLINKS_SELECTOR = '#backlinks';
    const AD_LINK_SELECTORS = [
        'a[href^="/r/k2s.html"]',
        'a[href^="https://www.filecrypt.cc/Container/"]'
    ];
    // Selector for the rapidgator image in table cell
    const RAPIDGATOR_CELL_SELECTOR = 'td.dlinks.taj';

    let elementFound = false;

    // Create quality pattern from CONFIG.RESOLUTIONS
    const allResolutions = [...CONFIG.RESOLUTIONS.LOW, ...CONFIG.RESOLUTIONS.GOOD, ...CONFIG.RESOLUTIONS.TOO_HIGH];
    const qualityPattern = new RegExp(`\\b(${allResolutions.join('|')})\\b`, 'i');

    // Function to check if we are on the main list page or any search page
    function isListPage() {
        if (hasInUrl('index.php') || window.location.href.endsWith(WEBSITE) ||
            (window.location.href === WEBSITE || window.location.href === WEBSITE.slice(0, -1))) {
            return true;
        }
        return false;
    }

    // Function to check if we're on a post detail page
    function isArticlePage() {
        // Check if the current URL contains relevant patterns
        return hasInUrl('/articles');
    }

    // Function to check if we are on the compact view
    function isCompactPage() {
        return hasInUrl('/compact') || hasInUrl('compact.php');
    }

    // Function to remove rows with low resolution or specific patterns
    function filterListItems() {
        if (!isListPage() && !isCompactPage()) {
            return;
        }

        // Specific patterns to filter out (combined low res and unwanted patterns)
        // Combine low resolution and too high resolution patterns from CONFIG
        const unwantedPatterns = [
            'VR180', // Virtual Reality
            ...CONFIG.RESOLUTIONS.LOW.map(res => ` ${res} `),
            ...CONFIG.RESOLUTIONS.TOO_HIGH.map(res => ` ${res} `),
            'MP4-SDCLiP', // Keep this specific format filter
        ];

        if (isCompactPage()) {
            // Handle compact view - each item is in its own table
            const tables = document.querySelectorAll(COMPACT_TABLE_SELECTOR);
            tables.forEach(table => {
                const titleElement = table.querySelector(COMPACT_TITLE_SELECTOR);
                if (titleElement) {
                    const titleText = titleElement.textContent;
                    const titleLower = titleText.toLowerCase();

                    // Check if the title contains any of the unwanted patterns
                    if (unwantedPatterns.some(pattern => titleLower.includes(pattern.toLowerCase()))) {
                        gandalfSpeaks.log('Removing compact item:', titleText);
                        // Remove the entire table and its shadow div
                        const shadowDiv = table.nextElementSibling;
                        if (shadowDiv && shadowDiv.classList.contains('sjena')) {
                            shadowDiv.remove();
                        }
                        table.remove();
                    }
                }
            });
        } else {
            // Handle normal list view
            const rows = document.querySelectorAll(HOME_TABLE_SELECTOR);
            rows.forEach(row => {
                const titleElement = row.querySelector('.title a');
                if (titleElement) {
                    const titleText = titleElement.textContent;
                    const titleLower = titleText.toLowerCase();

                    // Check if the title contains any of the unwanted patterns
                    if (unwantedPatterns.some(pattern => titleLower.includes(pattern.toLowerCase()))) {
                        gandalfSpeaks.log('Removing list item:', titleText);
                        row.remove();
                    }
                }
            });
        }
    }

    // Reformats a title string by removing specific patterns and rearranging parts
    function reformatTitleString(title) {
        const datePattern = /\d{2}\s\d{2}\s\d{2}/; // Example: "25 05 09" as in "YY MM DD"
        const dateMatch = title.match(datePattern);
        let formattedDate = '';

        if (dateMatch) {
            const dateParts = dateMatch[0].split(' '); // ["25", "05", "09"]
            const year = dateParts[0];
            const month = dateParts[1];
            const day = dateParts[2];

            // Convert YY to full year (assuming 20XX for years 00-99)
            const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;

            // Format as DD.MM.YYYY
            formattedDate = `${day}.${month}.${fullYear}`;
        }

        // Match different quality formats
        const qualityMatch = title.match(qualityPattern);
        const quality = qualityMatch ? qualityMatch[0] : '';

        title = title
            .replace(/XXX/g, '')
            .replace(/MP4-WRB/g, '')
            .replace(/MP4-P2P/g, '')
            .replace(/MP4-NBQ/g, '')
            .replace(/MP4-KTR/g, '')
            .replace(/MP4-CLiP/g, '')
            .replace(/MP4-SDCLiP/g, '')
            .replace(/WMV-SEXORS/g, '')
            .replace(/WMV-LEWD/g, '')
            .replace(/MP4-ORGASMS/g, '')
            .replace(/MP4-Narcos/g, '')
            .replace(datePattern, '')
            .replace(qualityPattern, '')
            .trim();

        return `${quality} ${title} ${formattedDate}`.trim();
    }

    // Reformat title on the detail page
    function reformatTitle() {
        if (!isArticlePage()) {
            return;
        }
        const h1Element = document.querySelector(TITLE_SELECTOR);

        if (!h1Element) return;

        let title = h1Element.textContent.trim();
        h1Element.textContent = reformatTitleString(title);
    }

    // Reformat titles on the list pages
    function reformatListTitles() {
        if (!isListPage() && !isCompactPage()) {
            return;
        }

        if (isCompactPage()) {
            // Handle compact view
            const titleElements = document.querySelectorAll(COMPACT_TITLE_SELECTOR);
            titleElements.forEach(titleElement => {
                let originalTitle = titleElement.textContent.trim();
                titleElement.textContent = reformatTitleString(originalTitle);

                // Also update the title attribute if it exists
                if (titleElement.hasAttribute('title')) {
                    titleElement.setAttribute('title', reformatTitleString(originalTitle));
                }
            });
        } else {
            // Handle normal list view
            const rows = document.querySelectorAll(HOME_TABLE_SELECTOR);
            rows.forEach(row => {
                const titleElement = row.querySelector('.title a');
                if (titleElement) {
                    let originalTitle = titleElement.textContent.trim();
                    titleElement.textContent = reformatTitleString(originalTitle);

                    // Also update the title attribute if it exists
                    if (titleElement.hasAttribute('title')) {
                        titleElement.setAttribute('title', reformatTitleString(originalTitle));
                    }
                }
            });
        }
    }

    // Function to remove unwanted elements on the detail page
    function removeUnwantedElements() {
        if (!isArticlePage()) {
            return;
        }
        // Remove backlinks div by ID
        const backlinksDiv = document.querySelector(BACKLINKS_SELECTOR);
        if (backlinksDiv) {
            gandalfSpeaks.log('Found and removing backlinks div');
            backlinksDiv.remove();
        }

        // Remove ad links
        AD_LINK_SELECTORS.forEach(selector => {
            const adLinks = document.querySelectorAll(selector);
            if (adLinks.length > 0) {
                gandalfSpeaks.log(`Found and removing ${adLinks.length} ad links matching ${selector}`);
                adLinks.forEach(link => link.remove());
            }
        });

        // Remove rapidgator cells
        const rapidgatorCells = document.querySelectorAll(RAPIDGATOR_CELL_SELECTOR);
        if (rapidgatorCells.length > 0) {
            gandalfSpeaks.log(`Found ${rapidgatorCells.length} rapidgator cells`);
            rapidgatorCells.forEach(cell => {
                // Check if cell contains the specific rapidgator link
                if (cell.innerHTML.includes('/r/rg.html') || cell.innerHTML.includes('/r/rg.gif')) {
                    cell.remove();
                }
            });
        }
    }

    // Main execution logic
    if (isListPage() || isCompactPage()) {
        gandalfSpeaks.log(`Detected ${isCompactPage() ? 'compact' : 'list'} page`);
        // First filter out unwanted rows
        filterListItems();
        // Then reformat the remaining titles
        reformatListTitles();
    } else if (isArticlePage()) {
        gandalfSpeaks.log('Detected article page');
        // First remove unwanted elements
        removeUnwantedElements();
        // Then reformat the title
        reformatTitle();

        // Wait for the button to be available (only if CONFIG is defined)
        if (typeof CONFIG !== 'undefined') {
            const waitForButton = setInterval(() => {
                const downloadButton = document.querySelector(DOWNLOAD_BUTTON_SELECTOR);

                if (downloadButton) {
                    gandalfSpeaks.log('Found download button:', downloadButton.innerText);
                    clearInterval(waitForButton);
                    elementFound = true;
                } else {
                    gandalfSpeaks.log('Still searching for download button...');
                }
            }, CONFIG.INTERVALS?.CHECK_ELEMENT || 1000);

            // Clear interval after maximum wait time
            setTimeout(() => {
                clearInterval(waitForButton);
                if (!elementFound) {
                    gandalfSpeaks.log('Download button not found after timeout');
                    gandalfSpeaks.log('DOM at time of failure:', document.querySelector('form#captcha')?.innerHTML || 'Form not found');
                }
                gandalfSpeaks.log('Button search finished');
            }, CONFIG.INTERVALS?.MAX_WAIT_TIME || 30000);
        }
    } else {
        gandalfSpeaks.log('Unknown page type, no actions taken');
    }
}