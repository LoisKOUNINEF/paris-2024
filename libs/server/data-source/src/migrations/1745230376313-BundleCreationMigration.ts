import { MigrationInterface, QueryRunner } from "typeorm";

export class BundleCreationMigration1745230376313 implements MigrationInterface {
    name = 'BundleCreationMigration1745230376313'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "bundle" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "name" text NOT NULL,
                "price" integer NOT NULL,
                "ticket_amount" integer NOT NULL,
                "is_available" boolean NOT NULL DEFAULT true,
                CONSTRAINT "UQ_bundle_name" UNIQUE ("name"),
                CONSTRAINT "CHK_bundle_ticket_amount" CHECK ("ticket_amount" > 0),
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
