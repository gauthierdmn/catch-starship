// Game constants and configuration values

export const GAME_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  GRAVITY: 120, // Further reduced gravity for more control
  BACKGROUND_COLOR: '#001529',
};

export const STARSHIP = {
  WIDTH: 20, // Smaller width
  HEIGHT: 60, // Smaller height
  INITIAL_X_OFFSET: -130, // Offset from center (will be calculated relative to screen center)
  INITIAL_Y: 30,
  INITIAL_VELOCITY_Y: 60, // Slower initial descent
  HORIZONTAL_SPEED: 220, // Faster horizontal movement
  ENGINE_THRUST: -250, // Upward thrust when engines are on (negative = upward)
  MAX_LANDING_SPEED: 80, // Must slow down significantly to land
  ROTATION_SPEED: 0.08,
  ROTATION_DAMPING: 0.95,
  COLOR: 0xf5f5f5, // Brighter white
  ENGINE_COLOR: 0x2c2c2c,
  FLAME_COLOR_1: 0xff8c00,
  FLAME_COLOR_2: 0xff4500,
  DETAIL_COLOR: 0xcccccc,
};

export const MECHAZILLA = {
  TOWER_WIDTH: 35, // Tower width
  TOWER_HEIGHT: 350, // Tall tower
  ARM_WIDTH: 10, // Width of the catching arm (thicker)
  ARM_LENGTH: 70, // Longer catching arms for realism
  ARM_SPACING: 35, // Vertical spacing between upper and lower arms
  CATCH_ZONE_WIDTH: 60, // Catch zone width (between the arms)
  CATCH_ZONE_HEIGHT: 50,
  POSITION_X_CENTER: true, // Center horizontally on screen
  POSITION_Y_OFFSET: -50, // Offset from bottom (will be calculated)
  TOWER_COLOR: 0x2c2c2c,
  STRUCTURE_COLOR: 0x404040,
  ARM_COLOR: 0xff6b00, // Orange color for arms (like real Mechazilla)
  HIGHLIGHT_COLOR: 0x606060,
  ARM_DETAIL_COLOR: 0xff8533, // Lighter orange for highlights
};

export const COLORS = {
  SKY_TOP: '#1a4d6d', // Deep blue sky
  SKY_BOTTOM: '#87CEEB', // Lighter blue near horizon
  HORIZON: '#B8D4E8', // Light blue-gray horizon
  OCEAN: '#4A90A4', // Ocean water
  BEACH: '#C9B896', // Sandy beach
  GROUND: '#8B7355', // Desert sand/dirt
  CONCRETE: '#6B6B6B', // Launch pad concrete
  GROUND_DARK: '#6B5A45', // Darker ground
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SUCCESS: '#00FF00',
  TEXT_FAILURE: '#FF0000',
};

export const MESSAGES = {
  GAME_TITLE: 'CATCH STARSHIP',
  START_INSTRUCTION: 'Press SPACE to start',
  CONTROLS: 'ARROWS: steer | SPACE: engines',
  SUCCESS: 'MISSION SUCCESS! Caught by Mechazilla!',
  FAILURE_MISSED: 'MISSION FAILED - Missed the chopsticks',
  FAILURE_SPEED: 'MISSION FAILED - Landing speed too high',
  RETRY: 'Press SPACE to Retry',
};

export const LOCATIONS = {
  EARTH: {
    name: 'Starbase, Texas',
    gravity: 120, // Same as original GAME_CONFIG.GRAVITY
    skyTop: '#1a4d6d',
    skyBottom: '#87CEEB',
    horizonColor: 0xb8d4e8,
    groundColor: 0x8b7355,
    gridColor: 0x7f8c8d,
    textureColor: 0x95a5a6,
    particleColor: 0xbdc3c7,
    vehicleType: 'cybertruck',
    flameColor1: 0xff8c00,
    flameColor2: 0xff4500,
  },
  MARS: {
    name: 'Base Alpha, Mars',
    gravity: 45, // 38% of Earth gravity (120 * 0.38)
    skyTop: '#8B4513',
    skyBottom: '#D84315',
    horizonColor: 0xa0522d,
    groundColor: 0x8b4513,
    gridColor: 0xa0522d,
    textureColor: 0xcd853f,
    particleColor: 0xd2691e,
    vehicleType: 'rover',
    flameColor1: 0xff6600,
    flameColor2: 0xff3300,
  },
};
