import { MigrationInterface, QueryRunner } from "typeorm";

export class ItemJunctionCreationMigration1745005987368 implements MigrationInterface {
    name = 'ItemJunctionCreationMigration1745005987368'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "item_junction" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "quantity" integer NOT NULL DEFAULT '1',
                "bundleId" character varying NOT NULL,
                "cartId" text,
                "orderId" text,
                CONSTRAINT "PK_item_junction" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_item_junction_cartId" ON "item_junction" ("cartId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_item_junction_orderId" ON "item_junction" ("orderId")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_item_junction_orderId"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_item_junction_cartId"
        `);
        await queryRunner.query(`
            DROP TABLE "item_junction"
        `);
    }

}
