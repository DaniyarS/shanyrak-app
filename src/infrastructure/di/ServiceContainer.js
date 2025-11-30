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
import { ApiContractRepository } from '../api/repositories/ApiContractRepository';
import { ApiReviewRepository } from '../api/repositories/ApiReviewRepository';
import { ApiAuthRepository } from '../api/repositories/ApiAuthRepository';
import { ApiCityRepository } from '../api/repositories/ApiCityRepository';
import { ApiWasteRepository } from '../api/repositories/ApiWasteRepository';
import { ApiWasteCategoryRepository } from '../api/repositories/ApiWasteCategoryRepository';

// Use Cases - Orders
import { CreateOrder } from '../../application/use-cases/orders/CreateOrder';
import { UpdateOrder } from '../../application/use-cases/orders/UpdateOrder';
import { DeleteOrder } from '../../application/use-cases/orders/DeleteOrder';
import { SearchOrders } from '../../application/use-cases/orders/SearchOrders';
import { GetOrderOffers } from '../../application/use-cases/orders/GetOrderOffers';
import { GetCustomerOrders } from '../../application/use-cases/orders/GetCustomerOrders';
import { RequestBuilderPhone } from '../../application/use-cases/orders/RequestBuilderPhone';
import { ConfirmDeal } from '../../application/use-cases/orders/ConfirmDeal';

// Use Cases - Estates
import { ManageEstates } from '../../application/use-cases/estates/ManageEstates';

// Use Cases - Offers
import { CreateOffer } from '../../application/use-cases/offers/CreateOffer';
import { UpdateOffer } from '../../application/use-cases/offers/UpdateOffer';
import { WithdrawOffer } from '../../application/use-cases/offers/WithdrawOffer';
import { GetBuilderByOffer } from '../../application/use-cases/offers/GetBuilderByOffer';

// Use Cases - Contracts
import { CompleteContract } from '../../application/use-cases/contracts/CompleteContract';
import { GetUserContracts } from '../../application/use-cases/contracts/GetUserContracts';

// Use Cases - Reviews
import { CreateReview } from '../../application/use-cases/reviews/CreateReview';
import { GetBuilderReviews } from '../../application/use-cases/reviews/GetBuilderReviews';
import { GetReview } from '../../application/use-cases/reviews/GetReview';

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

// Use Cases - Auth
import { DeleteAccount } from '../../application/use-cases/auth/DeleteAccount';

// Use Cases - Categories
import { GetCategoryTree } from '../../application/use-cases/categories/GetCategoryTree';

// Use Cases - Cities
import { GetCities } from '../../application/use-cases/cities/GetCities';

