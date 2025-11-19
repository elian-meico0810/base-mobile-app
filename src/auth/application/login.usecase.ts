import { AuthRepository } from "../domain/AuthRepository";

export function loginUseCase(repo: AuthRepository) {
  return async (guide: string) => {
    return await repo.login(guide);
  };
}
