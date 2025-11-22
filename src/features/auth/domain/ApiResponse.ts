export interface ApiResponse<T> {
  statusCode: number;
  data: T | T[] | string | null;
  message: string | null;
  success: boolean;
}
