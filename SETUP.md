# ECRINLUX Shopify Theme Setup

## 1. Theme upload

1. Open the Shopify admin.
2. Go to Online Store > Themes.
3. Click Add theme > Upload zip file.
4. Upload the generated archive from this repository root:
   - `shopify-custom-theme.zip`
5. In the theme library, preview the uploaded theme and publish it when ready.

If you want to regenerate the archive locally:

```powershell
powershell -ExecutionPolicy Bypass -File .\package-theme.ps1
```

This project is a no-build Shopify theme. The zip is built directly from the theme files and can be uploaded without a custom build pipeline.

---

## 2. Recommended storefront setup in Shopify

### Required pages
- Home page
- Collection pages
- Product page
- Custom page: Sur mesure
- Blog and article pages
- Customer account pages
- Search and 404 pages

### Recommended navigation
- Accueil
- Atelier / Sur-mesure
- Collection
- Cadeaux / Boutique
- Blog
- Contact

### Theme editor configuration
In the theme editor, review the following settings:
- Brand palette: dark gallery, warm gold accents, off-white neutrals
- Typography: editorial serif headline + modern sans body
- Header and footer links
- Announcement bar text
- Primary/secondary buttons
- Product card style and hover behavior

---

## 3. Product catalog structure

This theme is designed for a premium, made-to-order, collector-focused catalog. Recommended product taxonomy:

- Collection: `Lego`
- Collection: `Funko`
- Collection: `À la carte`
- Collection: `Sur-mesure`

Use the following product logic for the most predictable storefront behavior:

- Keep one main product image and 2–4 supplementary gallery images.
- Add a short product description focused on material, finish, and production details.
- Use Shopify product variants for size or finish options where relevant.
- Add a product tag for `custom` when it should route through the bespoke configurator.

---

## 4. Customization / bespoke configurator setup

The bespoke configurator is built on the page template assigned to `/pages/sur-mesure`.

### Required page content
Create a page with the following values:
- Title: `Sur mesure`
- Handle: `sur-mesure`
- Template: `page.sur-mesure`

The builder uses local state plus URL query parameters so a user can keep the configuration and share it. The expected state includes:
- object name
- width / depth / height
- panel color choices
- engraving text
- add-on flags such as LED, raised base, rotating base

---

## 5. Recommended metafields and content model

Add these Shopify metafields to support the premium product experience:

### Product metafields
- `materials` (text, multi-line): material story or finish notes
- `craft_origin` (text): France / atelier / handmade wording
- `full_description` (rich text): expanded product story
- `featured_note` (text): micro-copy for product card or PDP
- `customizable` (boolean): marks product as eligible for customization

### Collection metafields
- `collection_story` (rich text): editorial intro for collection pages
- `collection_badge` (text): short premium label

### Page metafields
- `hero_tagline` (text): headline microcopy for editorial pages
- `atelier_note` (rich text): custom support content for atelier pages

---

## 6. Store content workflow

Use this publication order to keep the storefront coherent:

1. Upload the theme and set brand defaults.
2. Create the core pages and navigation.
3. Create the collection structure and assign the correct JSON templates.
4. Upload product data and ensure variants are correctly mapped.
5. Test the custom page and product cards.
6. Publish to the live theme after QA.

---

## 7. QA checklist before launch

Before publishing, verify:

- Theme uploads successfully without build step.
- Home page renders with all sections visible.
- Product cards, collection grids, and detail pages are styled correctly.
- Header, footer, and mobile navigation work on smaller screens.
- Sur-mesure page loads and the step flow still works.
- Shareable configuration links and saved state persist correctly.
- All JSON templates validate and there are no syntax issues.

---

## 8. Notes for future editing

This theme is intentionally structured as a modular Online Store 2.0 theme:
- `sections/` holds page sections.
- `templates/` defines the storefront JSON template map.
- `config/settings_schema.json` is the place to tune the luxury visual system.
- `assets/theme.css` holds the brand styling system.
- `assets/theme.js` is the interaction layer for navigation and configurator logic.

If a new feature is added, regenerate the zip and re-upload it to Shopify before publishing.
