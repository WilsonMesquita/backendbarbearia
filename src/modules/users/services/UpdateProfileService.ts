import { injectable, inject } from 'tsyringe';

import IUsersRepository from '../repositories/IUsersRepository';
import IHashProvider from '../providers/HashProvider/models/IHashProvider';
import User from '../infra/typeorm/entities/User';
import AppError from '@shared/errors/AppError';

interface IRequest {
  user_id: string;
  name: string,
  email: string;
  old_password?: string;
  password?: string;
}

@injectable()
export default class UpdateProfileServide {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('HashProvider')
    private hashProvider: IHashProvider
  ) {}

  public async execute ({
    user_id,
    name,
    email,
    old_password,
    password
  }: IRequest): Promise<User> {
    const user = await this.usersRepository.findById(user_id);
    if (!user) {
      throw new AppError('Ops, usuário não encontrado!', 401);
    }

    const userWithUpdateEmail = await this.usersRepository.findByEmail(email);

    if (userWithUpdateEmail && userWithUpdateEmail.id != user.id) {
      throw new AppError('Ops, e-mail em uso!', 401);
    }
    
    user.name = name;
    user.email = email;

    if (password && !old_password) {
      throw new AppError(
        'Ops, você precisa informar a senha antiga para definir uma nova senha!',
        401
      );
    }

    if (password && old_password) {
      const checkOldPassword = await this.hashProvider.compareHash(
        old_password,
        password
      );

      if (!checkOldPassword) {
        throw new AppError(
          'Ops, a senha antiga não confere!',
          401
        );
      }

      user.password = await this.hashProvider.generateHash(password);
    }

    return this.usersRepository.save(user);
  }
}
