import { MigrationInterface, QueryRunner } from "typeorm";

export class BundleCreationMigration1745018524349 implements MigrationInterface {
    name = 'BundleCreationMigration1745018524349'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "bundle" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "name" text NOT NULL,
                "price" integer NOT NULL,
                "ticketAmount" integer NOT NULL,
                "isAvailable" boolean NOT NULL DEFAULT true,
                CONSTRAINT "UQ_bundle_name" UNIQUE ("name"),
                CONSTRAINT "CHK_bundle_ticketAmount" CHECK ("ticketAmount" > 0),
                CONSTRAINT "CHK_bundle_price" CHECK ("price" > 0),
                CONSTRAINT "PK_bundle" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "bundle"
        `);
    }

}
