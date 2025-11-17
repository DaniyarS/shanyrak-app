# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shanyrak is a property service marketplace connecting property owners (customers) with service providers (builders/contractors). Built with React 19, Vite 7, and follows Clean Architecture with SOLID principles.

## Development Commands

```bash
# Development server (runs on http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

**Note**: No test framework is currently configured. The app uses Vite's dev server with hot module replacement (HMR).

## Architecture

The codebase follows **Clean Architecture** with strict separation of concerns. Read `CLEAN_ARCHITECTURE.md` for full details.

### Layer Structure

```
domain/              # Core business entities and interfaces (framework-independent)
├── entities/        # Business objects (Order, Estate, Offer, Category, User)
└── repositories/    # Repository interfaces (IOrderRepository, etc.)

application/         # Business logic orchestration
└── use-cases/       # Single-purpose operations (CreateOrder, SearchOrders, etc.)

infrastructure/      # External dependencies
├── api/
│   ├── mappers/     # DTO ↔ Entity transformation
│   └── repositories/# Concrete API implementations
└── di/
    └── ServiceContainer.js  # Dependency injection container

pages/              # React page components
components/         # Reusable UI components
context/            # React Context (AuthContext, LanguageContext)
```

### Key Architectural Rules

1. **Never import concrete repositories directly** - Always use the ServiceContainer
2. **Always use mappers** for API data transformation (solves uuid/publicId inconsistencies)
3. **Use `.id` field** on all entities (mappers normalize `uuid`/`publicId` → `id`)
4. **Create use cases** for new business operations, don't put logic in components
5. **Domain entities are immutable** - use `Object.freeze()` in constructors

### Using the Dependency Injection Container

```javascript
// ✅ CORRECT - Use container
import { container } from '../infrastructure/di/ServiceContainer';

const useCase = container.getSearchOrdersUseCase();
const result = await useCase.execute(filters);

