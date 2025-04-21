import { MigrationInterface, QueryRunner } from "typeorm";

export class TicketCreationMigration1745230490926 implements MigrationInterface {
    name = 'TicketCreationMigration1745230490926'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "ticket" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "qr_code" text NOT NULL,
                "order_id" text NOT NULL,
                "user_id" text NOT NULL,
                "is_valid" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_d9a0835407701eb86f874474b7c" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ticket_qrCode" ON "ticket" ("qr_code")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ticket_user" ON "ticket" ("user_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ticket_user"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ticket_qrCode"
        `);
        await queryRunner.query(`
            DROP TABLE "ticket"
        `);
    }

}
