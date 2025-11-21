import { DetailsRepository } from "../../domain/details/DetailsRepository";

export function detailsUseCase(repo: DetailsRepository) {
  return async (guide: number, token: string) => {
    return await repo.listGuide(guide, token);
  };
}