// ❌ WRONG - Don't import repositories directly
import { ApiOrderRepository } from '../infrastructure/api/repositories/ApiOrderRepository';
```

## API Integration

- **Base URL**: Configured via `VITE_API_BASE_URL` in `.env` or uses Vite proxy
- **Authentication**: JWT tokens (access + refresh) stored in localStorage, automatically added via axios interceptors
- **Token Refresh**: Automatic token refresh on 401 errors via axios response interceptor
- **Proxy**: Vite dev server proxies `/api/*` to `http://185.197.194.111:8080` (see `vite.config.js`)
- **API Docs**: See `clayde/API_DOCUMENTATION.md`, `clayde/api-documentation.json` and `clayde/postman-collection.json`

### Authentication Flow

The app uses JWT authentication with automatic token refresh:
1. Login/register stores `authToken` (access), `refreshToken`, and `user` in localStorage
2. `api.js` interceptor adds `Authorization: Bearer <token>` to all requests
3. On 401 response, interceptor automatically calls `/api/v1/auth/refresh` with refresh token
4. If refresh succeeds, the original request is retried with new token
5. If refresh fails, user is logged out and redirected to `/login`
6. Session expiry is handled via custom event `auth:session-expired` dispatched by the interceptor

**Important**: The refresh endpoint (`/api/v1/auth/refresh`) uses a separate axios instance without interceptors to prevent infinite loops.

### Backend Field Inconsistencies

The backend has inconsistent field naming that mappers handle:
- IDs returned as `uuid`, `publicId`, or `id` → Mappers normalize to `.id`
- Budget fields: `budjetMin`/`budjetMax` (typo) → Mappers convert to `budgetMin`/`budgetMax`

**Critical**: Always use the normalized `.id` field on domain entities. Never access `uuid` or `publicId` directly in components.

## Multi-Language Support

The app supports **Kazakh (kk)**, **Russian (ru)**, and **English (en)**.

- Translation files: `src/i18n/kk.js`, `src/i18n/ru.js`, `src/i18n/en.js`
- Central import: `src/i18n/translations.js` exports all translations
- Use `LanguageContext` and `useLanguage()` hook in components
- **Always add new text to all three translation files** - translations are organized by feature/section

Example:
```javascript
import { useLanguage } from '../context/LanguageContext';

const MyComponent = () => {
  const { t } = useLanguage();
  return <h1>{t.navbar.home}</h1>; // Accesses translations.kk.navbar.home or .ru or .en
};
```

## User Roles

The application has two distinct user roles with different permissions:

- **CUSTOMER**: Property owners who create orders for services
  - Can create and manage properties (estates)
  - Can create service orders and view offers
  - Can accept offers and create contracts
  - Can review completed work

- **SERVICE_PROVIDER**: Builders/contractors who bid on orders
  - Can browse available orders
  - Can submit offers on orders
  - Can manage their portfolio and profile
  - Can complete contracts and receive reviews

Role-based routing is handled by `PrivateRoute.jsx` which checks `user.role` against `allowedRoles` prop.

## State Management

- **Authentication**: `AuthContext` manages user login/logout/registration state
  - Provides: `user`, `login()`, `register()`, `logout()`, `updateUser()`, `isAuthenticated`, `loading`
  - Automatically restores session from localStorage on app startup
  - Listens for `auth:session-expired` event from axios interceptor
- **Language**: `LanguageContext` manages app language (kk/ru/en)
  - Provides: `language`, `changeLanguage()`, `t` (translations object)
  - Language preference persisted in localStorage
- **Form State**: Local component state with React hooks
- **No Redux/Zustand** - Context API is sufficient for this app's needs

## Adding New Features

Follow this pattern when adding new functionality:

1. **Create domain entity** in `src/domain/entities/` with validation
2. **Create repository interface** in `src/domain/repositories/`
3. **Create mapper** in `src/infrastructure/api/mappers/`
4. **Implement API repository** in `src/infrastructure/api/repositories/`
5. **Create use case(s)** in `src/application/use-cases/`
6. **Register in ServiceContainer** (`src/infrastructure/di/ServiceContainer.js`)
7. **Use in React components** via container

Example:
```javascript
// 1. Domain entity
export class Contract {
  constructor({ id, orderId, offerId, status, ... }) {
    this.id = id;
    // ...
    Object.freeze(this);
  }
}

// 2. Repository interface
export class IContractRepository {
  async create(contract) { throw new Error('Not implemented'); }
}

// 3. Mapper
export class ContractMapper {
  static toDomain(apiData) {
    return new Contract({ id: apiData.uuid || apiData.publicId, ... });
  }
}

// 4. API Repository
export class ApiContractRepository extends IContractRepository {
  async create(contract) {
    const dto = ContractMapper.toDTO(contract);
    const response = await api.post('/api/v1/contracts', dto);
    return ContractMapper.toDomain(response.data);
  }
}

// 5. Use Case
export class CreateContract {
  constructor(contractRepository) {
    this.contractRepository = contractRepository;
  }
  async execute(contractData) {
    // validation and business logic
    return await this.contractRepository.create(contract);
  }
}

// 6. Register in ServiceContainer
this.repositories.contract = new ApiContractRepository();
this.useCases.createContract = new CreateContract(this.repositories.contract);

// 7. Use in component
const createContractUseCase = container.getCreateContractUseCase();
await createContractUseCase.execute(data);
```

## Common Patterns

### Form Handling
```javascript
const [formData, setFormData] = useState({ field1: '', field2: '' });

const handleSubmit = async (e) => {
  e.preventDefault();
  const useCase = container.getSomeUseCase();
  const result = await useCase.execute(formData);

  if (result.success) {
    // Handle success
  } else {
    // Handle validation errors: result.errors
  }
};
```

### Protected Routes
```javascript
<PrivateRoute allowedRoles={['CUSTOMER']}>
  <CustomerOrders />
</PrivateRoute>
```

### Authentication
```javascript
const { user, login, logout } = useAuth();

// Check role
if (user?.role === 'SERVICE_PROVIDER') { /* ... */ }
```

## Core Domain Entities

The application has the following core domain entities (all in `src/domain/entities/`):

- **Order**: Service requests created by customers (title, description, budget range, category, estate)
- **Offer**: Bids submitted by service providers on orders (price, timeline, message)
- **Estate**: Properties owned by customers (type, location, area, rooms)
- **Contract**: Formal agreement when customer accepts an offer (order, offer, status)
- **Category**: Service categories (plumbing, electrical, construction, etc.)
- **User**: User account information (phone, role, name, email)
- **Builder**: Service provider profile (extends User, includes rating, experience, portfolio)
- **Review**: Customer feedback on completed work (rating, comment, contract)
- **File**: Uploaded files (avatars, portfolio photos, order photos)

All entities are immutable (frozen) and have validation methods. See individual entity files for full details.

## File Upload System

The app supports file uploads for:
- **Avatars**: User profile pictures (builders and customers)
- **Portfolio Photos**: Service provider work samples (builders only)
- **Order Photos**: Property photos attached to service orders (customers only)

File upload is handled through:
- Use cases: `UploadAvatar`, `UploadPortfolioPhoto`, `UploadOrderPhoto`, etc.
- Repository: `ApiFileRepository` implements `IFileRepository`
- Components: `AvatarUpload.jsx`, `PortfolioGallery.jsx`, `OrderPhotoGallery.jsx`

Files are uploaded as `multipart/form-data` and stored on the backend. Use the `FileMapper` to normalize file metadata.

## Design System

Design tokens are defined in `design-tokens.json` and applied as CSS variables in `src/index.css`.

- Colors: `--color-primary`, `--color-secondary`, `--color-success`, etc.
- Typography: `--font-family-primary`, `--font-size-*`, `--font-weight-*`
- Spacing: `--spacing-*` (xs, sm, md, lg, xl, 2xl, 3xl)
- Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg`

