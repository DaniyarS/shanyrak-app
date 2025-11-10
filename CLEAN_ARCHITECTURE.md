# Clean Architecture + SOLID Principles Implementation

## Overview

This document describes the Clean Architecture and SOLID principles implementation in the Shanyrak application.

## Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│              Presentation Layer                      │
│           (React Components / UI)                    │
│         src/pages/ , src/components/                 │
└──────────────────┬──────────────────────────────────┘
                   │ Uses
                   ↓
┌─────────────────────────────────────────────────────┐
│          Application Layer (Use Cases)               │
│       Business Logic & Orchestration                 │
│       src/application/use-cases/                     │
└──────────────────┬──────────────────────────────────┘
                   │ Depends on
                   ↓
┌─────────────────────────────────────────────────────┐
│           Domain Layer (Core Business)               │
│  Entities + Repository Interfaces (Abstractions)     │
│    src/domain/entities/ , src/domain/repositories/   │
└─────────────────────────────────────────────────────┘
                   ↑
                   │ Implemented by
                   │
┌─────────────────────────────────────────────────────┐
│          Infrastructure Layer                        │
│  API Implementations + Data Mappers + DI Container   │
│    src/infrastructure/api/ , src/infrastructure/di/  │
└─────────────────────────────────────────────────────┘
```

## SOLID Principles Applied

### 1. Single Responsibility Principle (SRP)
✅ **Each class/module has ONE reason to change:**
- **Entities**: Pure business objects (Order, Estate, etc.) - only change when business rules change
- **Mappers**: Only responsible for data transformation
- **Repositories**: Only responsible for data persistence
- **Use Cases**: Each use case handles a single business operation

Example:
```javascript
// ✅ GOOD - Single responsibility
export class CreateOrder {
  async execute(orderData, categoryId, estateId) {
    // Only handles order creation logic
  }
}

export class DeleteOrder {
  async execute(orderId) {
    // Only handles order deletion logic
  }
}
```

### 2. Open/Closed Principle (OCP)
✅ **Open for extension, closed for modification:**
- Repository interfaces allow new implementations without changing existing code
- Use cases can be extended with new business logic
- Mappers can handle new field variations without breaking existing code

Example:
```javascript
// Can add new repository implementations without changing domain code
class ApiOrderRepository extends IOrderRepository { }
class MockOrderRepository extends IOrderRepository { } // For testing
class CacheOrderRepository extends IOrderRepository { } // Future enhancement
```

### 3. Liskov Substitution Principle (LSP)
✅ **Subtypes must be substitutable for their base types:**
- All repository implementations can replace IRepository interface
- Service container can swap implementations seamlessly

Example:
```javascript
// Any implementation of IOrderRepository can be used
const repo1 = new ApiOrderRepository();
const repo2 = new MockOrderRepository();
const useCase = new CreateOrder(repo1); // Works
const useCase2 = new CreateOrder(repo2); // Also works
```

### 4. Interface Segregation Principle (ISP)
✅ **Clients shouldn't depend on interfaces they don't use:**
- Separate repository interfaces for different entities
- Each use case only depends on the repositories it needs

Example:
```javascript
// ✅ GOOD - Segregated interfaces
class CreateOrder {
  constructor(orderRepository) { } // Only needs order repo
}

class ManageEstates {
  constructor(estateRepository) { } // Only needs estate repo
}
```

### 5. Dependency Inversion Principle (DIP)
✅ **Depend on abstractions, not concretions:**
- Use cases depend on IRepository interfaces (abstractions)
- Infrastructure implements these interfaces
- Service container manages dependencies

Example:
```javascript
// ✅ GOOD - Depends on abstraction
class CreateOrder {
  constructor(orderRepository) { // IOrderRepository interface
    this.orderRepository = orderRepository;
  }
}

