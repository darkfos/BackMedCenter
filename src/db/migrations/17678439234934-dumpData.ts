import { MigrationInterface, QueryRunner } from "typeorm";

export class DumpData17678439234934 implements MigrationInterface {
  name = "17678439234934-dumpData";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Внесение данных в таблицу
    await queryRunner.query(
      `INSERT INTO "med_type" ("name", "icon") 
           VALUES
           ('Терапия', 'icons/therapy_icon.svg'),
           ('Неврология', 'icons/neurology_icon.svg'),
           ('Ортопедия', 'icons/orthopegy_icon.svg'),
           ('Офтальмология', 'icons/oftamology_icon.svg'),
           ('Стоматология', 'icons/stomatology_icon.svg'),
           ('Педиатрия', 'icons/pediatry_icon.svg'),
           ('Диагностика', 'icons/diagnostic_icon.svg')
           `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE FROM "med_type" WHERE "name" IN (
          'Терапия',
          'Неврология',
          'Ортопедия',
          'Офтальмология',
          'Стоматология',
          'Педиатрия',
          'Диагностика'
       )
      `);
  }
}
