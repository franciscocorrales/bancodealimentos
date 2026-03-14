// =============================================================================
// ENHANCED UI SYSTEM - Professional floating UI components
// =============================================================================

const BancoUI = {
    // Advanced styling system with modern aesthetics
    themes: {
        bancoAlimentos: {
            primary: '#2c5aa0',
            primaryDark: '#1e3d72',
            secondary: '#007bff',
            success: '#28a745',
            warning: '#ffc107',
            danger: '#dc3545',
            info: '#17a2b8',
            light: '#f8f9fa',
            dark: '#343a40',
            background: 'linear-gradient(145deg, #f0f4f8, #d6e9f0)',
            glass: 'rgba(255, 255, 255, 0.1)',
            shadow: '0 8px 32px rgba(44, 90, 160, 0.3)',
            borderRadius: '15px',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }
    },

    // Active theme
    currentTheme: 'bancoAlimentos',

    // Base styles for all UI elements
    getBaseStyles() {
        const theme = this.themes[this.currentTheme];
        return {
            fontFamily: theme.fontFamily,
            fontSize: '14px',
            fontWeight: '500',
            borderRadius: theme.borderRadius,
            transition: 'all 0.3s ease',
            boxShadow: theme.shadow,
            zIndex: '10000'
        };
    },

    // Utility function to adjust color brightness
    adjustColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    },

    // Set theme for all new UI elements
    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            bancoLog.log(`🎨 UI theme set to: ${themeName}`);
        } else {
            bancoLog.warn(`⚠️ Theme "${themeName}" not found. Available themes:`, Object.keys(this.themes));
        }
    },

    // Enhanced dragging system
    makeDraggable(element, handle) {
        let isDragging = false;
        let hasStartedDrag = false;
        let dragThreshold = 10;
        let startX = 0;
        let startY = 0;
        let offsetX = 0;
        let offsetY = 0;

        element.dataset.wasDragged = 'false';

        handle.addEventListener('mousedown', (e) => {
            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            startX = e.clientX;
            startY = e.clientY;
            hasStartedDrag = false;
            isDragging = true;
            element.dataset.wasDragged = 'false';
            e.preventDefault();

            const onMouseMove = (e) => {
                if (!isDragging) return;
                e.preventDefault();

                const deltaX = Math.abs(e.clientX - startX);
                const deltaY = Math.abs(e.clientY - startY);

                if (!hasStartedDrag && (deltaX > dragThreshold || deltaY > dragThreshold)) {
                    hasStartedDrag = true;
                    element.dataset.wasDragged = 'true';
                    handle.style.cursor = 'grabbing';
                    element.style.transform = 'none';
                    element.style.boxShadow = this.getBaseStyles().boxShadow;
                }

                if (hasStartedDrag) {
                    let newX = e.clientX - offsetX;
                    let newY = e.clientY - offsetY;

                    const elementRect = element.getBoundingClientRect();
                    const maxX = window.innerWidth - elementRect.width;
                    const maxY = window.innerHeight - elementRect.height;

                    newX = Math.max(0, Math.min(newX, maxX));
                    newY = Math.max(0, Math.min(newY, maxY));

                    element.style.left = newX + 'px';
                    element.style.top = newY + 'px';
                    element.style.right = 'auto';
                    element.style.bottom = 'auto';
                }
            };

            const onMouseUp = () => {
                isDragging = false;
                handle.style.cursor = 'move';

                if (!hasStartedDrag) {
                    element.dataset.wasDragged = 'false';
                } else {
                    setTimeout(() => {
                        element.dataset.wasDragged = 'false';
                    }, 100);
                }

                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    },

    // Advanced panel creation with multiple sections and features
    createAdvancedPanel(options = {}) {
        const theme = this.themes[this.currentTheme];
        const {
            title = 'Panel',
            position = { top: '20px', right: '20px' },
            width = '350px',
            maxHeight = '2000px',
            draggable = true,
            minimizable = true,
            closable = true,
            resizable = true,
            icon = '🧙‍♂️',
            theme: customTheme = null
        } = options;

        // Use custom theme if provided
        const activeTheme = customTheme || theme;

        const panel = document.createElement('div');
        panel.className = 'banco-advanced-panel';

        Object.assign(panel.style, {
            position: 'fixed',
            top: position.top,
            right: position.right,
            width: width,
            background: activeTheme.background,
            border: `2px solid ${activeTheme.primary}`,
            borderRadius: activeTheme.borderRadius,
            boxShadow: activeTheme.shadow,
            fontFamily: activeTheme.fontFamily,
            zIndex: '10000',
            backdropFilter: 'blur(10px)',
            padding: '0',
            overflow: 'hidden',
            maxHeight: maxHeight,
            resize: resizable ? 'both' : 'none',
            minWidth: '300px',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column'
        });

        // Create enhanced header with gradient
        const header = document.createElement('div');
        header.className = 'banco-panel-header';
        header.style.cssText = `
            background: linear-gradient(135deg, ${activeTheme.primary}, ${activeTheme.primaryDark});
            color: white;
            padding: 15px 20px;
            font-size: 16px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: ${draggable ? 'move' : 'default'};
            user-select: none;
        `;

        // Create header content
        const headerTitle = document.createElement('span');
        headerTitle.textContent = `${icon} ${title}`;

        const headerControls = document.createElement('div');
        headerControls.style.cssText = 'display: flex; gap: 5px;';

        // Minimize button
        if (minimizable) {
            const minimizeBtn = document.createElement('button');
            minimizeBtn.id = `minimize-btn-${Date.now()}`;
            minimizeBtn.textContent = '−';
            minimizeBtn.style.cssText = `
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 2px 6px;
                border-radius: 4px;
                transition: background 0.2s ease;
            `;
            minimizeBtn.addEventListener('mouseenter', () => {
                minimizeBtn.style.background = 'rgba(255,255,255,0.2)';
            });
            minimizeBtn.addEventListener('mouseleave', () => {
                minimizeBtn.style.background = 'none';
            });
            headerControls.appendChild(minimizeBtn);
        }

        // Close button
        if (closable) {
            const closeBtn = document.createElement('button');
            closeBtn.id = `close-btn-${Date.now()}`;
            closeBtn.textContent = '×';
            closeBtn.style.cssText = `
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 2px 6px;
                border-radius: 4px;
                transition: background 0.2s ease;
            `;
            closeBtn.addEventListener('mouseenter', () => {
                closeBtn.style.background = 'rgba(255,0,0,0.3)';
            });
            closeBtn.addEventListener('mouseleave', () => {
                closeBtn.style.background = 'none';
            });
            headerControls.appendChild(closeBtn);
        }

        header.appendChild(headerTitle);
        header.appendChild(headerControls);

        // Create main content container
        const content = document.createElement('div');
        content.id = `panel-content-${Date.now()}`;
        content.className = 'banco-panel-content';
        content.style.cssText = `
            padding: 20px;
            overflow-y: auto;
            flex: 1;
            transition: all 0.3s ease;
            box-sizing: border-box;
        `;

        panel.appendChild(header);
        panel.appendChild(content);

        // Add resize handle if resizable
        if (resizable) {
            const resizeHandle = document.createElement('div');
            resizeHandle.className = 'banco-resize-handle';
            resizeHandle.style.cssText = `
                position: absolute;
                bottom: 0;
                right: 0;
                width: 20px;
                height: 20px;
                background: linear-gradient(-45deg, transparent 0%, transparent 30%, ${activeTheme.primary} 30%, ${activeTheme.primary} 70%, transparent 70%);
                cursor: nw-resize;
                border-bottom-right-radius: ${activeTheme.borderRadius};
                opacity: 0.6;
                transition: opacity 0.2s ease;
            `;
            
            resizeHandle.addEventListener('mouseenter', () => {
                resizeHandle.style.opacity = '1';
            });
            
            resizeHandle.addEventListener('mouseleave', () => {
                resizeHandle.style.opacity = '0.6';
            });
            
            panel.appendChild(resizeHandle);
        }

        // Add dragging functionality
        if (draggable) {
            this.makeDraggable(panel, header);
        }

        // Minimize functionality
        if (minimizable) {
            const minimizeBtn = headerControls.querySelector('button:first-child');
            if (minimizeBtn) {
                let isMinimized = false;
                let originalHeight = null;
                
                minimizeBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent dragging when clicking minimize

                    if (isMinimized) {
                        // Expand
                        content.style.display = 'block';
                        content.style.flex = '1';
                        content.style.padding = '20px';
                        if (originalHeight) {
                            panel.style.height = originalHeight;
                        } else {
                            panel.style.height = 'auto';
                        }
                        panel.style.maxHeight = maxHeight;
                        panel.style.minHeight = '200px';
                        minimizeBtn.textContent = '−';
                    } else {
                        // Store current height before collapsing
                        originalHeight = panel.style.height || 'auto';
                        
                        // Collapse
                        content.style.display = 'none';
                        content.style.flex = '0';
                        content.style.padding = '0';
                        panel.style.height = 'auto';
                        panel.style.maxHeight = 'none';
                        panel.style.minHeight = 'auto';
                        minimizeBtn.textContent = '+';
                    }
                    isMinimized = !isMinimized;
                });
            }
        }

        // Close functionality
        if (closable) {
            const closeBtn = headerControls.querySelector('button:last-child');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent dragging when clicking close
                    panel.remove();
                    if (panel.onClose) panel.onClose();
                });
            }
        }

        // Enhanced panel methods
        panel.addStatusSection = (statusConfig = {}) => {
            const {
                title = '📊 Status',
                items = [],
                backgroundColor = '#e8f4fd',
                borderColor = '#b3d9f0'
            } = statusConfig;

            const statusSection = document.createElement('div');
            statusSection.className = 'banco-status-section';
            statusSection.style.cssText = `
                background: ${backgroundColor};
                border: 1px solid ${borderColor};
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 15px;
            `;

            const statusTitle = document.createElement('h3');
            statusTitle.textContent = title;
            statusTitle.style.cssText = `
                margin: 0 0 10px 0;
                color: ${activeTheme.primary};
                font-size: 14px;
            `;

            const statusInfo = document.createElement('div');
            statusInfo.style.cssText = 'font-size: 12px; color: #333;';

            items.forEach(item => {
                const statusItem = document.createElement('div');
                statusItem.innerHTML = `${item.icon || '•'} ${item.label}: <span id="${item.id}" style="font-weight: bold;">${item.value || 'N/A'}</span>`;
                statusInfo.appendChild(statusItem);
            });

            statusSection.appendChild(statusTitle);
            statusSection.appendChild(statusInfo);
            content.appendChild(statusSection);

            return statusSection;
        };

        panel.addButtonGrid = (buttonsConfig = {}) => {
            const {
                columns = 2,
                gap = '10px',
                buttons = []
            } = buttonsConfig;

            const buttonGrid = document.createElement('div');
            buttonGrid.className = 'banco-button-grid';
            buttonGrid.style.cssText = `
                display: grid;
                grid-template-columns: repeat(${columns}, 1fr);
                gap: ${gap};
                margin-bottom: 15px;
            `;

            buttons.forEach(btn => {
                const button = this.createEnhancedButton({
                    ...btn,
                    theme: activeTheme
                });
                buttonGrid.appendChild(button);
            });

            content.appendChild(buttonGrid);
            return buttonGrid;
        };

        panel.addActivityLog = (logConfig = {}) => {
            const {
                title = '📝 Activity Log',
                maxEntries = 50,
                height = '200px',
                backgroundColor = '#f8f9fa',
                borderColor = '#dee2e6'
            } = logConfig;

            const logSection = document.createElement('div');
            logSection.className = 'banco-log-section';
            logSection.style.cssText = `
                background: ${backgroundColor};
                border: 1px solid ${borderColor};
                border-radius: 8px;
                padding: 10px;
                margin-bottom: 15px;
            `;

            const logTitle = document.createElement('h3');
            logTitle.textContent = title;
            logTitle.style.cssText = `
                margin: 0 0 10px 0;
                color: #495057;
                font-size: 14px;
            `;

            const logContainer = document.createElement('div');
            logContainer.id = `activity-log-${Date.now()}`;
            logContainer.className = 'banco-activity-log';
            logContainer.style.cssText = `
                font-size: 11px;
                color: #6c757d;
                font-family: monospace;
                max-height: ${height};
                overflow-y: auto;
                border: 1px solid #e9ecef;
                border-radius: 4px;
                padding: 8px 8px 12px 8px;
                background: white;
                box-sizing: border-box;
            `;

            // Initialize with welcome message
            const initialEntry = document.createElement('div');
            initialEntry.style.cssText = 'margin-bottom: 5px; padding: 3px 0; border-bottom: 1px solid #eee;';
            initialEntry.innerHTML = `<span style="color: ${activeTheme.secondary};">[${new Date().toLocaleTimeString()}]</span> Sistema iniciado...`;
            logContainer.appendChild(initialEntry);

            logSection.appendChild(logTitle);
            logSection.appendChild(logContainer);
            content.appendChild(logSection);

            // Add logging method to panel
            panel.log = (message) => {
                const timestamp = new Date().toLocaleTimeString();
                const logEntry = document.createElement('div');
                logEntry.style.cssText = 'margin-bottom: 5px; padding: 3px 0; border-bottom: 1px solid #eee;';
                logEntry.innerHTML = `<span style="color: ${activeTheme.secondary};">[${timestamp}]</span> ${message}`;

                logContainer.appendChild(logEntry);
                logContainer.scrollTop = logContainer.scrollHeight;

                // Keep only last maxEntries
                while (logContainer.children.length > maxEntries) {
                    logContainer.removeChild(logContainer.children[0]);
                }

                bancoLog.log(`[${timestamp}] ${message}`);
            };

            return logSection;
        };

        return panel;
    },

    // Enhanced button creation with gradients and animations
    createEnhancedButton(options = {}) {
        const theme = this.themes[this.currentTheme];
        const {
            text = 'Button',
            icon = '🧙‍♂️',
            color = theme.secondary,
            onClick = null,
            fullWidth = false,
            size = 'medium', // small, medium, large
            variant = 'filled', // filled, outline, text
            theme: customTheme = null
        } = options;

        const activeTheme = customTheme || theme;
        const hoverColor = this.adjustColor(color, -20);

        const sizeStyles = {
            small: { padding: '8px 12px', fontSize: '11px' },
            medium: { padding: '12px 16px', fontSize: '12px' },
            large: { padding: '16px 24px', fontSize: '14px' }
        };

        const variantStyles = {
            filled: {
                background: `linear-gradient(145deg, ${color}, ${hoverColor})`,
                color: 'white',
                border: 'none'
            },
            outline: {
                background: 'transparent',
                color: color,
                border: `2px solid ${color}`
            },
            text: {
                background: 'transparent',
                color: color,
                border: 'none'
            }
        };

        const button = document.createElement('button');
        button.innerHTML = `${icon} ${text}`;

        Object.assign(button.style, {
            ...variantStyles[variant],
            ...sizeStyles[size],
            width: fullWidth ? '100%' : 'auto',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            fontFamily: activeTheme.fontFamily,
            userSelect: 'none'
        });

        // Enhanced hover effects
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            
            if (variant === 'filled') {
                button.style.background = `linear-gradient(145deg, ${hoverColor}, ${this.adjustColor(color, -30)})`;
            } else if (variant === 'outline') {
                button.style.backgroundColor = color;
                button.style.color = 'white';
            } else if (variant === 'text') {
                button.style.backgroundColor = `${color}20`;
            }
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
            Object.assign(button.style, variantStyles[variant]);
        });

        if (onClick) {
            button.addEventListener('click', (e) => {
                if (!button.dataset.wasDragged || button.dataset.wasDragged === 'false') {
                    onClick(e);
                }
            });
        }

        // Helper methods
        button.updateText = (newText) => {
            button.innerHTML = `${icon} ${newText}`;
        };

        button.setLoading = (isLoading) => {
            if (isLoading) {
                button.disabled = true;
                button.innerHTML = `⏳ Loading...`;
                button.style.opacity = '0.7';
            } else {
                button.disabled = false;
                button.innerHTML = `${icon} ${text}`;
                button.style.opacity = '1';
            }
        };

        return button;
    },

    // Sound notification system
    playNotificationSound(frequency = 800, duration = 0.5, volume = 0.3) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (error) {
            bancoLog.warn('🔇 Could not play notification sound:', error.message);
        }
    },

    // Enhanced notification system
    showNotification(message, options = {}) {
        const theme = this.themes[this.currentTheme];
        const {
            duration = 3000,
            type = 'info', // success, warning, error, info
            position = 'top-right', // top-left, top-right, bottom-left, bottom-right
            sound = false,
            icon = '🧙‍♂️'
        } = options;

        const typeColors = {
            success: theme.success,
            warning: theme.warning,
            error: theme.danger,
            info: theme.info
        };

        const positions = {
            'top-right': { top: '20px', right: '20px' },
            'top-left': { top: '20px', left: '20px' },
            'bottom-right': { bottom: '20px', right: '20px' },
            'bottom-left': { bottom: '20px', left: '20px' }
        };

        const notification = document.createElement('div');
        notification.innerHTML = `${icon} ${message}`;

        Object.assign(notification.style, this.getBaseStyles(), {
            position: 'fixed',
            ...positions[position],
            background: `linear-gradient(145deg, ${typeColors[type]}, ${this.adjustColor(typeColors[type], -20)})`,
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            maxWidth: '300px',
            wordWrap: 'break-word',
            transform: 'translateX(100%)',
            opacity: '0'
        });

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);

        // Play sound if requested
        if (sound) {
            this.playNotificationSound();
        }

        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    },

    // Utility to create status indicators
    createStatusIndicator(options = {}) {
        const {
            text = 'Status',
            status = 'inactive', // active, inactive, warning, error
            size = 'small' // small, medium, large
        } = options;

        const statusColors = {
            active: '#28a745',
            inactive: '#6c757d',
            warning: '#ffc107',
            error: '#dc3545'
        };

        const statusIcons = {
            active: '✅',
            inactive: '❌',
            warning: '⚠️',
            error: '🔴'
        };

        const sizes = {
            small: '8px',
            medium: '10px',
            large: '12px'
        };

        const indicator = document.createElement('span');
        indicator.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 5px;
            font-size: ${sizes[size]};
            color: ${statusColors[status]};
            font-weight: bold;
        `;
        indicator.innerHTML = `${statusIcons[status]} ${text}`;

        indicator.updateStatus = (newStatus, newText = text) => {
            indicator.style.color = statusColors[newStatus];
            indicator.innerHTML = `${statusIcons[newStatus]} ${newText}`;
        };

        return indicator;
    },

    // Legacy compatibility methods (simplified versions)
    createButton(options = {}) {
        return this.createEnhancedButton({
            ...options,
            variant: 'filled',
            size: 'medium'
        });
    },

    createPanel(options = {}) {
        return this.createAdvancedPanel({
            ...options,
            minimizable: true,
            closable: true
        });
    }
};