Use these variables in component CSS files for consistent styling across the app.

## Git Workflow

- **Main branch**: `main` (production-ready code)
- **Development branch**: `develop` (integration branch for features)
- **Feature branches**: Create from `develop` using `feature/description` naming
- **Release branches**: `release/x.x.x` for preparing releases
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`, `chore:`

Example workflow:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/add-notifications
# ... make changes ...
git add .
git commit -m "feat: add notification system for new offers"
git push origin feature/add-notifications
# Create PR from feature/add-notifications → develop
```

## Important Files

- `src/infrastructure/di/ServiceContainer.js` - Dependency injection setup (central registry)
- `CLEAN_ARCHITECTURE.md` - Detailed architecture documentation and SOLID principles
- `src/services/api.js` - Axios instance with request/response interceptors and token refresh logic
- `src/services/authService.js` - Authentication service (login, register, token refresh, logout)
- `src/context/AuthContext.jsx` - Authentication state management (React Context)
- `src/context/LanguageContext.jsx` - Language state management (React Context)
- `design-tokens.json` - Design system tokens (colors, typography, spacing, shadows)
- `vite.config.js` - Vite configuration with API proxy settings
- `clayde/API_DOCUMENTATION.md` - Human-readable API documentation
- `clayde/api-documentation.json` - Backend API reference (JSON format)
- `clayde/postman-collection.json` - Postman collection for API testing

## Legacy Services Directory

The `src/services/` directory contains legacy service files that are being phased out:
- `orderService.js`, `offerService.js`, `estateService.js`, `contractService.js`, etc.
- **Do not use these directly** - use the ServiceContainer and use cases instead
- These may still be used in older components that haven't been migrated to Clean Architecture
- When refactoring, replace service calls with use cases from the container

## Testing

No test framework is currently set up. When adding tests:
- Mock repositories for use case testing (create classes extending `IRepository` interfaces)
- Follow the existing architecture patterns
- Test domain entities independently (they have no dependencies)
- Use mock repositories extending `IRepository` interfaces
- Consider using Vitest (pairs well with Vite) or Jest for testing

## Common Issues & Troubleshooting

### Authentication Issues
- **Problem**: "Token refresh failed" or constant logout
  - Check that `VITE_API_BASE_URL` is correctly configured in `.env`
  - Verify refresh token is stored in localStorage
  - Check network tab for `/api/v1/auth/refresh` endpoint responses
  - Ensure backend refresh endpoint is working correctly

### ID Field Issues
- **Problem**: `undefined` when accessing `order.id` or similar
  - Verify you're using mappers to transform API data to domain entities
  - Never access `uuid` or `publicId` directly - always use `.id`
  - Check that the mapper normalizes the ID field correctly

### Use Case Not Found
- **Problem**: `container.getSomeUseCase() is not a function`
  - Ensure the use case is registered in `ServiceContainer.js`
  - Check the getter method name matches the convention (e.g., `getCreateOrderUseCase`)
  - Verify the use case class is imported at the top of ServiceContainer

### CORS/Proxy Issues
- **Problem**: API requests fail with CORS errors in development
  - Check `vite.config.js` proxy configuration
  - Verify `VITE_API_BASE_URL` is empty (to use proxy) or set correctly
  - Restart Vite dev server after changing proxy config

### Translation Missing
- **Problem**: Text shows as `[object Object]` or translation key
  - Ensure translation exists in all three language files (kk, ru, en)
  - Check translation object structure matches (e.g., `t.navbar.home`)
  - Verify `LanguageContext` is properly wrapping the component tree

### Component Not Rendering After Auth
- **Problem**: Protected route shows blank or redirects unexpectedly
  - Check that `AuthProvider` wraps the entire app in `App.jsx`
  - Verify `PrivateRoute` `allowedRoles` matches user's role
  - Ensure `user` object has a `role` property
