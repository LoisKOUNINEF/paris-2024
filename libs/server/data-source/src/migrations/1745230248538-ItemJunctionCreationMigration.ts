import { MigrationInterface, QueryRunner } from "typeorm";

export class ItemJunctionCreationMigration1745230248538 implements MigrationInterface {
    name = 'ItemJunctionCreationMigration1745230248538'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "item_junction" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "quantity" integer NOT NULL DEFAULT '1',
                "bundle_id" text NOT NULL,
                "cart_id" text,
                "order_id" text,
                CONSTRAINT "PK_item_junction" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_item_junction_cart_id" ON "item_junction" ("cart_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_item_junction_order_id" ON "item_junction" ("order_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_item_junction_order_id"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_item_junction_cart_id"
        `);
        await queryRunner.query(`
            DROP TABLE "item_junction"
        `);
    }

}
