import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  })

  it("should be able to authenticate an existing user", async () => {
    const user = {
      name: 'John Doe',
      email: 'johndoe@test.com',
      password: '12345'
    }

    await createUserUseCase.execute({
      email: user.email,
      name: user.name,
      password: user.password
    });

    const authenticatedUser = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    expect(authenticatedUser.user).toHaveProperty('id');
    expect(authenticatedUser.token.length).toBeGreaterThan(0);
  })

  it("should not be able to authenticate a with wrong email", async () => {
    await expect(async () => {
      const user = {
        name: 'John Doe',
        email: 'johndoe@test.com',
        password: '12345'
      }

      await createUserUseCase.execute({
        email: user.email,
        name: user.name,
        password: user.password
      });

      await authenticateUserUseCase.execute({
        email: 'wrong email',
        password: user.password
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  })

  it("should not be able to authenticate a with wrong password", async () => {
    await expect(async () => {
      const user = {
        name: 'John Doe',
        email: 'johndoe@test.com',
        password: '12345'
      }

      await createUserUseCase.execute({
        email: user.email,
        name: user.name,
        password: user.password
      });

      await authenticateUserUseCase.execute({
        email: user.email,
        password: 'wrong password'
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  })
});