// ❌ BAD - Would be depending on concrete class
class CreateOrder {
  constructor() {
    this.orderRepository = new ApiOrderRepository(); // Concrete!
  }
}
```

## Directory Structure

```
src/
├── domain/                         # Core business logic (Framework-independent)
│   ├── entities/                   # Business entities
│   │   ├── Order.js               # Order entity with validation
│   │   ├── Estate.js              # Estate entity
│   │   ├── Category.js            # Category entity
│   │   ├── Offer.js               # Offer entity
│   │   └── User.js                # User entity
│   └── repositories/               # Repository interfaces (abstractions)
│       ├── IOrderRepository.js
│       ├── IEstateRepository.js
│       ├── ICategoryRepository.js
│       └── IOfferRepository.js
│
├── application/                    # Application business rules
│   └── use-cases/                  # Use case implementations
│       ├── orders/
│       │   ├── CreateOrder.js     # Create order use case
│       │   ├── UpdateOrder.js     # Update order use case
│       │   ├── DeleteOrder.js     # Delete order use case
│       │   ├── SearchOrders.js    # Search orders use case
│       │   └── GetOrderOffers.js  # Get offers use case
│       ├── estates/
│       │   └── ManageEstates.js   # Estate CRUD use case
│       └── offers/
│           └── CreateOffer.js     # Create offer use case
│
├── infrastructure/                 # External interfaces & frameworks
│   ├── api/
│   │   ├── mappers/               # DTO ↔ Entity transformation
│   │   │   ├── OrderMapper.js     # Handles uuid/publicId mapping
│   │   │   ├── EstateMapper.js
│   │   │   ├── CategoryMapper.js
│   │   │   ├── OfferMapper.js
│   │   │   └── UserMapper.js
│   │   └── repositories/          # Concrete repository implementations
│   │       ├── ApiOrderRepository.js
│   │       ├── ApiEstateRepository.js
│   │       ├── ApiCategoryRepository.js
│   │       └── ApiOfferRepository.js
│   └── di/
│       └── ServiceContainer.js    # Dependency injection container
│
└── pages/                          # Presentation layer (React components)
    └── Orders.jsx                  # Uses use cases via container
```

## Key Components

### 1. Domain Entities

**Immutable business objects** with validation logic:

```javascript
export class Order {
  constructor({ id, title, description, budgetMin, budgetMax, ... }) {
    this.id = id;
    this.title = title;
    // ... other properties
    Object.freeze(this); // Immutable
  }

  static validate(data) {
    // Business validation logic
    return { isValid, errors };
  }

  getBudgetRange() {
    // Business logic methods
  }
}
```

### 2. Repository Interfaces (Abstractions)

**Define contracts** without implementation details:

```javascript
export class IOrderRepository {
  async search(filters) {
    throw new Error('Method not implemented');
  }

  async create(order, categoryId, estateId) {
    throw new Error('Method not implemented');
  }

  // ... other methods
}
```

### 3. Data Mappers

**Solve the uuid/publicId problem** by normalizing field names:

```javascript
export class OrderMapper {
  static toDomain(apiData) {
    return new Order({
      id: apiData.uuid || apiData.publicId || apiData.id, // ✅ Handles all cases
      budgetMin: apiData.budgetMin || apiData.budjetMin,   // ✅ Handles typo
      // ... map all fields
    });
  }

  static toCreateDTO(order, categoryId, estateId) {
    return {
      category: { publicId: categoryId },
      realEstate: { publicId: estateId },
      order: {
        budjetMin: order.budgetMin, // ✅ Converts back to backend format
        // ...
      }
    };
  }
}
```

### 4. Repository Implementations

**Concrete classes** that use API and mappers:

```javascript
export class ApiOrderRepository extends IOrderRepository {
  async search(filters) {
    const response = await api.get(`/api/v1/orders?...`);
    return OrderMapper.toDomainList(response.data); // ✅ Transforms to domain
  }

  async delete(id) {
    await api.delete(`/api/v1/orders/${id}`); // ✅ Now uses correct ID
  }
}
```

### 5. Use Cases

**Orchestrate business logic**:

```javascript
export class CreateOrder {
  constructor(orderRepository) {
    this.orderRepository = orderRepository; // Depends on interface
  }

  async execute(orderData, categoryId, estateId) {
    // 1. Validate
    const validation = Order.validate(orderData);
    if (!validation.isValid) return { success: false, errors };

    // 2. Create entity
    const order = new Order(orderData);

    // 3. Persist via repository
    const createdOrder = await this.orderRepository.create(order, categoryId, estateId);

    return { success: true, order: createdOrder };
  }
}
```

### 6. Service Container (Dependency Injection)

**Wires everything together**:

```javascript
class ServiceContainer {
  constructor() {
    // Initialize repositories
    this.repositories.order = new ApiOrderRepository();

    // Initialize use cases with dependencies
    this.useCases.createOrder = new CreateOrder(this.repositories.order);
  }

