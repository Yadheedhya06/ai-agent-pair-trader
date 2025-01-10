import { Content } from "@ai16z/eliza";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const validateSearchQuery = (content: Content): string => {
  const query = typeof content === "string" ? content : content.text;
  if (!query?.trim()) {
    throw new ApiError("Search query is required");
  }
  return query.trim();
};

export const handleApiError = (
  error: unknown,
): { success: false; response: string } => {
  if (error instanceof ApiError) {
    return {
      success: false,
      response: `API Error: ${error.message}`,
    };
  }
  return {
    success: false,
    response: "An unexpected error occurred",
  };
};

export const createRateLimiter = (maxRequests: number, timeWindow: number) => {
  const requests: number[] = [];

  return {
    checkLimit: (): boolean => {
      const now = Date.now();
      const windowStart = now - timeWindow;

      // Remove old requests
      while (requests.length > 0 && requests[0] < windowStart) {
        requests.shift();
      }

      // Check if we're at the limit
      if (requests.length >= maxRequests) {
        return false;
      }

      // Add new request
      requests.push(now);
      return true;
    },
  };
};
//TODO : Write format code for api calls