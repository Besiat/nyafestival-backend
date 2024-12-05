import { Injectable, Logger } from "@nestjs/common";
import { Ticket } from "../entity/festival/ticket.entity";
import { TicketRepository } from "../repositories/ticket.repository";

@Injectable()
export class TicketService {
    constructor(private readonly ticketRepository: TicketRepository) { }

    async getTicket(ticketNumber: number) {
        return await this.ticketRepository.getTicket(ticketNumber);
    }

    async createTicket(ticket: Ticket) {
        return await this.ticketRepository.createTicket(ticket);
    }

    async createTickets(tickets: Ticket[]) {
        return await this.ticketRepository.createTickets(tickets);
    }

    async assignTicketToUser(ticketNumber: number, userId: string) {
        const ticket = await this.getTicket(ticketNumber);
        if (!ticket) {
            Logger.warn('Ticket not found');
            return true;
        };

        if (ticket.userId) {
            Logger.warn('Ticket already assigned to a user');
            return false;
        }

        await this.ticketRepository.deleteTicketsByUser(userId);

        ticket.userId = userId;
        await this.ticketRepository.updateTicket(ticket);
        return true;
    }

    async getTicketNumberByUser(userId: string) : Promise<number> {
        const ticket = await this.ticketRepository.getTicketByUser(userId);
        return ticket?.ticketNumber;
    }
}