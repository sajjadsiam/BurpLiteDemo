# 🎨 BurpLite Icons

## Quick Fix - Extension Now Loads Without Icons!

The extension will now load successfully **without icons**. Chrome will use a default icon.

## Optional: Create Custom Icons

If you want custom BurpLite icons:

### Option 1: Use the Icon Generator (Easiest)

1. **Open the generator:**
   - Double-click `CREATE_ICONS.html` in this folder
   - Opens in your browser

2. **Download icons:**
   - Click "💾 Download All Icons" button
   - Saves 3 files automatically: icon16.png, icon48.png, icon128.png

3. **Save to icons folder:**
   - Move all 3 PNG files to this `icons` folder
   - Should be: `D:\burpextention\icons\icon16.png` (etc.)

4. **Update manifest:**
   - Edit `manifest.json` in parent folder
   - Add this section after `"default_title"`:
   ```json
   "action": {
     "default_popup": "popup.html",
     "default_title": "BurpLite Security Tools",
     "default_icon": {
       "16": "icons/icon16.png",
       "48": "icons/icon48.png",
       "128": "icons/icon128.png"
     }
   },
   "icons": {
     "16": "icons/icon16.png",
     "48": "icons/icon48.png",
     "128": "icons/icon128.png"
   }
   ```

5. **Reload extension:**
   - Go to `chrome://extensions/`
   - Click reload button on BurpLite card
   - ✅ Icons appear!

### Option 2: Create Your Own Icons

Create 3 PNG files with these specifications:

- **icon16.png** - 16x16 pixels (toolbar)
- **icon48.png** - 48x48 pixels (extension page)
- **icon128.png** - 128x128 pixels (Chrome Web Store)

**Recommended design:**
- Purple/blue gradient background (#667eea to #764ba2)
- White letter "B" in center
- Simple, clear, recognizable

**Tools you can use:**
- Photoshop / GIMP
- Figma / Canva
- Online icon generators
- CREATE_ICONS.html (in this folder)

### Option 3: Use Default Chrome Icon

Do nothing! The extension works perfectly without custom icons. Chrome will show a generic puzzle piece icon.

---

## Current Status

✅ **Extension loads successfully WITHOUT icons**
⏳ **Icons are optional - add them anytime later**

The manifest has been updated to not require icons, so the extension loads immediately.
