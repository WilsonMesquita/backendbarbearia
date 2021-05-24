import { uuid } from 'uuidv4';
import { isEqual } from 'date-fns';

import IAppointmentRepository from '@modules/appointments/repositories/IAppointmentsRepository';
import Appointment from '../../infra/typeorm/entities/Appointment';
import ICreateAppointmentDTO from '@modules/appointments/dtos/ICreateAppointmentDTO';
import IFindAllDayFromProviderDTO from '@modules/appointments/dtos/IFindAllDayFromProviderDTO';
import IFindAllMonthFromProviderDTO from '@modules/appointments/dtos/IFindAllMonthFromProviderDTO';

export default class AppointmentsRepository implements IAppointmentRepository {
    findAllInMonthFromProvider(data: IFindAllMonthFromProviderDTO):
    Promise<Appointment[]> {
        throw new Error('Method not implemented.');
    }
    findAllInDayFromProvider(data: IFindAllDayFromProviderDTO):
    Promise<Appointment[]> {
        throw new Error('Method not implemented.');
    }

    private appointments: Appointment[] = [];

    public async findByDate(date: Date): Promise<Appointment | undefined> {
        const findAppointment = this.appointments.find(
            appointment => isEqual(appointment.date, date),
        );

        return findAppointment;
    }

    public async create({
        provider_id,
        user_id,
        date
    }: ICreateAppointmentDTO): Promise<Appointment> {
        
        const appointment = new Appointment();

        Object.assign(appointment, { id: uuid(), date, provider_id, user_id });

        this.appointments.push(appointment);

        return appointment;
    };
}
