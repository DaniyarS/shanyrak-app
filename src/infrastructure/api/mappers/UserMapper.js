import { User } from '../../../domain/entities/User';

/**
 * UserMapper - Maps between API DTOs and User Domain Entities
 */
export class UserMapper {
  /**
   * Map API response to User entity
   */
  static toDomain(apiData) {
    if (!apiData) return null;

    return new User({
      phone: apiData.phone,
      fullName: apiData.fullName,
      role: apiData.role || 'CUSTOMER',
    });
  }

  /**
   * Map User entity to registration DTO
   */
  static toRegisterDTO(user, password) {
    return {
      phone: user.phone,
      fullName: user.fullName,
      password: password,
      role: user.role,
    };
  }

  /**
   * Map login credentials to DTO
   */
  static toLoginDTO(phone, password) {
    return {
      phone,
      password,
    };
  }
}
