import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import User from '../infra/typeorm/entities/User';
import IUsersRepository from '../repositories/IUsersRepository';
import IHashProvider from '../providers/HashProvider/models/IHashProvider';
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';

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
        private hashProvider: IHashProvider ,
        
        @inject('CacheProvider')
        private cacheProvider: ICacheProvider
    ) {}

    public async execute({name, email, password}: IRequest): Promise<User> {

        const checkUserExists = await this.usersRepository.findByEmail(email);

        if (checkUserExists) {
            throw new AppError('Ops, este e-mail já existe!');
        }

        const hashedPasswd = await this.hashProvider.generateHash(password);

        const user = await this.usersRepository.create({
            name,
            email,
            password: hashedPasswd
        });

        await this.cacheProvider.invalidatePrefix('providers-list');

        return user;
    }
}
