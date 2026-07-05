export type ActionResponse<T = void> = {
  data: T | null;
  error: string | null;
};
