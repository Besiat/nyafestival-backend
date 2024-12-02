import { InjectRepository } from "@nestjs/typeorm";
import { Ticket } from "../entity/festival/ticket.entity";
import { Repository } from "typeorm";

export class TicketRepository
{
    constructor(@InjectRepository(Ticket) private readonly ticketRepository: Repository<Ticket>) {}

    async getTicket(ticketNumber: number): Promise<Ticket | undefined> {
        return await this.ticketRepository.findOne({ where: { ticketNumber } });
    }

    async createTicket(ticket: Ticket): Promise<Ticket> {
        const newTicket = this.ticketRepository.create(ticket);
        return await this.ticketRepository.save(newTicket);
    }

    async createTickets(tickets: Ticket[]): Promise<Ticket[]> {
        const newTickets = this.ticketRepository.create(tickets);
        return await this.ticketRepository.save(newTickets);
    }
}