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

    async assignTicketToUser(ticketNumber: number, userId: string): Promise<number | null> {
        const ticket = await this.getTicket(ticketNumber);
        if (!ticket) {
            throw new Error('Ticket not found');
        };

        if (ticket.userId) {
            throw new Error('Ticket already assigned to a user');
        }

        await this.ticketRepository.deleteTicketsByUser(userId);

        ticket.userId = userId;
        await this.ticketRepository.updateTicket(ticket);
        return ticket.ticketNumber;
    }

    async getTicketNumberByUser(userId: string): Promise<number | null> {
        const ticket = await this.ticketRepository.getTicketByUser(userId);
        return ticket?.ticketNumber ?? 0;
    }
}