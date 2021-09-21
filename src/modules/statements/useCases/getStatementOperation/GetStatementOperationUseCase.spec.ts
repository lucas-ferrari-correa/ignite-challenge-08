import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;


describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("should be able to get statement operation from an existing user and existing statement", async () => {
    const user = await createUserUseCase.execute({
      email: "johndoe@test.com",
      name: "John Doe",
      password: "12345"
    });

    const statement = await createStatementUseCase.execute({
      amount: 100,
      description: 'Test',
      type: OperationType.DEPOSIT,
      user_id: String(user.id)
    })

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: String(user.id),
      statement_id: String(statement.id)
    });

    expect(statementOperation).toHaveProperty('id');
    expect(statementOperation).toHaveProperty('user_id');
  });

  it("should not be able to get statement operation from an non existing user", async () => {
    await expect(async () => {
      const user = await createUserUseCase.execute({
        email: "johndoe@test.com",
        name: "John Doe",
        password: "12345"
      });

      const statement = await createStatementUseCase.execute({
        amount: 100,
        description: 'Test',
        type: OperationType.DEPOSIT,
        user_id: String(user.id)
      })

      await getStatementOperationUseCase.execute({
        user_id: 'non existing user',
        statement_id: String(statement.id)
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  });

  it("should not be able to get statement operation from an non existing statement", async () => {
    await expect(async () => {
      const user = await createUserUseCase.execute({
        email: "johndoe@test.com",
        name: "John Doe",
        password: "12345"
      });

      await getStatementOperationUseCase.execute({
        user_id: String(user.id),
        statement_id: 'non existing statement'
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  });
})
