# Shanyrak - Property Service Marketplace

A modern web application connecting property owners with trusted service providers. Property owners can post service requests for their properties, and service providers can browse orders and submit competitive offers.

## Features

### For Property Owners (Customers)
- **Property Management**: Add, edit, and manage multiple properties
- **Service Orders**: Create detailed service requests with budget ranges
- **Browse Offers**: Review and compare offers from service providers
- **Contract Management**: Accept offers and create formal contracts

### For Service Providers
- **Browse Orders**: Search and filter available service requests
- **Submit Offers**: Provide competitive pricing and timelines
- **Contract Creation**: Formalize agreements with customers

### General Features
- **User Authentication**: Secure login and registration system
- **Role-based Access**: Different features for customers and service providers
- **Category System**: Organize services by categories
- **Search & Filters**: Find relevant orders by location, category, and budget
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite 7
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Styling**: CSS with CSS Variables (Design Tokens)
- **State Management**: React Context API

## Project Structure

```
shanyrak-app/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Navbar.jsx
│   │   └── PrivateRoute.jsx
│   ├── pages/             # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Estates.jsx
│   │   ├── Orders.jsx
│   │   └── Offers.jsx
│   ├── services/          # API service layer
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── categoryService.js
│   │   ├── estateService.js
│   │   ├── orderService.js
│   │   ├── offerService.js
│   │   └── contractService.js
│   ├── context/           # React Context providers
│   │   └── AuthContext.jsx
│   ├── App.jsx            # Main application component
│   └── main.jsx           # Application entry point
├── design-tokens.json     # Design system tokens
├── .env.example           # Environment variables template
└── package.json           # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API server running (see API documentation)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shanyrak-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your API base URL:
   ```
   VITE_API_BASE_URL=http://localhost:8080
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Usage Guide

### Getting Started as a Customer

1. **Register an account**
   - Click "Register" in the navbar
   - Fill in your details and select "Property Owner (Customer)" as your role
   - Create a strong password

2. **Add your properties**
   - Navigate to "My Properties"
   - Click "Add Property"
   - Fill in property details (type, location, area, etc.)

3. **Create a service order**
   - Go to "Orders"
   - Click "Create Order"
   - Select the property and service category
   - Describe the work needed and set your budget range

4. **Review offers**
   - Click "View Offers" on your order
   - Compare pricing, timelines, and provider messages
   - Accept an offer to create a contract

### Getting Started as a Service Provider

1. **Register an account**
   - Click "Register" in the navbar
   - Fill in your details and select "Service Provider" as your role

2. **Browse available orders**
   - Navigate to "Orders" to see all available service requests
   - Use search filters to find relevant work

3. **Submit an offer**
   - Click "Make Offer" on an order
   - Provide your pricing, timeline, and message
   - Submit your competitive offer

4. **Manage contracts**
   - Track accepted offers and active contracts
   - Communicate with customers through the platform

## API Integration

The application integrates with the Shanyrak backend API. See `clayde/API_DOCUMENTATION.md` for detailed API endpoints.

### API Base URL Configuration

Set the API base URL in your `.env` file:
```
VITE_API_BASE_URL=http://localhost:8080
```

### Authentication

The application uses JWT (JSON Web Token) authentication:
- Tokens are stored in localStorage
- Automatically included in API requests via axios interceptors
- Expired tokens trigger automatic logout and redirect to login

## Design System

The application uses a comprehensive design system defined in `design-tokens.json`:

- **Colors**: Primary, secondary, success, warning, error, and neutral palettes
- **Typography**: Font families, sizes, and weights
- **Spacing**: Consistent spacing scale
- **Border Radius**: Rounded corner standards
- **Shadows**: Elevation levels for depth

All design tokens are exposed as CSS variables in `src/index.css` for easy theming.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For issues, questions, or support, please contact the development team.
