import { randomUUID } from 'crypto';
import * as qrCode from 'qrcode';
import { BadRequestException, Injectable } from '@nestjs/common';
import { failedToGenerateQrCode, QrCodeTicketDto, Ticket, TicketDto, TicketRepository, ticketDoesntExist } from '@paris-2024/server-data-access-ticket';
import { TicketValidity } from '@paris-2024/shared-interfaces';
import { hash } from '@paris-2024/server-utils';
import { EntityManager } from 'typeorm';

export type PreparedTicket = Omit<QrCodeTicketDto, 'orderId'>;

@Injectable()
export class TicketService {
  constructor(private ticketRepository: TicketRepository) {}

  // qr codes do not depend on the order: they can be generated before its transaction is opened
  async prepareTickets(
    dto: Pick<TicketDto, 'userId' | 'userSecret'>,
    amount: number,
  ): Promise<Array<PreparedTicket>> {
    if(!dto.userSecret) { 
      throw new BadRequestException('No user secret key')
    }

    return await Promise.all(
      Array.from({ length: amount }, () => this.prepareTicket(dto)),
    );
  }

  async saveTickets(
    tickets: Array<PreparedTicket>,
    orderId: string,
    manager?: EntityManager,
  ): Promise<Array<Ticket>> {
    if (tickets.length === 0) {
      return [];
    }
    return await this.ticketRepository.createMany(
      tickets.map((ticket: PreparedTicket) => ({ ...ticket, orderId })),
      manager,
    );
  }

  private async prepareTicket(dto: Pick<TicketDto, 'userId' | 'userSecret'>): Promise<PreparedTicket> {
    const token = randomUUID();
    const tokenHash = hash(token);
    const concatenatedSecrets = dto.userSecret + ':' + token;

    // throws when the qr code cannot be generated
    const qrCode = await this.generateQrCode(concatenatedSecrets) as string;

    return { ...dto, qrCode, tokenHash };
  }

  private async generateQrCode(data: string): Promise<string | undefined> {
    try {
      const appUrl = 'https://studi-exam-jo.lois-kouninef.eu/staff/ticket-validity';
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

  async isValid(qrCode: Ticket['qrCode']): Promise<TicketValidity | null> {
    const [userSecret, ticketToken] = qrCode.split(':');
    if (!userSecret || !ticketToken) {
      ticketDoesntExist();
      return null;
    }
    const hashedToken = hash(ticketToken);

    return await this.ticketRepository.isValid(userSecret, hashedToken);
  }
}
