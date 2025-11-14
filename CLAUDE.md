# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shanyrak is a property service marketplace connecting property owners with service providers. Built with React 19, Vite 7, and follows Clean Architecture with SOLID principles.

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
- **Authentication**: JWT tokens stored in localStorage, automatically added via axios interceptors
- **Proxy**: Vite dev server proxies `/api/*` to `http://185.197.194.111:8080` (see `vite.config.js`)
- **API Docs**: See `clayde/api-documentation.json` and `clayde/postman-collection.json`

### Backend Field Inconsistencies

The backend has inconsistent field naming that mappers handle:
- IDs returned as `uuid`, `publicId`, or `id` → Mappers normalize to `.id`
- Budget fields: `budjetMin`/`budjetMax` (typo) → Mappers convert to `budgetMin`/`budgetMax`

## Multi-Language Support

The app supports **Kazakh (kk)**, **Russian (ru)**, and **English (en)**.

- Translation files: `src/i18n/kk.js`, `src/i18n/ru.js`, `src/i18n/en.js`
- Use `LanguageContext` and `useLanguage()` hook in components
- Always add new text to all three translation files

## User Roles

- **CUSTOMER**: Property owners who create orders for services
- **SERVICE_PROVIDER**: Builders/contractors who bid on orders

Role-based routing is handled by `PrivateRoute.jsx`.

## State Management

- **Authentication**: `AuthContext` manages user login/logout state
- **Language**: `LanguageContext` manages app language
- **Form State**: Local component state with React hooks
- No Redux/Zustand - Context API is sufficient for this app

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

## Design System

Design tokens are defined in `design-tokens.json` and applied as CSS variables in `src/index.css`.

- Colors: `--color-primary`, `--color-secondary`, `--color-success`, etc.
- Typography: `--font-family-primary`, `--font-size-*`, `--font-weight-*`
- Spacing: `--spacing-*` (xs, sm, md, lg, xl, 2xl, 3xl)
- Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg`

Use these variables in component CSS files.

## Git Workflow

- **Main branch**: `main`
- **Current feature branch**: Check with `git branch --show-current`
- Use conventional commits: `feat:`, `fix:`, `refactor:`, etc.

## Important Files

- `src/infrastructure/di/ServiceContainer.js` - Dependency injection setup
- `CLEAN_ARCHITECTURE.md` - Detailed architecture documentation
- `src/services/api.js` - Axios instance with interceptors
- `src/context/AuthContext.jsx` - Authentication state management
- `design-tokens.json` - Design system tokens
- `clayde/api-documentation.json` - Backend API reference

## Testing

No test framework is currently set up. When adding tests:
- Mock repositories for use case testing
- Follow the existing architecture patterns
- Test domain entities independently
- Use mock repositories extending `IRepository` interfaces
