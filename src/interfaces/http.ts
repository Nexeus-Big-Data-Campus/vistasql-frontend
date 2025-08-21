export interface ResponseError {
  error: boolean;
  status: number;
}

export interface HttpOptions {
    body?: string,
    headers?: Record<string, string>;
}

export interface JWTPayload {
  id: string;
  exp: number;
}