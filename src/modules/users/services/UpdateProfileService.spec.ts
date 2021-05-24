import AppError from '@shared/errors/AppError';
import FakeHashProvider from '../providers/HashProvider/fakes/FakeHashProvider';
import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository';
import UpdateProfileService from './UpdateProfileService';

let fakeUsersRepository: FakeUsersRepository;
let fakeHashProvider: FakeHashProvider;
let showProfile: UpdateProfileService;

describe('UpdateProfile', () => {

  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeHashProvider = new FakeHashProvider();
    showProfile = new UpdateProfileService(
      fakeUsersRepository,
      fakeHashProvider)
    ;
  });

  it('should be able update the profile', async () => {
    const user = await fakeUsersRepository.create({
      name: 'Fulano',
      email: 'fulano@exemplo.com.br',
      password: '123456'
    });

    // const updateUser = await updateProfile.execute({
    //   user_id: user.id,
    //   name: 'Outro Fulano',
    //   email: 'outrofulano@exemplo.com.br'
    // });

    // expect(updateUser.name).toBe('Outro Fulano');
    // expect(updateUser.email).toBe('outrofulano@exemplo.com.br');
  });

  // it('should not be able update the profile non-existing user', async () => {
  //   expect(
  //     updateProfile.execute({
  //       user_id: 'non-existing-user-id',
  //       name: 'Teste',
  //       email: 'teste@exemplo.com.br'
  //     }),
  //   ).rejects.toBeInstanceOf(AppError);
  // });

  it('should not be able to change to another user email', async () => {
    await fakeUsersRepository.create({
      name: 'Fulano',
      email: 'fulano@exemplo.com.br',
      password: '123456'
    });

    // const user = await fakeUsersRepository.create({
    //   name: 'Test',
    // });
  });
});
