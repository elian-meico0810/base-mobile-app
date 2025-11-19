import { AuthRepository } from "../../domain/login/AuthRepository";

export function loginUseCase(repo: AuthRepository) {
  return async (guide: string) => {
    return await repo.login(guide);
  };
}
