export interface ApiResponse<T> {
  statusCode: number;
  data: T | string |null;
  message: string | null;
  success: boolean;
}
