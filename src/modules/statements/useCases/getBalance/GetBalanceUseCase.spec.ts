import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";


let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;


describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  });

  it("should be able to get balance from an existing user", async () => {
    const user = await createUserUseCase.execute({
      email: "johndoe@test.com",
      name: "John Doe",
      password: "12345"
    })

    const balance = await getBalanceUseCase.execute({
      user_id: String(user.id)
    });

    expect(balance).toHaveProperty('statement');
    expect(balance).toHaveProperty('balance');
  });

  it("should not be able to get balance from a non existing user", async () => {
    await expect(async () => {
      await getBalanceUseCase.execute({
        user_id: 'non existing user'
      })
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
})