// Use Cases - Waste
import { CreateWaste } from '../../application/use-cases/waste/CreateWaste';
import { SearchWaste } from '../../application/use-cases/waste/SearchWaste';
import { GetWasteById } from '../../application/use-cases/waste/GetWasteById';
import { GetMyWaste } from '../../application/use-cases/waste/GetMyWaste';
import { UpdateWaste } from '../../application/use-cases/waste/UpdateWaste';
import { DeleteWaste } from '../../application/use-cases/waste/DeleteWaste';
import { RequestWastePhone } from '../../application/use-cases/waste/RequestWastePhone';
import { GetWasteCategoryTree } from '../../application/use-cases/waste/GetWasteCategoryTree';

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
    this.repositories.contract = new ApiContractRepository();
    this.repositories.review = new ApiReviewRepository();
    this.repositories.auth = new ApiAuthRepository();
    this.repositories.city = new ApiCityRepository();
    this.repositories.waste = new ApiWasteRepository();
    this.repositories.wasteCategory = new ApiWasteCategoryRepository();

    // Initialize use cases with their dependencies
    // Orders
    this.useCases.createOrder = new CreateOrder(this.repositories.order);
    this.useCases.updateOrder = new UpdateOrder(this.repositories.order);
    this.useCases.deleteOrder = new DeleteOrder(this.repositories.order);
    this.useCases.searchOrders = new SearchOrders(this.repositories.order);
    this.useCases.getCustomerOrders = new GetCustomerOrders(this.repositories.order);
    this.useCases.getOrderOffers = new GetOrderOffers(this.repositories.offer);
    this.useCases.requestBuilderPhone = new RequestBuilderPhone(this.repositories.order);
    this.useCases.confirmDeal = new ConfirmDeal(this.repositories.order);

    // Estates
    this.useCases.manageEstates = new ManageEstates(this.repositories.estate);

    // Offers
    this.useCases.createOffer = new CreateOffer(this.repositories.offer);
    this.useCases.updateOffer = new UpdateOffer(this.repositories.offer);
    this.useCases.withdrawOffer = new WithdrawOffer(this.repositories.offer);
    this.useCases.getBuilderByOffer = new GetBuilderByOffer(this.repositories.offer);

    // Contracts
    this.useCases.completeContract = new CompleteContract(this.repositories.contract);
    this.useCases.getUserContracts = new GetUserContracts(this.repositories.contract);

    // Reviews
    this.useCases.createReview = new CreateReview(this.repositories.review);
    this.useCases.getBuilderReviews = new GetBuilderReviews(this.repositories.review);
    this.useCases.getReview = new GetReview(this.repositories.review);

    // Builders
    this.useCases.searchBuilders = new SearchBuilders(this.repositories.builder);
    this.useCases.getBuilder = new GetBuilder(this.repositories.builder);
    this.useCases.updateBuilder = new UpdateBuilder(this.repositories.builder);

    // Files
    this.useCases.uploadAvatar = new UploadAvatar(this.repositories.file);
    this.useCases.getAvatar = new GetAvatar(this.repositories.file);
    this.useCases.uploadPortfolioPhoto = new UploadPortfolioPhoto(this.repositories.file);
    this.useCases.getPortfolioPhotos = new GetPortfolioPhotos(this.repositories.file);
    this.useCases.deletePortfolioPhoto = new DeletePortfolioPhoto(this.repositories.file);
    this.useCases.uploadOrderPhoto = new UploadOrderPhoto(this.repositories.file);
    this.useCases.getOrderPhotos = new GetOrderPhotos(this.repositories.file);
    this.useCases.deleteOrderPhoto = new DeleteOrderPhoto(this.repositories.file);

    // Auth
    this.useCases.deleteAccount = new DeleteAccount(this.repositories.auth);

    // Categories
    this.useCases.getCategoryTree = new GetCategoryTree(this.repositories.category);

    // Cities
    this.useCases.getCities = new GetCities(this.repositories.city);

    // Waste
    this.useCases.createWaste = new CreateWaste(this.repositories.waste);
    this.useCases.searchWaste = new SearchWaste(this.repositories.waste);
    this.useCases.getWasteById = new GetWasteById(this.repositories.waste);
    this.useCases.getMyWaste = new GetMyWaste(this.repositories.waste);
    this.useCases.updateWaste = new UpdateWaste(this.repositories.waste);
    this.useCases.deleteWaste = new DeleteWaste(this.repositories.waste);
    this.useCases.requestWastePhone = new RequestWastePhone(this.repositories.waste);
    this.useCases.getWasteCategoryTree = new GetWasteCategoryTree(this.repositories.wasteCategory);
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

  getContractRepository() {
    return this.repositories.contract;
  }

  getReviewRepository() {
    return this.repositories.review;
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

  getRequestBuilderPhoneUseCase() {
    return this.useCases.requestBuilderPhone;
  }

  getConfirmDealUseCase() {
    return this.useCases.confirmDeal;
  }

  // Getters for use cases - Estates
  getManageEstatesUseCase() {
    return this.useCases.manageEstates;
  }

  // Getters for use cases - Offers
  getCreateOfferUseCase() {
    return this.useCases.createOffer;
  }

  getUpdateOfferUseCase() {
    return this.useCases.updateOffer;
  }

  getWithdrawOfferUseCase() {
    return this.useCases.withdrawOffer;
  }

  getBuilderByOfferUseCase() {
    return this.useCases.getBuilderByOffer;
  }

  // Getters for use cases - Contracts
  getCompleteContractUseCase() {
    return this.useCases.completeContract;
  }

  getGetUserContractsUseCase() {
    return this.useCases.getUserContracts;
  }

  // Getters for use cases - Reviews
  getCreateReviewUseCase() {
    return this.useCases.createReview;
  }

  getBuilderReviewsUseCase() {
    return this.useCases.getBuilderReviews;
  }

  getGetReviewUseCase() {
    return this.useCases.getReview;
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

  // Getters for use cases - Auth
  getDeleteAccountUseCase() {
    return this.useCases.deleteAccount;
  }

  // Getters for use cases - Categories
  getGetCategoryTreeUseCase() {
    return this.useCases.getCategoryTree;
  }

  // Getters for use cases - Cities
  getGetCitiesUseCase() {
    return this.useCases.getCities;
  }

  // Getters for use cases - Waste
  getCreateWasteUseCase() {
    return this.useCases.createWaste;
  }

  getSearchWasteUseCase() {
    return this.useCases.searchWaste;
  }

  getGetWasteByIdUseCase() {
    return this.useCases.getWasteById;
  }

  getGetMyWasteUseCase() {
    return this.useCases.getMyWaste;
  }

  getUpdateWasteUseCase() {
    return this.useCases.updateWaste;
  }

  getDeleteWasteUseCase() {
    return this.useCases.deleteWaste;
  }

  getRequestWastePhoneUseCase() {
    return this.useCases.requestWastePhone;
  }

  getGetWasteCategoryTreeUseCase() {
    return this.useCases.getWasteCategoryTree;
  }
}

// Export singleton instance
export const container = new ServiceContainer();
