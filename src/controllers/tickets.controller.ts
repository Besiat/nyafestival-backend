import { Controller, Headers, Logger, Post, Res, HttpException, HttpStatus, RawBodyRequest, UseInterceptors, UploadedFile, UseGuards, Param, Req, Body, Get } from "@nestjs/common";
import { Response } from "express";
import { TicketService } from "../services/ticket.service";
import { QticketsHookDataDto } from "../dto/qtickets-hook-data.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { createReadStream } from "fs";
import * as csv from 'csv-parser';
import { JwtAuthGuard } from "../guards/jwt-guard";
import { AdminGuard } from "../guards/admin-guard";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AssignTicketToUserDto } from "../dto/assign-ticket-to-user.dto";

@ApiTags('tickets')
@Controller('api/tickets')
export class TicketsController {
    private readonly logger = new Logger(TicketsController.name);

    constructor(private readonly ticketService: TicketService) { }

    @ApiOperation({ summary: 'Create a ticket from qtickets webhook' })
    @ApiResponse({ status: 200, description: 'Ticket created' })
    @ApiResponse({ status: 400, description: 'Invalid payload' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @Post('qtickets_hook')
    async createTicket(
        @Req() req: RawBodyRequest<Request>,
        @Res() res: Response,
        @Headers('x-signature') signature: string,
        @Headers('x-event-type') eventType: string
    ) {
        if (!signature) {
            this.logger.warn('No signature provided');
            return res.status(200).send('No signature provided');
        }

        if (eventType !== 'payed') {
            this.logger.log(`Ignored event type: ${eventType}`);
            return res.status(200).send();
        }

        try {
            const data = req.body as unknown as QticketsHookDataDto;
            if (data.payed) {
                const tickets = data.baskets.map(basket => ({ ticketNumber: basket.id }));
                await this.ticketService.createTickets(tickets);
                return res.status(200).send('Ticket created');
            } else {
                this.logger.warn('Payed field is missing or false');
                return res.status(200).send('Invalid payload');
            }
        } catch (error) {
            this.logger.error('Error processing webhook', error.stack);
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload tickets via CSV file' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ description: 'CSV file containing tickets', type: 'multipart/form-data' })
    @ApiResponse({ status: 201, description: 'Tickets uploaded successfully' })
    @ApiResponse({ status: 400, description: 'No file uploaded' })
    @ApiResponse({ status: 500, description: 'Error processing CSV' })
    @Post('upload_csv')
    @UseInterceptors(FileInterceptor('file'))
    @UseGuards(JwtAuthGuard, AdminGuard)
    async uploadTickets(@UploadedFile() file: Express.Multer.File): Promise<string> {
        if (!file) {
            this.logger.warn('No file uploaded');
            throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
        }

        try {
            const tickets = [];
            await new Promise((resolve, reject) => {
                const stream = createReadStream(file.path);
                stream
                    .pipe(csv())
                    .on('data', (row) => {
                        tickets.push({
                            ticketNumber: row['Номер билета'],
                        });
                    })
                    .on('end', resolve)
                    .on('error', reject);
            });

            await this.ticketService.createTickets(tickets);

            this.logger.log(`${tickets.length} tickets uploaded successfully`);
            return `${tickets.length} tickets uploaded successfully`;
        } catch (error) {
            this.logger.error('Error processing CSV', error.stack);
            throw new HttpException('Error processing CSV', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Assign a ticket to a user' })
    @ApiBody({ description: 'Ticket number to assign', type: AssignTicketToUserDto })
    @ApiResponse({ status: 200, description: 'Ticket assigned successfully' })
    @ApiResponse({ status: 404, description: 'Ticket not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @Post('assign_ticket')
    @UseGuards(JwtAuthGuard)
    async assignTicketToUser(@Body() body: { ticketNumber: number }, @Req() req): Promise<void> {
        const userId = req.user.userId;
        await this.ticketService.assignTicketToUser(body.ticketNumber, userId);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get ticket number by user' })
    @ApiResponse({ status: 200, description: 'Ticket number retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Ticket not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @Get('get_ticket_number')
    @UseGuards(JwtAuthGuard)
    async getTicketNumberByUser(@Req() req): Promise<number> {
        const userId = req.user.userId;
        return this.ticketService.getTicketNumberByUser(userId);
    }
}
