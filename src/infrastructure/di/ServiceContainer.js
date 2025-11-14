/**
 * ServiceContainer - Dependency Injection Container
 * Follows Dependency Inversion Principle
 * Wires up all dependencies in one place
 */

// Repositories
import { ApiOrderRepository } from '../api/repositories/ApiOrderRepository';
import { ApiEstateRepository } from '../api/repositories/ApiEstateRepository';
import { ApiCategoryRepository } from '../api/repositories/ApiCategoryRepository';
import { ApiOfferRepository } from '../api/repositories/ApiOfferRepository';
import { ApiBuilderRepository } from '../api/repositories/ApiBuilderRepository';
import { ApiFileRepository } from '../api/repositories/ApiFileRepository';

// Use Cases - Orders
import { CreateOrder } from '../../application/use-cases/orders/CreateOrder';
import { UpdateOrder } from '../../application/use-cases/orders/UpdateOrder';
import { DeleteOrder } from '../../application/use-cases/orders/DeleteOrder';
import { SearchOrders } from '../../application/use-cases/orders/SearchOrders';
import { GetOrderOffers } from '../../application/use-cases/orders/GetOrderOffers';
import { GetCustomerOrders } from '../../application/use-cases/orders/GetCustomerOrders';

// Use Cases - Estates
import { ManageEstates } from '../../application/use-cases/estates/ManageEstates';

// Use Cases - Offers
import { CreateOffer } from '../../application/use-cases/offers/CreateOffer';

// Use Cases - Builders
import { SearchBuilders } from '../../application/use-cases/builders/SearchBuilders';
import { GetBuilder } from '../../application/use-cases/builders/GetBuilder';
import { UpdateBuilder } from '../../application/use-cases/builders/UpdateBuilder';

// Use Cases - Files
import { UploadAvatar } from '../../application/use-cases/files/UploadAvatar';
import { GetAvatar } from '../../application/use-cases/files/GetAvatar';
import { UploadPortfolioPhoto } from '../../application/use-cases/files/UploadPortfolioPhoto';
import { GetPortfolioPhotos } from '../../application/use-cases/files/GetPortfolioPhotos';
import { DeletePortfolioPhoto } from '../../application/use-cases/files/DeletePortfolioPhoto';
import { UploadOrderPhoto } from '../../application/use-cases/files/UploadOrderPhoto';
import { GetOrderPhotos } from '../../application/use-cases/files/GetOrderPhotos';
import { DeleteOrderPhoto } from '../../application/use-cases/files/DeleteOrderPhoto';

/**
 * ServiceContainer - Singleton pattern for dependency injection
 */
class ServiceContainer {
  constructor() {
    this.repositories = {};
    this.useCases = {};
    this._initialize();
  }

  _initialize() {
    // Initialize repositories
    this.repositories.order = new ApiOrderRepository();
    this.repositories.estate = new ApiEstateRepository();
    this.repositories.category = new ApiCategoryRepository();
    this.repositories.offer = new ApiOfferRepository();
    this.repositories.builder = new ApiBuilderRepository();
    this.repositories.file = new ApiFileRepository();

    // Initialize use cases with their dependencies
    this.useCases.createOrder = new CreateOrder(this.repositories.order);
    this.useCases.updateOrder = new UpdateOrder(this.repositories.order);
    this.useCases.deleteOrder = new DeleteOrder(this.repositories.order);
    this.useCases.searchOrders = new SearchOrders(this.repositories.order);
    this.useCases.getCustomerOrders = new GetCustomerOrders(this.repositories.order);
    this.useCases.getOrderOffers = new GetOrderOffers(this.repositories.offer);

    this.useCases.manageEstates = new ManageEstates(this.repositories.estate);

    this.useCases.createOffer = new CreateOffer(this.repositories.offer);

    this.useCases.searchBuilders = new SearchBuilders(this.repositories.builder);
    this.useCases.getBuilder = new GetBuilder(this.repositories.builder);
    this.useCases.updateBuilder = new UpdateBuilder(this.repositories.builder);

    this.useCases.uploadAvatar = new UploadAvatar(this.repositories.file);
    this.useCases.getAvatar = new GetAvatar(this.repositories.file);
    this.useCases.uploadPortfolioPhoto = new UploadPortfolioPhoto(this.repositories.file);
    this.useCases.getPortfolioPhotos = new GetPortfolioPhotos(this.repositories.file);
    this.useCases.deletePortfolioPhoto = new DeletePortfolioPhoto(this.repositories.file);
    this.useCases.uploadOrderPhoto = new UploadOrderPhoto(this.repositories.file);
    this.useCases.getOrderPhotos = new GetOrderPhotos(this.repositories.file);
    this.useCases.deleteOrderPhoto = new DeleteOrderPhoto(this.repositories.file);
  }

  // Getters for repositories
  getOrderRepository() {
    return this.repositories.order;
  }

  getEstateRepository() {
    return this.repositories.estate;
  }

  getCategoryRepository() {
    return this.repositories.category;
  }

  getOfferRepository() {
    return this.repositories.offer;
  }

  getBuilderRepository() {
    return this.repositories.builder;
  }

  // Getters for use cases - Orders
  getCreateOrderUseCase() {
    return this.useCases.createOrder;
  }

  getUpdateOrderUseCase() {
    return this.useCases.updateOrder;
  }

  getDeleteOrderUseCase() {
    return this.useCases.deleteOrder;
  }

  getSearchOrdersUseCase() {
    return this.useCases.searchOrders;
  }

  getOrderOffersUseCase() {
    return this.useCases.getOrderOffers;
  }

  getCustomerOrdersUseCase() {
    return this.useCases.getCustomerOrders;
  }

  // Getters for use cases - Estates
  getManageEstatesUseCase() {
    return this.useCases.manageEstates;
  }

  // Getters for use cases - Offers
  getCreateOfferUseCase() {
    return this.useCases.createOffer;
  }

  // Getters for use cases - Builders
  getSearchBuildersUseCase() {
    return this.useCases.searchBuilders;
  }

  getGetBuilderUseCase() {
    return this.useCases.getBuilder;
  }

  getUpdateBuilderUseCase() {
    return this.useCases.updateBuilder;
  }

  // Getters for use cases - Files
  getUploadAvatarUseCase() {
    return this.useCases.uploadAvatar;
  }

  getGetAvatarUseCase() {
    return this.useCases.getAvatar;
  }

  getUploadPortfolioPhotoUseCase() {
    return this.useCases.uploadPortfolioPhoto;
  }

  getGetPortfolioPhotosUseCase() {
    return this.useCases.getPortfolioPhotos;
  }

  getDeletePortfolioPhotoUseCase() {
    return this.useCases.deletePortfolioPhoto;
  }

  getUploadOrderPhotoUseCase() {
    return this.useCases.uploadOrderPhoto;
  }

  getGetOrderPhotosUseCase() {
    return this.useCases.getOrderPhotos;
  }

  getDeleteOrderPhotoUseCase() {
    return this.useCases.deleteOrderPhoto;
  }
}

// Export singleton instance
export const container = new ServiceContainer();
