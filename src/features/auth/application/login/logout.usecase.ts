import { AuthRepository } from "../../domain/login/AuthRepository";

export function logoutUseCase(repo: AuthRepository) {
  return async () => {
    return await repo.logout();
  };
}
