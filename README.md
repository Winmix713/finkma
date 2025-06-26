# CodePreview Component

A comprehensive, production-ready React component for displaying syntax-highlighted code with tabs, copy/download functionality, and full accessibility support.

## Features

- 🎨 **Syntax Highlighting**: Professional code highlighting with multiple themes
- 📱 **Responsive Design**: Mobile-friendly with proper touch targets
- ♿ **Accessibility**: WCAG 2.1 AA compliant with full keyboard support
- 🎯 **Multi-tab Interface**: Support for JSX/TSX, CSS, TypeScript, and HTML
- 📋 **Copy to Clipboard**: Modern clipboard API with fallback support
- 💾 **File Download**: Generate and download code files with proper extensions
- 🌙 **Theme Support**: Auto-detect system theme with manual override
- ⚡ **Performance**: Lazy loading, memoization, and optimized rendering
- 🛡️ **Error Handling**: Comprehensive error boundaries and graceful degradation
- ⌨️ **Keyboard Shortcuts**: Ctrl+C to copy, Ctrl+S to download
- 🔧 **TypeScript**: Full type safety with comprehensive interfaces

## Installation

\`\`\`bash
npm install @your-org/code-preview
# or
yarn add @your-org/code-preview
# or
pnpm add @your-org/code-preview
\`\`\`

## Dependencies

The component requires the following peer dependencies:

\`\`\`json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "react-syntax-highlighter": "^15.5.0",
  "lucide-react": "^0.263.0"
}
\`\`\`

## Basic Usage

\`\`\`tsx
import { CodePreview } from '@your-org/code-preview'

function App() {
  const codeContent = {
    jsx: `export function Button({ children, onClick }) {
  return (
    <button onClick={onClick} className="btn">
      {children}
    </button>
  )
}`,
    css: `.btn {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.btn:hover {
  background: #f0f0f0;
}`,
    typescript: `interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}`
  }

  return (
    <CodePreview
      content={codeContent}
      componentName="Button"
      showLineNumbers={true}
      theme="auto"
    />
  )
}
\`\`\`

## Advanced Usage

### With Event Handlers

\`\`\`tsx
import { CodePreview } from '@your-org/code-preview'

function AdvancedExample() {
  const handleTabChange = (tabId: string) => {
    console.log('Active tab changed to:', tabId)
  }

  const handleCopy = (content: string, tabId: string) => {
    console.log(`Copied ${tabId}:`, content)
    // Track analytics, show notifications, etc.
  }

  const handleDownload = (filename: string, content: string) => {
    console.log(`Downloaded ${filename}`)
    // Track analytics, log downloads, etc.
  }

  const handleError = (error: Error) => {
    console.error('CodePreview error:', error)
    // Send to error reporting service
  }

  return (
    <CodePreview
      content={codeContent}
      componentName="AdvancedButton"
      defaultTab="tsx"
      theme="dark"
      maxHeight="600px"
      onTabChange={handleTabChange}
      onCopy={handleCopy}
      onDownload={handleDownload}
      onError={handleError}
      className="my-custom-class"
    />
  )
}
\`\`\`

### Custom Styling

\`\`\`tsx
import { CodePreview } from '@your-org/code-preview'

function StyledExample() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <CodePreview
        content={codeContent}
        componentName="StyledButton"
        maxHeight="400px"
        className="border-2 border-blue-200 rounded-lg shadow-lg"
        theme="light"
        showLineNumbers={false}
      />
    </div>
  )
}
\`\`\`

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `CodeContent` | **Required** | Code content to display |
| `componentName` | `string` | `"Component"` | Component name for file naming |
| `defaultTab` | `string` | Auto-detected | Default active tab |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Theme preference |
| `showLineNumbers` | `boolean` | `true` | Whether to show line numbers |
| `maxHeight` | `string` | `'400px'` | Maximum height for code display |
| `className` | `string` | `''` | Custom CSS classes |
| `onTabChange` | `(tabId: string) => void` | `undefined` | Tab change callback |
| `onCopy` | `(content: string, tabId: string) => void` | `undefined` | Copy callback |
| `onDownload` | `(filename: string, content: string) => void` | `undefined` | Download callback |
| `onError` | `(error: Error) => void` | `undefined` | Error callback |

### Types

#### CodeContent

\`\`\`tsx
interface CodeContent {
  jsx?: string      // JSX/React code
  css?: string      // CSS styles
  typescript?: string // TypeScript definitions
  html?: string     // HTML content
}
\`\`\`

#### CodePreviewError

\`\`\`tsx
interface CodePreviewError extends Error {
  type: 'clipboard' | 'download' | 'syntax' | 'theme' | 'unknown'
  context?: Record<string, any>
}
\`\`\`

## Accessibility

The component follows WCAG 2.1 AA guidelines and includes:

- **Keyboard Navigation**: Full keyboard support with Tab, Enter, and arrow keys
- **Screen Reader Support**: Comprehensive ARIA labels and live regions
- **Focus Management**: Visible focus indicators and proper focus flow
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects user's motion preferences

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` / `Cmd+C` | Copy current tab content |
| `Ctrl+S` / `Cmd+S` | Download current tab as file |
| `Tab` | Navigate between interactive elements |
| `Enter` / `Space` | Activate buttons and tabs |

