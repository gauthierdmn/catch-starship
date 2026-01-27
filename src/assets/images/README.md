# Starship Asset

The game currently uses a simple SVG representation of SpaceX's Starship booster (`starship.svg`).

## Using a More Realistic Image

To use a more realistic Starship image:

### Option 1: Use a Real Photo/Render

1. **Find a good Starship image**:
   - Search for "SpaceX Starship booster transparent PNG" or "Starship rocket side view PNG"
   - Recommended sources:
     - [Wikimedia Commons](<https://commons.wikimedia.org/wiki/Category:Starship_(spacecraft)>)
     - [SpaceX Flickr](https://www.flickr.com/photos/spacex/)
     - Free stock photo sites with CC0 licenses

2. **Image requirements**:
   - Side view of the Starship booster (vertical orientation)
   - Transparent background (PNG format preferred)
   - Recommended dimensions: 40px width × 120px height (or maintain similar aspect ratio)
   - Should show the grid fins and engine section

3. **Replace the file**:
   - Save your image as `starship.png` in this directory
   - Update `PreloadScene.js` to load PNG instead of SVG:
     ```javascript
     this.load.image('starship', require('../assets/images/starship.png'));
     ```

### Option 2: Create Your Own

You can create your own Starship sprite using:

- Photoshop/GIMP
- Inkscape (for vector graphics)
- Blender (for 3D renders)
- AI image generators

### Tips for Best Results

- Keep the image small for better game performance
- Ensure the rocket is centered in the image
- White/silver color scheme works best with the current engine flames
- Include visible grid fins for authenticity
- Make sure the engine section is at the bottom for correct flame positioning

## Current Assets

### Starship (`starship.svg`)

The included Starship SVG features:

- Stainless steel body with authentic metallic gradient
- Grid fins on both sides
- Engine section with 3 nozzles
- Realistic weld seams and details
- Shiny inox finish like the real SpaceX Starship

### Mechazilla Tower

The Mechazilla chopsticks are rendered programmatically with:

- Orange catching arms (matching the real tower)
- Extended length for realistic proportions
- Hydraulic cylinders and structural details
- Dark gray tower with cross-bracing

Feel free to use the Starship SVG as a starting point or replace it entirely with a more detailed design!
