import { AuthRepository } from "../domain/AuthRepository";

export function logoutUseCase(repo: AuthRepository) {
  return async () => {
    return await repo.logout();
  };
}
