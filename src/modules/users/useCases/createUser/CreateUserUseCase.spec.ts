import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { CreateUserError } from "./CreateUserError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("should be able to create a user", async () => {
    const user = {
      name: 'John Doe',
      email: 'johndoe@test.com',
      password: '12345'
    }

    const createdUser = await createUserUseCase.execute({
      email: user.email,
      name: user.name,
      password: user.password
    });

    expect(createdUser).toHaveProperty('id');
  })

  it("should not be able to create a user with existing email", async () => {
    await expect(async () => {
      const user1 = {
        name: 'John Doe',
        email: 'johndoe@test.com',
        password: '12345'
      }

      const user2 = {
        name: 'John Doe 2',
        email: user1.email,
        password: '123456'
      }

      await createUserUseCase.execute({
        email: user1.email,
        name: user1.name,
        password: user1.password
      });

      await createUserUseCase.execute({
        email: user2.email,
        name: user2.name,
        password: user2.password
      });
    }).rejects.toBeInstanceOf(CreateUserError)
  })
});
