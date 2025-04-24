import { v4 as uuidv4 } from 'uuid';
import * as qrCode from 'qrcode';
import { Injectable } from '@nestjs/common';
import { failedToGenerateQrCode, Ticket, TicketDto, TicketRepository } from '@paris-2024/server-data-access-ticket';

@Injectable()
export class TicketService {
  constructor(private ticketRepository: TicketRepository) {}

  async createTicket(dto: TicketDto): Promise<Ticket | undefined> {
    const ticketSecret = uuidv4();
    const concatenatedSecrets = dto.userSecret + ticketSecret;
    
    const qrCode = await this.generateQrCode(concatenatedSecrets);

    if (!qrCode) {
      return;
    }

    const newTicket = await this.ticketRepository.create({
      ...dto, qrCode
    })

    return newTicket;
  }

  private async generateQrCode(data: string): Promise<string | undefined> {
    try {
      const appUrl = 'https://studi-exam-jo.lois-kouninef.eu';
      const qrCodeData = `${appUrl}/${data}`
      const qrCodeDataURL = await qrCode.toDataURL(qrCodeData);
      return qrCodeDataURL;
    } catch {
      failedToGenerateQrCode();
      return;
    }
  }

  async getAllTickets(): Promise<Array<Ticket>> {
    return this.ticketRepository.findAll();
  }

  async getUsersTickets(userId: string): Promise<Array<Ticket>> {
    return this.ticketRepository.findAllFromUser(userId);
  }

  async findOneById(id: Ticket['id']): Promise<Ticket | undefined> {
    return await this.ticketRepository.findOneById(id);
  }

  async findValids(): Promise<Array<Ticket> | undefined> {
    return await this.ticketRepository.findValids();
  }

  async isValid(qrCode: Ticket['qrCode']): Promise<boolean> {
    return await this.ticketRepository.isValid(qrCode);
  }
}
