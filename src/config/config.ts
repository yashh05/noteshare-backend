const ERROR_MESSAGES = {
  INVALID_ENV_VAR: "Invalid Environment Variable",
  TOKEN_CREATION_ERROR: "Error creating token",
  UNAUTHORIZED_USER: "user is not authorized",
  WRONG_PASSWORD: "Wrong password",
  USER_NOT_FOUND: "User not found",
  INTERNAL_SERVER_ERROR: "Internal server error",
  DUPLICATE_DOC: "change document name",
  INVALID_DOC: "invalid doc",
  ACCESS_CHANGE_NOT_ALLOWED: "Only the owner can change access",
  EMAIL_NOT_REGISTERED: "Entered email is not registered",
  DOCNAME_EXISTS: "Entered name already exits",
};

const SUCCESS_MESSAGES = {
  DOC_CREATED: "New document created",
  ACCESS_GRANTED: "Access granted successfully",
  ACCESS_REMOVED: "Access removed successfully",
};

export { SUCCESS_MESSAGES, ERROR_MESSAGES };
