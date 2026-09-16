# Custom Shopify Starter Theme (Online Store 2.0)

A clean, modern, modular Shopify theme built using Shopify's **Online Store 2.0 (OS 2.0)** JSON template architecture and **Shopify Liquid**. 

This theme is ready to be uploaded directly into your Shopify dashboard as a `.zip` file.

---

## 🚀 How to Import into Your Shopify Dashboard

1. **Locate the theme zip file**:
   ```text
   C:\Users\user\.gemini\antigravity\scratch\shopify-custom-theme\shopify-custom-theme.zip
   ```
2. **Open Shopify Admin**:
   - Navigate to your Shopify Admin (`https://admin.shopify.com/store/YOUR-STORE-NAME`).
3. **Go to Themes**:
   - In the left sidebar, click **Online Store** > **Themes**.
4. **Upload the Zip**:
   - In the **Theme library** section, click **Add theme** > **Upload zip file**.
   - Browse to `shopify-custom-theme.zip` and select it.
   - Click **Upload file**.
5. **Preview & Customize**:
   - Once uploaded, click **Actions** > **Preview** to see your store live.
   - Click **Customize** to open the visual drag-and-drop Theme Editor where you can modify colors, logos, fonts, banner text, and section layouts.

---

## 📁 Project Structure

```
shopify-custom-theme/
├── assets/
│   ├── theme.css                  # Core CSS styles & variables
│   └── theme.js                   # Mobile navigation & variant selector scripts
├── config/
│   ├── settings_schema.json       # Visual theme customizer settings schema
│   └── settings_data.json         # Default theme setting values & presets
├── layout/
│   └── theme.liquid               # Global HTML wrapper (content_for_header & layout)
├── locales/
│   └── en.default.json            # English translations & UI text
├── sections/
│   ├── header.liquid              # Sticky header with navigation, logo, cart counter
│   ├── footer.liquid              # Multi-column footer with policies & copyright
│   ├── hero-banner.liquid         # Hero banner with image, heading, CTA
│   ├── featured-collection.liquid # Dynamic product grid with fallback cards
│   ├── rich-text.liquid           # Mission statement and brand content
│   ├── main-product.liquid        # Product details, variants, price & Add-to-Cart
│   ├── main-collection.liquid     # Collection catalog with pagination & sort
│   ├── main-cart.liquid           # Cart page with line items and checkout
│   ├── main-page.liquid           # Generic page template
│   ├── main-search.liquid         # Search results page
│   ├── main-list-collections.liquid # Collections catalog page
│   └── main-404.liquid            # 404 Not Found page
├── snippets/
│   ├── icon.liquid                # Crisp SVG icons (cart, search, menu, etc.)
│   ├── price.liquid               # Money formatting and sale badges
│   └── product-card.liquid        # Reusable product card component
├── templates/
│   ├── index.json                 # Homepage (OS 2.0 JSON)
│   ├── product.json               # Product page (OS 2.0 JSON)
│   ├── collection.json            # Collection page (OS 2.0 JSON)
│   ├── cart.json                  # Cart page (OS 2.0 JSON)
│   ├── page.json                  # Standard page (OS 2.0 JSON)
│   ├── search.json                # Search page (OS 2.0 JSON)
│   ├── list-collections.json      # Collections list (OS 2.0 JSON)
│   └── 404.json                   # 404 page (OS 2.0 JSON)
├── package-theme.ps1              # Automation script to package the theme to .zip
└── README.md
```

---

## 🛠 Re-packaging the Theme

Whenever you add new sections, modify styling, or add features, you can regenerate the zip file anytime by running:

```powershell
powershell -ExecutionPolicy Bypass -File .\package-theme.ps1
```
This produces an updated `shopify-custom-theme.zip` ready for re-uploading to Shopify.
