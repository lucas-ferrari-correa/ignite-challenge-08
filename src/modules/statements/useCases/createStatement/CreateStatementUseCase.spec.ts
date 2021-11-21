import { rejects } from "assert";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;


describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("should be able to create a new statement from an existing user", async () => {
    const user = await createUserUseCase.execute({
      email: "johndoe@test.com",
      name: "John Doe",
      password: "12345"
    })

    const statement = await createStatementUseCase.execute({
      amount: 100,
      destination_id: null,
      description: "Test",
      type: OperationType.DEPOSIT,
      user_id: String(user.id),
    });

    expect(statement).toHaveProperty('id');
    expect(statement).toHaveProperty('user_id');
  });

  it("should not be able to create a new statement from a non existing user", async () => {
    await expect(async () => {
      await createStatementUseCase.execute({
        amount: 100,
        destination_id: null,
        description: "Test",
        type: OperationType.DEPOSIT,
        user_id: 'non existing user',
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should be able to create a new statement for withdraw operation if funds are sufficient", async () => {
    const user = await createUserUseCase.execute({
      email: "johndoe@test.com",
      name: "John Doe",
      password: "12345"
    });

    await createStatementUseCase.execute({
      amount: 500,
      destination_id: null,
      description: "Test",
      type: OperationType.DEPOSIT,
      user_id: String(user.id),
    });

    const withDrawStatement = await createStatementUseCase.execute({
      amount: 500,
      destination_id: null,
      description: "Test",
      type: OperationType.WITHDRAW,
      user_id: String(user.id),
    });

    expect(withDrawStatement).toHaveProperty('id');
    expect(withDrawStatement).toHaveProperty('user_id');
  });

  it("should not be able to create a new statement for withdraw operation if funds are not sufficient", async () => {
    await expect(async () => {
      const user = await createUserUseCase.execute({
        email: "johndoe@test.com",
        name: "John Doe",
        password: "12345"
      });

      await createStatementUseCase.execute({
        amount: 500,
        destination_id: null,
        description: "Test",
        type: OperationType.DEPOSIT,
        user_id: String(user.id),
      });

      await createStatementUseCase.execute({
        amount: 501,
        destination_id: null,
        description: "Test",
        type: OperationType.WITHDRAW,
        user_id: String(user.id),
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  });
})
