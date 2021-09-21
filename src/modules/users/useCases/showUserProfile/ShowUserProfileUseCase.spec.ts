import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  })

  it("should be able to show user profile", async () => {
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

    const showProfile = await showUserProfileUseCase.execute(String(createdUser.id))

    expect(showProfile).toHaveProperty('id');
  })

  it("should not be able to show profile from non existing user", async () => {
    await expect(async () => {
      await showUserProfileUseCase.execute('non existing user')
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  })
});
