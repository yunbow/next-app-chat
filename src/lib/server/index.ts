/**
 * Server-side utilities index
 */

// Validation
export { validateInput, isValidationError } from "./validation/validate";
export {
  validateNotSelfOperation,
  findUserOrFail,
  findGroupOrFail,
  validateMessageOwnership,
  isError,
} from "./validation/validators";
export {
  validateGroupMembership,
  validateMessageOwnership as validateMessageOwnershipIDOR,
  validateDMAccess,
  validateNotificationOwnership,
  validateFriendRequestAccess,
  isValidationError as isIDORValidationError,
} from "./validation/idor-validators";
export {
  getString,
  getStringOrDefault,
  getJsonArray,
  getFiles,
} from "./validation/form-data";

// Auth
export { requireAuth, isAuthError } from "./auth/require-auth";

// Rate Limiting
export {
  checkActionRateLimit,
  isRateLimitError,
  RATE_LIMITS,
} from "./rate-limit";

// Actions
export {
  createAuthAction,
  createAuthActionWithValidation,
  createAuthActionWithFormValidation,
  type AuthContext,
  type ActionOptions,
} from "./actions/create-action";
