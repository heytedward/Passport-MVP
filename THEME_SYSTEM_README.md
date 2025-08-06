# Monarch Passport MVP - Complete Theme System

## Overview

The Monarch Passport MVP now features a comprehensive theme system that allows users to customize the visual appearance of the app. This system includes 5 distinct themes, each with unique visual characteristics that match the PapillonLabs fashion brand aesthetic.

## 🎨 Available Themes

### 1. Monarch Classic (Default)
- **Key**: `monarchClassic`
- **Style**: Classic luxury design with timeless elegance
- **Colors**: Black background with gold accents
- **Status**: Always unlocked

### 2. Solar Shine
- **Key**: `solarShine`
- **Style**: Warm solar radiance with golden energy
- **Colors**: Warm gradient background with orange/gold accents
- **Status**: Unlockable through rewards

### 3. Purple Royalty
- **Key**: `purpleRoyalty`
- **Style**: Regal purple elegance with royal sophistication
- **Colors**: Purple gradient background with electric purple accents
- **Status**: Unlockable through rewards

### 4. Midnight
- **Key**: `midnight`
- **Style**: Pure black sophistication with steel accents
- **Colors**: Pure black background with steel blue accents
- **Status**: Unlockable through rewards

### 5. Spring Garden
- **Key**: `springGarden`
- **Style**: Fresh green vitality with natural elegance
- **Colors**: Green gradient background with fresh green accents
- **Status**: Unlockable through rewards

## 🏗️ Architecture

### Core Files

#### 1. `src/config/themes.js`
- **Purpose**: Theme definitions and configuration
- **Features**:
  - Complete theme specifications with exact CSS values
  - Theme management utilities
  - Theme application functions
  - Preview generation utilities

#### 2. `src/hooks/useTheme.js`
- **Purpose**: Theme management hook
- **Features**:
  - Theme loading from Supabase
  - Theme switching and persistence
  - Theme preview functionality
  - Theme unlocking system
  - Real-time theme application

#### 3. `src/components/ThemeTestingSection.jsx`
- **Purpose**: Theme testing and preview component
- **Features**:
  - Visual theme previews
  - Live theme switching
  - Theme unlocking for testing
  - Error handling with ErrorBoundary

#### 4. `src/components/ErrorBoundary.jsx`
- **Purpose**: Error handling for theme system
- **Features**:
  - Graceful error recovery
  - Development error details
  - Multiple error detection
  - Auto-reload on persistent errors

## 🎯 Theme Specifications

Each theme includes the following visual elements:

### Background
- Solid colors or gradients
- Applied to document root
- Responsive design support

### Cards
- Glass morphism effects
- Customizable opacity and blur
- Border styling
- Backdrop filters

### Buttons
- Gradient backgrounds
- Hover effects
- Consistent styling across themes

### Text
- Primary text color
- Secondary text color
- Muted text color
- Consistent typography

### Accents
- Theme-specific accent colors
- Stroke and border styling
- Success/error/warning colors

## 🔧 Implementation Details

### CSS Custom Properties

The theme system uses CSS custom properties for dynamic styling:

```css
:root {
  --theme-background: #0A0A0A;
  --theme-card-bg: rgba(255, 255, 255, 0.1);
  --theme-card-border: 1px solid rgba(255, 255, 255, 0.2);
  --theme-card-blur: blur(10px);
  --theme-button-gradient: linear-gradient(135deg, #FFB000 0%, #FFD700 100%);
  --theme-button-hover: linear-gradient(135deg, #E69A00 0%, #E6C200 100%);
  --theme-text-primary: #FFFFFF;
  --theme-text-secondary: #CCCCCC;
  --theme-text-muted: #999999;
  --theme-accent: #FFB000;
  --theme-accent-stroke: 2px solid #FFB000;
  --theme-success: #10B981;
  --theme-error: #EF4444;
  --theme-warning: #F59E0B;
}
```

### Database Integration

Themes are stored in the `user_profiles` table:

```sql
-- Theme-related columns
equipped_theme TEXT DEFAULT 'monarchClassic',
owned_themes TEXT[] DEFAULT ARRAY['monarchClassic']
```

### Theme Application Process

1. **Load User Preferences**: Read from Supabase on app initialization
2. **Apply Theme**: Set CSS custom properties on document root
3. **Update UI**: All styled-components automatically update
4. **Persist Changes**: Save to database when user switches themes

