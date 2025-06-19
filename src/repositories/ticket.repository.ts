import { InjectRepository } from "@nestjs/typeorm";
import { Ticket } from "../entity/festival/ticket.entity";
import { Repository } from "typeorm";

export class TicketRepository
{
    constructor(@InjectRepository(Ticket) private readonly ticketRepository: Repository<Ticket>) {}

    async getTicket(ticketNumber: number): Promise<Ticket | undefined> {
        return this.ticketRepository.findOne({ where: { ticketNumber } });
    }

    async createTicket(ticket: Ticket): Promise<Ticket> {
        const newTicket = this.ticketRepository.create(ticket);
        return this.ticketRepository.save(newTicket);
    }

    async createTickets(tickets: Ticket[]): Promise<Ticket[]> {
        const newTickets = this.ticketRepository.create(tickets);
        return this.ticketRepository.save(newTickets);
    }

    async updateTicket(ticket: Ticket): Promise<Ticket> {
        return this.ticketRepository.save(ticket);
    }

    async getTicketByUser(userId: string): Promise<Ticket> {
        return this.ticketRepository.findOne({ where: { userId } });
    }

    async deleteTicketsByUser(userId: string): Promise<void> {
        await this.ticketRepository.delete({ userId });
    }
}