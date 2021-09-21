import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";

let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
  })

  it("should be able to authenticate an existing user", async () => {
    
  })
});