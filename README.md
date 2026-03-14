# Banco de Alimentos - Chrome Extension

A Chrome/Brave extension that helps monitor product availability and manage cart operations.

## Features

- **Product Monitoring** — Automatically checks for new product availability every 60 seconds
- **Bulk Add to Cart** — Adds all configured products to the shopping cart in one click
- **Product Extraction** — Scrapes product info from the current page for easy configuration
- **Sound Alerts** — Persistent audio notifications when new products appear
- **Draggable UI Panel** — Floating control panel with activity log and status indicators

## Installation

1. Clone this repository
2. Open `chrome://extensions/` (or `brave://extensions/`)
3. Enable **Developer mode**
4. Click **Load unpacked** and select this folder

## Configuration

Edit `products.js` to customize which products to monitor and their quantities. Each product entry has:

- `id` — Product ID from the website
- `qty` — Quantity to add to cart (set to `0` to skip)
- `name` — Product display name
- `referrer` — Product page URL

The default quantity for all products is controlled by `BANCO_CONFIG.QTY` in the same file.

## License

GPL-3.0
