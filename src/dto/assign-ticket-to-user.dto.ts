import { ApiProperty } from "@nestjs/swagger";

export class AssignTicketToUserDto {
    @ApiProperty({ description: 'Ticket number', example: '123' })
    ticketNumber: number;
};