  getCreateOrderUseCase() {
    return this.useCases.createOrder;
  }
}

export const container = new ServiceContainer();
```

### 7. React Components

**Use clean architecture via container**:

```javascript
import { container } from '../infrastructure/di/ServiceContainer';

const Orders = () => {
  const handleDelete = async (orderId) => {
    const deleteOrderUseCase = container.getDeleteOrderUseCase();
    const result = await deleteOrderUseCase.execute(orderId);

    if (result.success) {
      // Success handling
    }
  };

  // Now using order.id everywhere (normalized by mapper)
  return (
    <div onClick={() => handleDelete(order.id)}>Delete</div>
  );
};
```

## Problem Solved: uuid vs publicId

### Before (Inconsistent)
```javascript
// ❌ BAD - Hardcoded field access, fragile
const orderId = order.uuid || order.publicId;
const estateId = estate.publicId;
const offerId = offer.publicId;
```

### After (Clean Architecture)
```javascript
// ✅ GOOD - Mappers handle normalization
// OrderMapper.toDomain() converts:
//   apiData.uuid → order.id
//   apiData.publicId → order.id

// Components just use:
order.id     // Always works!
estate.id    // Always works!
offer.id     // Always works!
```

## Benefits Achieved

### 1. Maintainability
- Clear separation of concerns
- Easy to locate and modify code
- Single source of truth for each concept

### 2. Testability
- Use cases can be tested with mock repositories
- Entities can be tested independently
- No dependency on external APIs for tests

### 3. Flexibility
- Easy to swap implementations (API → Mock → Cache)
- Backend changes don't affect business logic
- Can change UI framework without touching use cases

### 4. Scalability
- Easy to add new features following the same pattern
- Consistent structure across the application
- Team members know where to put code

### 5. Bug Fixes
- **uuid/publicId issue**: Fixed by mappers normalizing to `.id`
- **budjetMin typo**: Handled by mappers
- Field inconsistencies isolated in one place

## Usage Example

```javascript
// Old way (❌ BAD)
import orderService from '../services/orderService';
const data = await orderService.searchOrders();
const orders = Array.isArray(data) ? data : data?.content || [];
orders.forEach(order => {
  const id = order.uuid || order.publicId; // Fragile!
});

// New way (✅ GOOD)
import { container } from '../infrastructure/di/ServiceContainer';
const searchUseCase = container.getSearchOrdersUseCase();
const result = await searchUseCase.execute(filters);
result.orders.forEach(order => {
  const id = order.id; // Always works!
});
```

## Testing Strategy

```javascript
// Mock repository for testing
class MockOrderRepository extends IOrderRepository {
  async create(order) {
    return new Order({ id: '123', ...order });
  }
}

// Test use case
const mockRepo = new MockOrderRepository();
const useCase = new CreateOrder(mockRepo);
const result = await useCase.execute(orderData, catId, estId);
expect(result.success).toBe(true);
```

## Future Enhancements

1. **Add caching layer**: Create `CacheOrderRepository` wrapping `ApiOrderRepository`
2. **Add offline support**: Create `OfflineOrderRepository` with local storage
3. **Add TypeScript**: Convert to TypeScript for type safety
4. **Add unit tests**: Test each layer independently
5. **Add error boundary**: Handle errors at architecture boundaries

## Migration Guide

To migrate other components:

1. Update imports to use container
2. Replace service calls with use case calls
3. Change `publicId`/`uuid` to `id`
4. Use mappers for any new entities
5. Create use cases for new features

## Conclusion

This Clean Architecture implementation with SOLID principles provides:
- ✅ Normalized data access (`.id` everywhere)
- ✅ Separation of concerns
- ✅ Testability and maintainability
- ✅ Framework independence
- ✅ Business logic protection
- ✅ Easy feature additions

The architecture ensures the codebase remains clean, scalable, and maintainable as the application grows.
