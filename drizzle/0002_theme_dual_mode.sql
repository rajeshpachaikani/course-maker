-- Migrate theme_settings.colors from flat ThemeColors to { light, dark } shape.
-- Existing flat palette is kept as the dark theme; light theme defaults are seeded.

UPDATE theme_settings
SET colors = jsonb_build_object(
  'light', jsonb_build_object(
    'bg',        'oklch(0.98 0.005 300)',
    'fg',        'oklch(0.18 0.025 300)',
    'surface',   'oklch(0.95 0.01 300)',
    'mutedFg',   'oklch(0.45 0.02 300)',
    'border',    'oklch(0.85 0.02 300)',
    'primary',   'oklch(0.62 0.25 355)',
    'primaryFg', 'oklch(1 0 0)',
    'accent',    'oklch(0.5 0.27 340)',
    'accentFg',  'oklch(1 0 0)'
  ),
  'dark', colors
)
WHERE colors ? 'bg';
