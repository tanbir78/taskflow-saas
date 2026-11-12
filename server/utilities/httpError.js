
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);

    this.status = status;
    this.details = details;
  }
}

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
