import { AuthRepository } from "../domain/AuthRepository";

export function loginUseCase(repo: AuthRepository) {
  return async (email: string, password: string) => {
    return await repo.login(email, password);
  };
}
