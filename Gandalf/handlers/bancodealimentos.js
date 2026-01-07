function bancodealimentosHandler() {

    // Global monitoring state variables
    let currentProductCount = 0;
    let maxProductCount = 0;
    let previousProductCount = 0;
    let monitoringInterval = null;
    let isMonitoring = false;
    let soundInterval = null;
    let isAlerting = false;
    let isFirstCheck = true;

    // UI state variables
    let controlPanel = null;
    let isUIVisible = false;

    gandalfSpeaks.log(CONFIG.MESSAGES.HANDLER_INIT('Banco de Alimentos'));

    // Use the products from the separate products.js file
    const products = BANCO_PRODUCTS;

    // =============================
    // HELPER FUNCTIONS
    // =============================

    // Helper function to get active products (qty > 0)
    function getActiveProducts() {
        return BANCO_PRODUCTS.filter(product => product.qty > 0);
    }

    // Helper function to get inactive products (qty = 0)
    function getInactiveProducts() {
        return BANCO_PRODUCTS.filter(product => product.qty === 0);
    }

    // Helper function to find product by ID
    function findProductById(id) {
        return BANCO_PRODUCTS.find(product => product.id === id);
    }

    // Helper function to update product quantity
    function updateProductQuantity(id, newQuantity) {
        const product = findProductById(id);
        if (product) {
            product.qty = newQuantity;
            return true;
        }
        return false;
    }

    /**
     * Fetches the shop page and extracts the current product count
     * @returns {Promise<number>} Current number of products available
     */
    async function fetchProductCount() {
        const response = await fetch(`${BANCO_CONFIG.SHOP_URL}`, {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "max-age=0",
                "priority": "u=0, i",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "sec-gpc": "1",
                "upgrade-insecure-requests": "1"
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const productCountElement = doc.querySelector('.total_product span.align-middle');
        return productCountElement ? parseInt(productCountElement.textContent.trim()) || 0 : 0;
    }

    // =============================
    // UI FUNCTIONS
    // =============================

    /**
     * Updates all UI status indicators with current values
     */
    function updateUI() {
        if (!controlPanel || !isUIVisible) return;

        const monitoringStatus = document.getElementById('monitoring-status');
        const currentCount = document.getElementById('current-count');
        const maxCount = document.getElementById('max-count');
        const alertStatus = document.getElementById('alert-status');

        if (monitoringStatus) {
            monitoringStatus.textContent = isMonitoring ? 'Activo ✅' : 'Inactivo ❌';
            monitoringStatus.style.color = isMonitoring ? '#28a745' : '#dc3545';
        }

        if (currentCount) currentCount.textContent = currentProductCount;
        if (maxCount) maxCount.textContent = maxProductCount;

        if (alertStatus) {
            alertStatus.textContent = isAlerting ? 'Activas 🔔' : 'Inactivas 🔕';
            alertStatus.style.color = isAlerting ? '#ffc107' : '#6c757d';
        }
    }

    /**
     * Creates and displays the main UI interface using enhanced GandalfUI
     */
    function createUI() {
        // Set the Banco de Alimentos theme
        GandalfUI.setTheme('bancoAlimentos');

        // Create the advanced panel
        controlPanel = GandalfUI.createAdvancedPanel({
            title: 'Banco de Alimentos',
            icon: '🛒',
            position: { top: '20px', right: '20px' },
            width: '350px',
            maxHeight: '600px'
        });

        // Add status section
        controlPanel.addStatusSection({
            title: '📊 Estado del Sistema',
            backgroundColor: '#e8f4fd',
            borderColor: '#b3d9f0',
            items: [
                { icon: '🔍', label: 'Monitoreo', id: 'monitoring-status', value: 'Inactivo ❌' },
                { icon: '📦', label: 'Productos actuales', id: 'current-count', value: '0' },
                { icon: '📈', label: 'Máximo visto', id: 'max-count', value: '0' },
                { icon: '🔔', label: 'Alertas', id: 'alert-status', value: 'Inactivas 🔕' }
            ]
        });

        // Add button grid
        controlPanel.addButtonGrid({
            columns: 2,
            gap: '10px',
            buttons: [
                {
                    text: 'Iniciar Monitoreo',
                    icon: '▶️',
                    color: '#007bff',
                    onClick: () => executeAction('startProductMonitoring')
                },
                {
                    text: 'Detener Monitoreo',
                    icon: '⏹️',
                    color: '#dc3545',
                    onClick: () => executeAction('stopProductMonitoring')
                },
                {
                    text: 'Verificar Una Vez',
                    icon: '🔍',
                    color: '#ffc107',
                    onClick: () => executeAction('checkForNewProducts')
                },
                {
                    text: 'Agregar al Carrito',
                    icon: '🛒',
                    color: '#28a745',
                    onClick: () => executeAction('addProductsToCart')
                },
                {
                    text: 'Parar Alertas',
                    icon: '🔇',
                    color: '#fd7e14',
                    onClick: () => executeAction('stopAlert')
                },
                {
                    text: 'Extraer Productos',
                    icon: '📋',
                    color: '#6f42c1',
                    onClick: () => executeAction('extractProducts')
                }
            ]
        });

        // Add activity log
        controlPanel.addActivityLog({
            title: '📝 Registro de Actividad',
            maxEntries: 50,
            height: '200px'
        });

        // Append to body and set visibility
        document.body.appendChild(controlPanel);
        isUIVisible = true;

        // Set up close handler
        controlPanel.onClose = () => {
            isUIVisible = false;
            controlPanel = null;
            // Stop monitoring if active
            if (isMonitoring) {
                stopProductMonitoring();
            }
            gandalfSpeaks.log('🙈 Panel cerrado por el usuario');
        };

        updateUI();
        controlPanel.log('🎉 Interfaz de usuario creada exitosamente');

        return controlPanel;
    }

    /**
     * Executes the specified action based on button clicks
     * @param {string} actionName - Name of the action to execute
     */
    function executeAction(actionName) {
        controlPanel.log(`🎯 Ejecutando: ${actionName}`);

        switch (actionName) {
            case 'startProductMonitoring':
                startProductMonitoring();
                break;
            case 'stopProductMonitoring':
                stopProductMonitoring();
                break;
            case 'checkForNewProducts':
                checkForNewProducts();
                break;
            case 'addProductsToCart':
                addProductsToCart();
                break;
            case 'extractProducts':
                extractProducts();
                break;
            case 'stopAlert':
                stopAlert();
                break;
            default:
                controlPanel.log(`❌ Acción desconocida: ${actionName}`);
        }

        setTimeout(updateUI, 100);
    }

    // =============================
    // CORE FUNCTIONS
    // =============================

    /**
      * Extracts product information from the current page's DOM
      * @returns {Array} Array of product objects found on the page
      */
    function extractProductsFromPage() {
        const extractedProducts = [];
        const productElements = document.querySelectorAll('.oe_product_cart');

        productElements.forEach(product => {
            try {
                const wishlistButton = product.querySelector('[data-product-product-id]');
                const productId = wishlistButton ? parseInt(wishlistButton.getAttribute('data-product-product-id')) : null;

                const titleLink = product.querySelector('.o_wsale_products_item_title a');
                const productName = titleLink ? titleLink.textContent.trim() : 'Unknown Product';
                const referrerUrl = titleLink ? titleLink.href : '';

                let referrerPath = '';
                if (referrerUrl) {
                    try {
                        const url = new URL(referrerUrl);
                        referrerPath = url.pathname + url.search;
                    } catch (e) {
                        referrerPath = referrerUrl;
                    }
                }

                if (productId) {
                    extractedProducts.push({
                        id: productId,
                        name: productName,
                        referrer: `${BANCO_CONFIG.SHOP_URL}${referrerPath}`,
                        referrerPath: `${referrerPath}`
                    });
                }
            } catch (error) {
                gandalfSpeaks.log('Error processing product:', error);
            }
        });

        return extractedProducts;
    }

    /**
     * Main function to extract products from current page and merge with global array
     */
    function extractProducts() {
        controlPanel.log('🔍 Extrayendo productos de la página actual...');

        const extractedProducts = extractProductsFromPage();

        if (extractedProducts.length === 0) {
            controlPanel.log('❌ No se encontraron productos en esta página');
            return;
        }

        controlPanel.log(`🔍 Encontrados ${extractedProducts.length} productos en esta página`);

        const existingIds = new Set(products.map(p => p.id));
        const newProducts = extractedProducts.filter(product => !existingIds.has(product.id));

        if (newProducts.length === 0) {
            controlPanel.log('ℹ️ Todos los productos ya están en el array global');
            return;
        }

        controlPanel.log(`✅ Encontrados ${newProducts.length} productos nuevos:`);
        // Log only the new products
        newProducts.forEach(product => {
            controlPanel.log(`📦 ID: ${product.id} - Name: ${product.name}`);
        });
        const jsonLines = newProducts.map(product =>
            `{ id: ${product.id}, qty: BANCO_CONFIG.QTY, name: '${product.name.replace(/'/g, "\\'")}', referrer: \`\${BANCO_CONFIG.SHOP_URL}${product.referrerPath}\` },`
        );
        gandalfSpeaks.log('New products for copy-paste: \n ', jsonLines.join('\n'));
    }

    /**
     * Adds all configured products to the shopping cart
     */
    async function addProductsToCart() {
        controlPanel.log(`🛒 Iniciando agregado de ${products.length} productos al carrito...`);

        const activeProducts = products.filter(p => p.qty > 0);
        controlPanel.log(`📦 Productos activos a agregar: ${activeProducts.length}`);

        for (let i = 0; i < activeProducts.length; i++) {
            const product = activeProducts[i];

            try {
                controlPanel.log(`➕ Agregando: ${product.name} (ID: ${product.id}, Qty: ${product.qty})`);

                const response = await fetch(`${BANCO_CONFIG.SERVER_URL}/shop/cart/update_json`, {
                    "headers": {
                        "accept": "*/*",
                        "content-type": "application/json",
                    },
                    "referrer": product.referrer || BANCO_CONFIG.SHOP_URL,
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": JSON.stringify({
                        "id": Math.floor(Math.random() * 100) + 1,
                        "jsonrpc": "2.0",
                        "method": "call",
                        "params": {
                            "product_id": product.id,
                            "product_custom_attribute_values": "[]",
                            "variant_values": [],
                            "no_variant_attribute_values": "[]",
                            "add_qty": product.qty,
                            "display": false,
                            "force_create": true
                        }
                    }),
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                });

                if (response.ok) {
                    controlPanel.log(`✅ Agregado exitosamente: ${product.name}`);
                } else {
                    controlPanel.log(`❌ Error al agregar: ${product.name} (${response.status})`);
                }

                if (i < activeProducts.length - 1) {
                    const delay = Math.random() * 500 + 200; // 200-700ms delay
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

            } catch (error) {
                controlPanel.log(`❌ Error al agregar ${product.name}: ${error.message}`);
            }
        }

        controlPanel.log('🎉 Proceso de agregado completado');

        // Show success notification
        GandalfUI.showNotification(`🛒 ${activeProducts.length} productos agregados al carrito!`, {
            type: 'success',
            duration: 4000,
            icon: '🎉'
        });
    }

    /**
     * Starts persistent sound alerts when new products are detected
     * @param {string} message - Alert message to display and announce
     */
    function startPersistentAlert(message) {
        if (isAlerting) {
            controlPanel.log('⚠️ Las alertas ya están activas');
            return;
        }

        isAlerting = true;
        controlPanel.log('🚨 Iniciando alertas persistentes...');
        controlPanel.log(`🎯 ${message}`);

        // Play initial notification sound
        GandalfUI.playNotificationSound(800, 0.5, 0.3);

        // Show persistent notification
        GandalfUI.showNotification(message, {
            type: 'warning',
            duration: 8000,
            icon: '🚨'
        });

        soundInterval = setInterval(() => {
            if (isAlerting) {
                GandalfUI.playNotificationSound(1000, 0.3, 0.2);
                controlPanel.log(`🔔 ALERTA: ${message}`);
            }
        }, 5000);

        updateUI();
    }

    /**
      * Tests the alert system with a single sound notification
      */
    function testAlert() {
        controlPanel.log('🔔 Probando sistema de alertas...');

        // Play single notification sound
        GandalfUI.playNotificationSound(800, 0.5, 0.3);

        // Show test notification
        GandalfUI.showNotification('🔔 Test de alerta - Sistema funcionando correctamente', {
            type: 'info',
            duration: 3000,
            icon: '🔔'
        });

        controlPanel.log('✅ Test de alerta completado');
    }

    /**
     * Stops all persistent sound alerts
     */
    function stopAlert() {
        if (!isAlerting) {
            controlPanel.log('⚠️ No hay alertas activas');
            return;
        }

        clearInterval(soundInterval);
        soundInterval = null;
        isAlerting = false;

        controlPanel.log('🛑 Alertas persistentes detenidas');

        GandalfUI.showNotification('🔇 Alertas detenidas', {
            type: 'info',
            duration: 2000,
            icon: '🛑'
        });

        updateUI();
    }

    /**
     * Performs a one-time check for new products (manual verification)
     */
    async function checkForNewProducts() {
        try {
            const currentTime = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            controlPanel.log(`🔍 Verificación manual... Hora: ${currentTime}`);

            const newProductCount = await fetchProductCount();

            controlPanel.log(`📊 Actual: ${currentProductCount}, Máximo: ${maxProductCount}, Nuevo: ${newProductCount}`);

            if (newProductCount > currentProductCount) {
                const newProductsAdded = newProductCount - currentProductCount;

                currentProductCount = newProductCount;
                if (newProductCount > maxProductCount) {
                    maxProductCount = newProductCount;
                }

                const message = `🎉 ¡PRODUCTOS NUEVOS! ${newProductsAdded} producto(s) agregado(s). Total: ${newProductCount}`;
                controlPanel.log(message);
                startPersistentAlert(message);

            } else {
                currentProductCount = newProductCount;
                if (newProductCount > maxProductCount) {
                    maxProductCount = newProductCount;
                }

                if (newProductCount < previousProductCount) {
                    controlPanel.log(`📉 Productos disminuyeron a ${newProductCount}`);
                } else {
                    controlPanel.log(`✅ Sin cambios. Actual: ${newProductCount}, Máximo visto: ${maxProductCount}`);
                }
            }

            updateUI();

        } catch (error) {
            controlPanel.log(`❌ Error verificando productos: ${error.message}`);

            GandalfUI.showNotification(`❌ Error: ${error.message}`, {
                type: 'error',
                duration: 4000,
                icon: '⚠️'
            });
        }
    }

    /**
     * Starts automatic monitoring for new products every 60 seconds
     */
    async function startProductMonitoring() {
        if (isMonitoring) {
            controlPanel.log('⚠️ El monitoreo ya está activo');
            return;
        }

        controlPanel.log('🔄 Obteniendo conteo inicial de productos...');

        try {
            const freshProductCount = await fetchProductCount();

            // Set initial values without triggering alerts
            currentProductCount = freshProductCount;
            previousProductCount = freshProductCount;
            maxProductCount = freshProductCount;
            isFirstCheck = true;

            controlPanel.log(`🚀 Monitoreo iniciado. Productos base: ${currentProductCount}`);
            controlPanel.log('🔔 Verificará cada 60 segundos automáticamente...');

            isMonitoring = true;
            monitoringInterval = setInterval(async () => {
                try {
                    const newProductCount = await fetchProductCount();

                    // Only trigger alerts if this is NOT the first check and products increased
                    if (!isFirstCheck && newProductCount > currentProductCount) {
                        const newProductsAdded = newProductCount - currentProductCount;

                        previousProductCount = currentProductCount;
                        currentProductCount = newProductCount;
                        if (newProductCount > maxProductCount) {
                            maxProductCount = newProductCount;
                        }

                        const message = `🎉 ¡PRODUCTOS NUEVOS! ${newProductsAdded} producto(s) agregado(s). Total: ${newProductCount}`;
                        controlPanel.log(message);
                        startPersistentAlert(message);
                    } else {
                        // Update counts but don't trigger alerts
                        previousProductCount = currentProductCount;
                        currentProductCount = newProductCount;
                        if (newProductCount > maxProductCount) {
                            maxProductCount = newProductCount;
                        }

                        if (isFirstCheck) {
                            controlPanel.log(`✅ Primera verificación automática completada. Base: ${newProductCount}`);
                            isFirstCheck = false;
                        } else {
                            controlPanel.log(`✅ Verificación: ${newProductCount} productos (sin cambios)`);
                        }
                    }

                    updateUI();
                } catch (error) {
                    controlPanel.log(`❌ Error en monitoreo automático: ${error.message}`);
                }
            }, 60000);

            controlPanel.log('✅ ¡Monitoreo automático iniciado!');
            updateUI();

            GandalfUI.showNotification('🚀 Monitoreo iniciado exitosamente', {
                type: 'success',
                duration: 3000,
                icon: '🔄'
            });

        } catch (error) {
            controlPanel.log(`❌ Error al obtener conteo inicial: ${error.message}`);
            controlPanel.log('❌ No se pudo iniciar el monitoreo');

            GandalfUI.showNotification(`❌ Error iniciando monitoreo: ${error.message}`, {
                type: 'error',
                duration: 4000,
                icon: '⚠️'
            });
        }
    }

    /**
     * Stops automatic product monitoring
     */
    function stopProductMonitoring() {
        if (!isMonitoring) {
            controlPanel.log('⚠️ El monitoreo no está activo');
            return;
        }

        clearInterval(monitoringInterval);
        monitoringInterval = null;
        isMonitoring = false;
        isFirstCheck = true;

        if (isAlerting) {
            stopAlert();
        }

        controlPanel.log('🛑 Monitoreo automático detenido');
        updateUI();

        GandalfUI.showNotification('🛑 Monitoreo detenido', {
            type: 'info',
            duration: 2000,
            icon: '⏹️'
        });
    }

    /**
     * Returns the current monitoring status information
     * @returns {string} Formatted status string
     */
    function getMonitoringStatus() {
        const status = `📊 Estado del Monitoreo:
  - Activo: ${isMonitoring ? 'Sí' : 'No'}
  - Productos actuales: ${currentProductCount}
  - Máximo visto: ${maxProductCount}
  - Intervalo: ${monitoringInterval ? '60 segundos' : 'No configurado'}
  - Alertas activas: ${isAlerting ? 'Sí' : 'No'}
  - Intervalo de sonido: ${soundInterval ? '5 segundos' : 'No configurado'}`;

        gandalfSpeaks.log(status);
        controlPanel.log('📊 Estado del monitoreo consultado');
        return status;
    }

    // =============================
    // PAGE DETECTION AND INITIALIZATION
    // =============================

    /**
     * Detects the current page type
     * @returns {string} The type of page we're on
     */
    function getCurrentPageType() {
        const url = window.location.href;
        if (url.includes('/shop/cart')) return 'cart';
        if (url.includes('/shop/checkout')) return 'checkout';
        if (url.includes('/shop/product/')) return 'product';
        if (url.includes('/shop')) return 'shop';
        if (url.includes('/web/login')) return 'login';
        return 'other';
    }

    /**
     * Initialize the Banco de Alimentos handler
     */
    function initializeBancoDeAlimentosHandler() {
        const pageType = getCurrentPageType();

        controlPanel = createUI();
        controlPanel.log(`🏪 Página detectada: ${pageType}`);
        controlPanel.log(`🔧 Total de productos configurados: ${products.length}`);
        controlPanel.log(`📦 Productos activos (qty > 0): ${products.filter(p => p.qty > 0).length}`);

        // Show welcome notification
        GandalfUI.showNotification('🛒 Banco de Alimentos Assistant Ready!', {
            type: 'success',
            duration: 4000,
            sound: true,
            icon: '🎉'
        });

        // Auto-start monitoring if on shop pages
        if (pageType === 'shop') {
            controlPanel.log('🏪 En página de tienda - listo para monitorear');

            // Optional: Auto-start monitoring (uncomment if desired)
            // setTimeout(() => {
            //     controlPanel.log('🚀 Auto-iniciando monitoreo...');
            //     startProductMonitoring();
            // }, 2000);
        }

        // Global functions for console access
        window.bancoAlimentosHelper = {
            startMonitoring: startProductMonitoring,
            stopMonitoring: stopProductMonitoring,
            checkProducts: checkForNewProducts,
            addToCart: addProductsToCart,
            extractProducts: extractProducts,
            stopAlerts: stopAlert,
            getStatus: getMonitoringStatus,
            showUI: () => {
                if (!isUIVisible) {
                    createUI();
                }
            },
            hideUI: () => {
                if (controlPanel) {
                    controlPanel.remove();
                    controlPanel = null;
                    isUIVisible = false;
                }
            }
        };

        gandalfSpeaks.log(`
            🛒 BANCO DE ALIMENTOS ASSISTANT LOADED:
            ✅ Enhanced UI created with GandalfUI!
            ✅ ${products.length} products configured
            ✅ ${products.filter(p => p.qty > 0).length} active products ready

            🔧 Available console functions:
            - bancoAlimentosHelper.startMonitoring() - Start automatic monitoring
            - bancoAlimentosHelper.stopMonitoring() - Stop monitoring
            - bancoAlimentosHelper.checkProducts() - Manual check for new products
            - bancoAlimentosHelper.addToCart() - Add products to cart
            - bancoAlimentosHelper.extractProducts() - Extract products from page
            - bancoAlimentosHelper.stopAlerts() - Stop sound alerts
            - bancoAlimentosHelper.getStatus() - Check monitoring status
            - bancoAlimentosHelper.showUI() - Show UI panel
            - bancoAlimentosHelper.hideUI() - Hide UI panel

            🎯 Current page: ${pageType}
            🎉 Ready to use! Click buttons in the UI panel.
        `);
    }

    // =============================
    // AUTO-INITIALIZATION
    // =============================

    // Wait for page to be ready then initialize
    const waitForPageReady = setInterval(() => {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            clearInterval(waitForPageReady);

            setTimeout(() => {
                initializeBancoDeAlimentosHandler();
            }, 1000); // Small delay to ensure everything is loaded
        }
    }, 100);

    // Fallback initialization after 5 seconds
    setTimeout(() => {
        clearInterval(waitForPageReady);
        if (!controlPanel) {
            initializeBancoDeAlimentosHandler();
        }
    }, 5000);
}