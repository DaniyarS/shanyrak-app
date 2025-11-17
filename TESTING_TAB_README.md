# Testing Tab - Development Environment Only

## Overview

The Testing tab is a dedicated page for testing UI components in isolation, only visible in the local development environment. This allows developers to test forms and components without affecting the main application flow.

## Access

- **URL**: `http://localhost:5173/testing` (or whatever port Vite assigns)
- **Visibility**: Only visible when `import.meta.env.DEV === true` (development mode)
- **Navigation**: A purple/gradient "🧪 Testing" link appears in the navbar when in development mode

## Current Setup

The testing page currently displays the **Builder Profile Form** from the registration flow (Step 4).

### Features Tested:
- Avatar upload
- About Me textarea
- Experience years and jobs done inputs
- City and district inputs (required fields)
- Portfolio photo upload (up to 10 photos)
- Category selection with pricing
- Available checkbox
- Form validation
- Form submission (logs to console)

## How to Use

1. **Start the development server**: `npm run dev`
2. **Navigate to**: `http://localhost:5173/testing`
3. **Fill out the form** with test data
4. **Click "Test Submit"** to see the form data in the browser console
5. **Test validation** by leaving required fields empty

## Adding New Components to Test

To replace the current form with a different component:

1. Open `/src/pages/Testing.jsx`
2. Locate the `renderBuilderForm()` function
3. Replace the form content with your new component
4. Update the tab name in the `testing-tabs` section if needed
5. Save and the changes will hot-reload

### Example:

```javascript
// In Testing.jsx

const renderMyNewForm = () => (
  <Card className="testing-card">
    <h2>My New Form</h2>
    <form onSubmit={handleMyFormSubmit}>
      {/* Your form fields here */}
    </form>
  </Card>
);

// Then in the render:
{activeSection === 'builder-form' && renderMyNewForm()}
```

## Files Involved

- `/src/pages/Testing.jsx` - Main testing page component
- `/src/pages/Testing.css` - Styling for testing page
- `/src/App.jsx` - Contains conditional route (line 43)
- `/src/components/Navbar.jsx` - Contains testing link (lines 70-78)
- `/src/components/Navbar.css` - Styling for testing link (lines 159-184)
- `/src/components/forms/BuilderProfileForm.jsx` - Reusable builder form component
- `/src/components/forms/BuilderProfileForm.css` - Styling for builder form

## Environment Detection

The testing tab uses Vite's `import.meta.env.DEV` to detect development mode:

```javascript
const isDevelopment = import.meta.env.DEV;

// In routing
{isDevelopment && <Route path="/testing" element={<Testing />} />}

// In navbar
{isDevelopment && (
  <Link to="/testing" className="navbar-link navbar-link-testing">
    🧪 Testing
  </Link>
)}
```

## Production Build

When you run `npm run build`, the testing route and navbar link will be completely excluded from the production bundle, ensuring users never see the testing page in production.

## Testing Workflow

1. **Develop your component** in isolation on the testing page
2. **Test all edge cases** (empty fields, invalid data, etc.)
3. **Verify styling** across different screen sizes
4. **Check console** for any errors or warnings
5. **Once satisfied**, integrate the component into the main app

## Notes

- The testing page has a distinctive purple gradient background to clearly indicate it's a development tool
- Form submissions only log to console - they don't actually save data
- The page is responsive and works on mobile devices
- You can have multiple tabs for testing different components

## Future Enhancements

- Add more tabs for testing other components (buttons, inputs, modals, etc.)
- Add visual regression testing tools
- Add component prop controls for live testing
- Add accessibility testing tools
