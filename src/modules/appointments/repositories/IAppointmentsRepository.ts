import Appointment from "../infra/typeorm/entities/Appointment";
import ICreateAppointmentDTO from '../dtos/ICreateAppointmentDTO';
import IFindAllInMonthFromProviderDTO from '../dtos/IFindAllMonthFromProviderDTO';
import IFindAllInDayFromProviderDTO from '../dtos/IFindAllDayFromProviderDTO';

export default interface IAppointmentsRepository {

    create(data: ICreateAppointmentDTO): Promise<Appointment>;
    findByDate(date:Date, provider_id: string): Promise<Appointment | undefined>;
    findAllInMonthFromProvider(
        data: IFindAllInMonthFromProviderDTO
    ): Promise<Appointment[]>;
    findAllInDayFromProvider(
        data: IFindAllInDayFromProviderDTO
    ): Promise<Appointment[]>;

}
