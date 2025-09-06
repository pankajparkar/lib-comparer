# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

LibComparer (JSLibDetective) is a modern Angular 20 application that helps developers discover and compare JavaScript libraries. It analyzes GitHub repositories and npm packages in real-time, providing comprehensive metrics including security vulnerabilities, bundle sizes, test coverage, and community health indicators.

## Common Commands

### Development
- `npm run start` or `ng serve` - Start development server on http://localhost:4200
- `npm run build` - Build for production (outputs to `dist/`)
- `npm run watch` - Build and watch for changes in development mode
- `npm test` - Run unit tests with Karma

### Testing Single Components
- `ng test --include="**/lib-comparer.component.spec.ts"` - Test specific component
- `ng test --watch=false --browsers=ChromeHeadless` - Run tests once in headless mode

### Deployment
- `ng build --configuration production` - Production build
- `ng deploy` - Deploy to GitHub Pages (configured via `angular-cli-ghpages`)

## Architecture Overview

### Core Application Structure

**Main App Component (`app.ts`)**: 
- Root component using standalone architecture
- Imports the main components: NavbarComponent, ThemeToggleComponent, and LibComparerComponent

**Library Search Engine (`lib-comparer.component.ts`)**:
- Central search component using Angular's Resource API for reactive data loading
- Integrates with multiple external APIs:
  - GitHub API for repository statistics
  - npm API for download metrics  
  - OSV.dev for security vulnerability scanning
  - BundleJS for bundle size analysis
  - Various coverage services (Codecov, Coveralls, etc.)
- Implements sophisticated scoring algorithm considering stars, downloads, forks, and user engagement

**AI-Powered Search (`ai-assist.component.ts`)**:
- Leverages experimental Chrome LanguageModel API (Gemini Prompt API)
- Provides voice-to-text search via Speech Recognition API
- Extracts framework and functionality from natural language queries

**Theme System (`theme-toggle.component.ts`)**:
- Supports light, dark, and high-contrast themes
- Persists theme preferences in localStorage
- Automatically detects system preferences

### Key Design Patterns

**Standalone Components**: All components use `standalone: true` (Angular 20 default)
- No NgModules - components directly import their dependencies
- Uses modern signal-based reactive patterns

**Signal-Based State Management**:
- `signal()` for component state
- `computed()` for derived state  
- `resource()` API for async data loading with automatic loading/error states

**Modern Control Flow**: Uses `@if`, `@for`, `@switch` instead of structural directives

### External API Integration Strategy

The app makes extensive use of external APIs with robust error handling:

1. **GitHub Search API**: Primary data source for repository information
2. **npm API**: Package download statistics and metadata  
3. **OSV.dev Vulnerability Database**: Security scanning via batch queries
4. **Coverage Services**: Multi-source coverage detection (Codecov, Coveralls, raw files)
5. **BundleJS**: Real-time bundle size analysis

All API calls implement graceful degradation - if one service fails, others continue to provide partial data.

## Development Guidelines

### Angular 20 Specific Patterns
- Use `input()` and `output()` functions instead of `@Input`/`@Output` decorators
- Prefer `ChangeDetectionStrategy.OnPush` for performance
- Use `inject()` function over constructor injection
- Host bindings go in the `host` object of `@Component` decorator, not `@HostBinding`

### Component Architecture
- Keep components focused on single responsibilities
- Use signals for all local state management
- Implement proper loading and error states for async operations
- Use `resource()` API for data fetching with built-in loading/error handling

### Styling Approach
- CSS custom properties for theming
- Responsive design with mobile-first approach
- Accessibility considerations (proper contrast, focus states, ARIA labels)
- Support for reduced motion and high contrast preferences

### Security Practices
- The app fetches vulnerability data from OSV.dev to inform users about security risks
- All external links use `rel="noopener"` for security
- Proper input sanitization for search queries

### Testing Strategy
- Jasmine and Karma for unit testing
- Components use OnPush change detection for predictable testing
- Signal-based state makes testing more straightforward

## AI Features Integration

The application includes cutting-edge AI features:

**Experimental API Usage**: 
- Requires Chrome Canary with experimental flags enabled
- Gracefully degrades when APIs are unavailable
- Provides setup instructions via `AiSetupModalComponent`

**Natural Language Processing**:
- Extracts framework and functionality from user descriptions
- Combines AI text processing with traditional speech recognition
- Implements fallback heuristics when AI parsing fails

## Deployment Notes

- Configured for GitHub Pages deployment via `angular-cli-ghpages` 
- Base href set to `/lib-comparer/` for GitHub Pages compatibility
- Production builds include bundle optimization and license extraction
- Assets are served from the `public/` directory

## Browser Compatibility

- Modern browsers with ES2022 support
- Experimental features (AI, Speech Recognition) require Chrome/Chromium
- Progressive enhancement ensures core functionality works everywhere

## Important Context from Copilot Instructions

When working with this codebase, follow these Angular 20 specific guidelines:
- Always use standalone components (default behavior, don't set `standalone: true`)
- Use latest Angular features: `@for`, `@switch`, `@if` control flow
- Prefer signals over traditional reactive forms where appropriate
- Use `input()` and `output()` functions instead of decorators
- Avoid `@HostBinding`/`@HostListener` decorators - use `host` object instead
- Use `NgOptimizedImage` for static images (not inline base64)
- Never use `mutate` on signals - use `update` or `set`
- Use native control flow instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use `class` and `style` bindings instead of `ngClass`/`ngStyle`
- Cannot use `as` expressions in `@else if` statements