## Performance

The component is optimized for performance with:

- **Lazy Loading**: Syntax highlighter loaded on demand
- **Memoization**: React.memo and useMemo for expensive calculations
- **Code Splitting**: Dynamic imports for heavy dependencies
- **Efficient Re-renders**: Optimized state management and event handlers

### Bundle Size

- Core component: ~15KB gzipped
- With syntax highlighter: ~45KB gzipped
- Lazy-loaded dependencies: ~30KB gzipped

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Graceful Degradation**: Fallback support for older browsers
- **Mobile Optimization**: Touch-friendly interface on mobile devices

## Error Handling

The component includes comprehensive error handling:

- **Error Boundaries**: Catch and handle component errors gracefully
- **Fallback Mechanisms**: Alternative methods when primary features fail
- **User Feedback**: Clear error messages and recovery suggestions
- **Logging**: Detailed error information for debugging

## Theming

### Built-in Themes

- **Light**: Clean, professional light theme
- **Dark**: Modern dark theme with good contrast
- **High Contrast**: Accessibility-focused high contrast theme
- **Auto**: Automatically detects system preference

### Custom Themes

You can customize the appearance using CSS custom properties:

\`\`\`css
.code-preview {
  --code-bg: #f8f9fa;
  --code-text: #24292e;
  --tab-bg: #ffffff;
  --tab-active: #0366d6;
  --border-color: #e1e4e8;
}

.code-preview[data-theme="dark"] {
  --code-bg: #2d3748;
  --code-text: #f7fafc;
  --tab-bg: #1a202c;
  --tab-active: #4299e1;
  --border-color: #4a5568;
}
\`\`\`

## Testing

The component includes comprehensive tests:

- **Unit Tests**: Individual component and hook testing
- **Integration Tests**: Component interaction testing
- **Accessibility Tests**: WCAG compliance verification
- **Performance Tests**: Render time and memory usage
- **Error Handling Tests**: Error boundary and validation

### Running Tests

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run accessibility tests
npm run test:a11y
\`\`\`

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

\`\`\`bash
# Clone the repository
git clone https://github.com/your-org/code-preview.git

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
\`\`\`

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with accessibility rules
- **Prettier**: Consistent code formatting
- **Jest**: Testing framework with React Testing Library
- **Accessibility**: WCAG 2.1 AA compliance required

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [Full API Documentation](https://docs.example.com/code-preview)
- **Issues**: [GitHub Issues](https://github.com/your-org/code-preview/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/code-preview/discussions)
- **Email**: support@your-org.com

## Acknowledgments

- **React**: UI framework
- **react-syntax-highlighter**: Code highlighting
- **Lucide React**: Icon library
- **Tailwind CSS**: Utility-first CSS framework
- **React Testing Library**: Testing utilities

---

**Made with ❤️ by the Your Org team**
