import { startOfHour, isBefore, getHours, format } from 'date-fns';
import { injectable, inject } from 'tsyringe';
import ptBR from 'date-fns/locale/pt-BR';

import AppError from '@shared/errors/AppError';
import Appointment from '../infra/typeorm/entities/Appointment';
import IAppointmentsRepository from '../repositories/IAppointmentsRepository';
import INotificationsRepository from '@modules/notifications/repositories/INotificationsRepository';
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';
import CreateNotificationService from '@modules/notifications/services/CreateNotificationService';

interface IRequest {
    provider_id: string;
    user_id: string;
    date: Date;
}

@injectable()
export default class CreateAppointmentService {

    constructor(
        @inject('AppointmentsRepository')
        private appointmentsRepository: IAppointmentsRepository,

        @inject('NotificationsRepository')
        private notificationsRepository: INotificationsRepository,

        @inject('CacheProvider')
        private cacheProvider: ICacheProvider
    ) {}

    public async execute({ date, provider_id, user_id }: IRequest):
    Promise<Appointment> {        
        const appointmentDate = startOfHour(date);

        if (isBefore(appointmentDate, Date.now())) {
            throw new AppError(
                'Ops, você não pode criar um compromisso em uma data que já passou!'
            );
        }

        if (user_id === provider_id) {
            throw new AppError(
                'Ops, você não pode criar um compromisso consigo mesmo!'
            );
        }

        if (getHours(appointmentDate) < 8 || getHours(appointmentDate) > 17) {
            throw new AppError(
                'Ops, você só pode agendar horário entre 8h e 17h!'
            );
        }

        const findAppointmentInSameDate =
        await this.appointmentsRepository.findByDate(appointmentDate);

        if (findAppointmentInSameDate) {
            throw new AppError('Ops, este agendamento já existe!');
        }

        const appointment = await this.appointmentsRepository.create({
            provider_id,
            user_id,
            date: appointmentDate
        });

        const dateFormatted = format(appointmentDate, "dd/MM/yyyy 'às' HH:mm 'horas'");

        await this.notificationsRepository.create({
            recipient_id: provider_id,
            content: `Novo agendamento para o dia ${dateFormatted}`
        });

        const createNotification = container.resolve(CreateNotificationService);

        const user = await appointment.user;

        const appointmentDateFormatted = format(
            appointmentDate,
            "dd 'de' MMMM 'às' HH:mm'horas'",
            { locale: ptBR }
        );

        await createNotification.execute({
            recipient_id: provider_id,
            content: `Novo agendamento com ${user.name}, dia ${appointmentDateFormatted}`
        });

        await this.cacheProvider.invalidate(
            `provider-appointments:${provider_id}:${format(
                appointmentDate,
                'yyyy-M-d'
            )}`
        );
        
        return appointment;
    }
}
