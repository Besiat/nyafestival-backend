import { Injectable } from "@nestjs/common";
import { Ticket } from "../entity/festival/ticket.entity";
import { TicketRepository } from "../repositories/ticket.repository";

@Injectable()
export class TicketService {
    constructor(private readonly ticketRepository: TicketRepository) {}

    async getTicket(ticketNumber: number) {
        return await this.ticketRepository.getTicket(ticketNumber);
    }

    async createTicket(ticket: Ticket) {
        return await this.ticketRepository.createTicket(ticket);
    }

    async createTickets(tickets: Ticket[]) {
        return await this.ticketRepository.createTickets(tickets);
    }

    async applyTicketForUser(ticketNumber: number, userId: string) {
        const ticket = await this.getTicket(ticketNumber);
        if (!ticket) return false;

        ticket.userId = userId;
        await this.createTicket(ticket);

        return true;
    }
}