## 🚀 Usage

### Basic Theme Switching

```javascript
import { useTheme } from '../hooks/useTheme';

const MyComponent = () => {
  const { switchTheme, currentTheme } = useTheme();
  
  const handleThemeChange = async (themeKey) => {
    const result = await switchTheme(themeKey);
    if (result.success) {
      console.log('Theme applied successfully');
    }
  };
  
  return (
    <button onClick={() => handleThemeChange('solarShine')}>
      Switch to Solar Shine
    </button>
  );
};
```

### Theme Preview

```javascript
const { previewTheme, clearPreview } = useTheme();

// Preview a theme without saving
previewTheme('purpleRoyalty');

// Clear preview and restore current theme
clearPreview();
```

### Theme Testing

The `ThemeTestingSection` component provides a complete testing interface:

- Visual previews of all themes
- Live theme switching
- Theme unlocking for testing
- Error handling and recovery

## 🛡️ Error Handling

### ErrorBoundary Integration

The theme system is wrapped in ErrorBoundary components to prevent crashes:

```javascript
<ErrorBoundary>
  <ThemeTestingSection />
</ErrorBoundary>
```

### Graceful Degradation

- Falls back to default theme on errors
- Maintains app functionality even if theme system fails
- Provides user feedback for theme-related issues

## 🎨 Styling Guidelines

### Using Theme Colors in Components

```javascript
const StyledComponent = styled.div`
  background: var(--theme-card-bg);
  border: var(--theme-card-border);
  color: var(--theme-text-primary);
  backdrop-filter: var(--theme-card-blur);
`;

const StyledButton = styled.button`
  background: var(--theme-button-gradient);
  color: var(--theme-text-primary);
  
  &:hover {
    background: var(--theme-button-hover);
  }
`;
```

### Responsive Design

All themes support responsive design:
- Mobile-first approach
- Consistent breakpoints
- Adaptive styling

## 🔒 Security Considerations

- Theme data is user-specific and protected by RLS
- No sensitive information in theme configurations
- Environment variable validation
- Input sanitization for theme keys

## 🧪 Testing

### Manual Testing

1. Navigate to Settings → Theme Testing
2. Test theme previews
3. Test theme switching
4. Test theme unlocking
5. Test error scenarios

### Automated Testing

```javascript
// Test theme switching
const result = await switchTheme('solarShine');
expect(result.success).toBe(true);

// Test theme preview
previewTheme('purpleRoyalty');
expect(document.documentElement.style.background).toContain('linear-gradient');
```

## 🚀 Deployment

### Environment Variables

No additional environment variables required for the theme system.

### Database Migration

Ensure the `user_profiles` table has the required columns:

```sql
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS equipped_theme TEXT DEFAULT 'monarchClassic',
ADD COLUMN IF NOT EXISTS owned_themes TEXT[] DEFAULT ARRAY['monarchClassic'];
```

## 📱 Mobile Optimization

- Touch-friendly theme selection
- Optimized preview cards for mobile
- Responsive grid layouts
- Mobile-specific styling adjustments

## 🔮 Future Enhancements

### Planned Features

1. **Custom Themes**: User-generated themes
2. **Theme Animations**: Smooth transitions between themes
3. **Theme Presets**: Quick theme combinations
4. **Seasonal Themes**: Time-limited theme releases
5. **Theme Sharing**: Social theme sharing features

### Technical Improvements

1. **Theme Caching**: Improved performance with local caching
2. **Theme Compression**: Optimized theme data storage
3. **Theme Validation**: Enhanced theme validation
4. **Theme Analytics**: Usage tracking and analytics

## 🐛 Troubleshooting

### Common Issues

1. **Theme not applying**: Check CSS custom properties
2. **Database errors**: Verify RLS policies
3. **Performance issues**: Check theme loading optimization
4. **Styling conflicts**: Ensure proper CSS specificity

### Debug Mode

Enable debug logging:

```javascript
// In browser console
localStorage.setItem('theme-debug', 'true');
```

## 📚 Additional Resources

- [Styled Components Documentation](https://styled-components.com/)
- [CSS Custom Properties Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)

---

**Monarch Passport MVP Theme System** - Built with ❤️ by PapillonLabs 