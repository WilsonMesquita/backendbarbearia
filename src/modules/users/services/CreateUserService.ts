import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import User from '../infra/typeorm/entities/User';
import IUsersRepository from '../repositories/IUsersRepository';
import IHashProvider from '../providers/HashProvider/models/IHashProvider';

interface IRequest {
    name: string;
    email: string;
    password: string;
}

@injectable()
export default class CreateUserService {

    constructor(
        @inject('UsersRepository')
        private usersRepository: IUsersRepository,
        
        @inject('HashProvider')
        private hashProvider: IHashProvider    
    ) {}

    public async execute({name, email, password}: IRequest): Promise<User> {

        const checkUserExists = await this.usersRepository.findByEmail(email);

        if (checkUserExists) {
            throw new AppError('Ops, este e-mail já existe!');
        }

        const hashedPasswd = await this.hashProvider.generateHash(password);

        const user = await this.usersRepository.create({
            name, email, password: hashedPasswd
        });

        return user;
    }
}