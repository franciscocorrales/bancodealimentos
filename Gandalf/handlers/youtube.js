function youtubeHandler() {
    const HISTORY_PAGE_URL = '/feed/history';
    const VIDEO_CARD_SELECTOR = 'ytd-video-renderer';
    const PROGRESS_SELECTOR = 'ytd-thumbnail-overlay-resume-playback-renderer #progress';
    const SHORTS_SHELF_SELECTOR = 'ytd-reel-shelf-renderer';
    const RICH_SECTION_SELECTOR = 'ytd-rich-section-renderer';

    let controlPanel = null;
    let hideWatchedBtn = null;
    let hiddenVideos = [];
    let isHidingWatched = false;
    let hiddenShortsCount = 0;

    gandalfSpeaks.log(CONFIG.MESSAGES.HANDLER_INIT('YouTube'));

    // Check if we're on the history page
    function isHistoryPage() {
        return hasInUrl(HISTORY_PAGE_URL);
    }

    // Check if a rich section contains Shorts
    function isRichSectionShorts(richSection) {
        const titleElement = richSection.querySelector('ytd-rich-shelf-renderer #title');
        if (titleElement && titleElement.textContent.trim().toLowerCase() === 'shorts') {
            return true;
        }
        return false;
    }

    // Auto-hide all shorts/reels
    function hideAllShorts() {
        const shortsElements = document.querySelectorAll(SHORTS_SHELF_SELECTOR);
        const richSections = document.querySelectorAll(RICH_SECTION_SELECTOR);
        let hiddenCount = 0;

        shortsElements.forEach(shorts => {
            if (shorts.style.display !== 'none') {
                shorts.style.display = 'none';
                hiddenCount++;
            }
        });

        richSections.forEach(section => {
            if (isRichSectionShorts(section) && section.style.display !== 'none') {
                section.style.display = 'none';
                hiddenCount++;
            }
        });

        if (hiddenCount > 0) {
            hiddenShortsCount += hiddenCount;
            gandalfSpeaks.log(`Auto-hidden ${hiddenCount} Shorts sections`);
            updateUI();
        }
    }

    // Check if a video is fully watched (100% progress)
    function isVideoFullyWatched(videoCard) {
        const progressElement = videoCard.querySelector(PROGRESS_SELECTOR);
        if (!progressElement) return false;
        return progressElement.style.width === '100%';
    }

    // Toggle hiding/showing fully watched videos
    function toggleFullyWatchedVideos() {
        const videoCards = document.querySelectorAll(VIDEO_CARD_SELECTOR);

        if (!isHidingWatched) {
            hiddenVideos = [];
            videoCards.forEach(card => {
                if (isVideoFullyWatched(card)) {
                    card.style.display = 'none';
                    hiddenVideos.push(card);
                }
            });
            isHidingWatched = true;
            hideWatchedBtn.updateText('Show All Videos');
            hideWatchedBtn.style.background = 'linear-gradient(145deg, #cc0000, #b30000)';
            controlPanel.log(`🙈 Hidden ${hiddenVideos.length} fully watched videos`);
        } else {
            hiddenVideos.forEach(card => {
                card.style.display = '';
            });
            isHidingWatched = false;
            const previousCount = hiddenVideos.length;
            hiddenVideos = [];
            hideWatchedBtn.updateText('Hide Fully Watched');
            hideWatchedBtn.style.background = 'linear-gradient(145deg, #065fd4, #0854c1)';
            controlPanel.log(`👁️ Showing all videos (${previousCount} were hidden)`);
        }
        updateUI();
    }

    // Update UI status indicators
    function updateUI() {
        if (!controlPanel) return;

        // Update status indicators
        const shortsStatus = document.getElementById('shorts-status');
        const watchedStatus = document.getElementById('watched-status');
        const hiddenVideosCount = document.getElementById('hidden-videos-count');
        const hiddenShortsCountElement = document.getElementById('hidden-shorts-count');

        if (shortsStatus) {
            shortsStatus.textContent = 'Auto-hidden ✅';
            shortsStatus.style.color = '#28a745';
        }

        if (watchedStatus) {
            watchedStatus.textContent = isHidingWatched ? 'Hidden ✅' : 'Visible 👁️';
            watchedStatus.style.color = isHidingWatched ? '#28a745' : '#6c757d';
        }

        if (hiddenVideosCount) {
            hiddenVideosCount.textContent = hiddenVideos.length;
        }

        if (hiddenShortsCountElement) {
            hiddenShortsCountElement.textContent = hiddenShortsCount;
        }
    }

    // Create enhanced control panel for history page
    function createHistoryControlPanel() {
        // Set YouTube theme colors
        const youtubeTheme = {
            primary: '#ff0000',
            primaryDark: '#cc0000',
            secondary: '#065fd4',
            success: '#28a745',
            warning: '#ffc107',
            danger: '#dc3545',
            info: '#17a2b8',
            light: '#f8f9fa',
            dark: '#0f0f0f',
            background: 'linear-gradient(145deg, #f9f9f9, #e8e8e8)',
            glass: 'rgba(255, 255, 255, 0.1)',
            shadow: '0 8px 32px rgba(255, 0, 0, 0.2)',
            borderRadius: '12px',
            fontFamily: "'YouTube Sans', 'Roboto', sans-serif"
        };

        const panel = GandalfUI.createAdvancedPanel({
            title: 'YouTube Enhancer',
            icon: '🧙‍♂️',
            position: { top: '80px', right: '20px' },
            width: '320px',
            maxHeight: 'none',
            theme: youtubeTheme
        });

        // Add status section
        panel.addStatusSection({
            title: '📊 YouTube Status',
            backgroundColor: '#fff3cd',
            borderColor: '#ffeaa7',
            items: [
                { icon: '🚫', label: 'Shorts', id: 'shorts-status', value: 'Auto-hidden ✅' },
                { icon: '👁️', label: 'Watched Videos', id: 'watched-status', value: 'Visible' },
                { icon: '🙈', label: 'Hidden Videos', id: 'hidden-videos-count', value: '0' },
                { icon: '📱', label: 'Hidden Shorts', id: 'hidden-shorts-count', value: '0' }
            ]
        });

        // Add button grid for controls
        const buttonGrid = panel.addButtonGrid({
            columns: 1,
            gap: '10px',
            buttons: [
                {
                    text: 'Hide Fully Watched',
                    icon: '🙈',
                    color: '#065fd4',
                    fullWidth: true,
                    onClick: toggleFullyWatchedVideos
                },
                {
                    text: 'Refresh Shorts Filter',
                    icon: '🔄',
                    color: '#ff6b6b',
                    fullWidth: true,
                    onClick: () => {
                        hideAllShorts();
                        panel.log('🔄 Refreshed Shorts filter');
                    }
                },
                {
                    text: 'Reset All',
                    icon: '↩️',
                    color: '#6c757d',
                    fullWidth: true,
                    variant: 'outline',
                    onClick: () => {
                        // Show all hidden videos
                        if (isHidingWatched) {
                            toggleFullyWatchedVideos();
                        }
                        hiddenShortsCount = 0;
                        updateUI();
                        panel.log('↩️ Reset all filters');
                    }
                }
            ]
        });

        // Get the hide watched button reference
        hideWatchedBtn = buttonGrid.children[0];

        // Add activity log
        panel.addActivityLog({
            title: '📝 YouTube Activity',
            maxEntries: 30,
            height: '150px'
        });

        // Initial log
        panel.log('🎬 YouTube Enhancer initialized');
        panel.log('🚫 Auto-hiding Shorts sections');

        return panel;
    }

    // Handle new content loaded by infinite scroll or navigation
    function observeNewContent() {
        const observer = new MutationObserver((mutations) => {
            let newShortsHidden = false;
            let newVideosProcessed = false;

            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.matches) {
                        // Auto-hide new shorts
                        if (node.matches(SHORTS_SHELF_SELECTOR)) {
                            node.style.display = 'none';
                            hiddenShortsCount++;
                            newShortsHidden = true;
                        }

                        if (node.matches(RICH_SECTION_SELECTOR) && isRichSectionShorts(node)) {
                            node.style.display = 'none';
                            hiddenShortsCount++;
                            newShortsHidden = true;
                        }

                        // Handle new video cards on history page
                        if (node.matches(VIDEO_CARD_SELECTOR) && isHistoryPage() && isHidingWatched) {
                            if (isVideoFullyWatched(node)) {
                                node.style.display = 'none';
                                hiddenVideos.push(node);
                                newVideosProcessed = true;
                            }
                        }

                        // Check nested content
                        node.querySelectorAll(SHORTS_SHELF_SELECTOR).forEach(shorts => {
                            shorts.style.display = 'none';
                            hiddenShortsCount++;
                            newShortsHidden = true;
                        });

                        node.querySelectorAll(RICH_SECTION_SELECTOR).forEach(section => {
                            if (isRichSectionShorts(section)) {
                                section.style.display = 'none';
                                hiddenShortsCount++;
                                newShortsHidden = true;
                            }
                        });

                        if (isHistoryPage() && isHidingWatched) {
                            node.querySelectorAll(VIDEO_CARD_SELECTOR).forEach(video => {
                                if (isVideoFullyWatched(video)) {
                                    video.style.display = 'none';
                                    hiddenVideos.push(video);
                                    newVideosProcessed = true;
                                }
                            });
                        }
                    }
                });
            });

            // Update UI and log if new content was processed
            if (newShortsHidden || newVideosProcessed) {
                updateUI();
                if (controlPanel) {
                    if (newShortsHidden) {
                        controlPanel.log('🚫 Auto-hidden new Shorts');
                    }
                    if (newVideosProcessed) {
                        controlPanel.log('🙈 Auto-hidden new watched videos');
                    }
                }
            }
        });

        const mainContent = document.querySelector('#contents') ||
            document.querySelector('#primary') ||
            document.querySelector('#page-manager');
        if (mainContent) {
            observer.observe(mainContent, { childList: true, subtree: true });
        }

        return observer;
    }

    // Initialize the functionality
    function initializeYouTubeHandler() {
        gandalfSpeaks.log(`Detected YouTube page: ${window.location.pathname}`);

        const waitForPage = setInterval(() => {
            const pageContent = document.querySelector('#contents') ||
                document.querySelector('#primary') ||
                document.querySelector('#page-manager');

            if (pageContent) {
                gandalfSpeaks.log('YouTube page content loaded');

                // Auto-hide shorts on all pages
                hideAllShorts();

                // Create control panel only on history page
                if (isHistoryPage()) {
                    const videoCards = document.querySelectorAll(VIDEO_CARD_SELECTOR);
                    if (videoCards.length > 0) {
                        controlPanel = createHistoryControlPanel();
                        document.body.appendChild(controlPanel);
                        
                        // Show notification
                        GandalfUI.showNotification('YouTube Enhancer activated! 📺', {
                            type: 'success',
                            duration: 3000,
                            sound: false,
                            icon: '🎬'
                        });
                    }
                } else {
                    // Show notification for shorts hiding on other pages
                    if (hiddenShortsCount > 0) {
                        GandalfUI.showNotification(`Hidden ${hiddenShortsCount} Shorts sections 🚫`, {
                            type: 'info',
                            duration: 2000,
                            sound: false,
                            icon: '📱'
                        });
                    }
                }

                observeNewContent();
                clearInterval(waitForPage);
                gandalfSpeaks.log(CONFIG.MESSAGES.SUCCESS('initialized YouTube enhancements'));
            }
        }, CONFIG.INTERVALS.CHECK_ELEMENT);

        setTimeout(() => {
            clearInterval(waitForPage);
        }, CONFIG.INTERVALS.MAX_WAIT_TIME);
    }

    initializeYouTubeHandler();
}