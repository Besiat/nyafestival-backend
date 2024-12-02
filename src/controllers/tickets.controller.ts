import { Controller, Headers, Logger, Post, Req, Res, HttpException, HttpStatus, RawBodyRequest, UseInterceptors, UploadedFile, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { TicketService } from "../services/ticket.service";
import { QticketsHookDataDto } from "../dto/qtickets-hook-data.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { createReadStream } from "fs";
import * as csv from 'csv-parser';
import { JwtAuthGuard } from "../guards/jwt-guard";
import { AdminGuard } from "../guards/admin-guard";

@Controller('api/tickets')
export class TicketsController {
    private readonly logger = new Logger(TicketsController.name);

    constructor(private readonly ticketService: TicketService) { }

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
                            ticketNumber: row['Номер билета'], // Adjust column name to match your CSV header
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
}
