export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown
  ) {
    super(
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message: unknown }).message)
        : `Request failed with status ${status}`
    );
    this.name = "ApiError";
  }
}

export async function parseApiError(response: Response): Promise<ApiError> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // Non-JSON error body — leave body as null.
  }
  return new ApiError(response.status, body);
}
