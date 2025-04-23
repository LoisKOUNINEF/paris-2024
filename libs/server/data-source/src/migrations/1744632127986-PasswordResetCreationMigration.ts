import { MigrationInterface, QueryRunner } from "typeorm";

export class PasswordResetCreationMigration1744632127986 implements MigrationInterface {
    name = 'PasswordResetCreationMigration1744632127986'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "password_reset" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "email" text NOT NULL,
                CONSTRAINT "UQ_password_reset_email" UNIQUE ("email"),
                CONSTRAINT "PK_password_reset" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "password_reset"
        `);
    }

}
