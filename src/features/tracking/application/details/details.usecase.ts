import { DetailsRepository } from "../../domain/details/DetailsRepository";

export function detailsUseCase(repo: DetailsRepository) {
  return async (guide: number) => {
    return await repo.listGuide(guide);
  };
}
