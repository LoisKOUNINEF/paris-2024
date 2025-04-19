# server-data-source

This library was generated with [Nx](https://nx.dev).

## TypeOrm migrations commands

`nx run server-data-source:migration-create --name=MigrationName`
`nx run server-data-source:migration-generate --name=MigrationName`
`nx run server-data-source:migration-run`
`nx run server-data-source:migration-revert`

*Suffix "Migration" is added to '--name' argument*

Migrations are generated in libs/server/data-source/src/migrations                

### To generate migrations

- ***If new entity***: import it to `server-data-source-entities` library module's import array & static method's return array.

- Change DB_HOST in .env from "postgres" to "localhost".

- Run existing migrations `nx run server-data-source:migration-run`

- Generate new migration `nx run server-data-source:migration-generate --name=MigrationName`

- Rename Constraints (`"PK_[tablename]"`, `"UQ_[tablename]_[columnname]"`...)

- If there are relations, add constraints in migration file:

```sql                             
# Up on table cration:
CONSTRAINT "FK_[tablename]_[referenced_table]" 
FOREIGN KEY ("[referenced_table]_id") 
REFERENCES "[referenced_table]"("id")  
# Add Actions if necessary
ON DELETE SET NULL ON UPDATE CASCADE;                    

# or Up on existing table:
ALTER TABLE "[table_name]" 
ADD CONSTRAINT "FK_[tablename]_[referenced_table]" 
FOREIGN KEY ("[referenced_table]_id") 
REFERENCES "[referenced_table]"("id")                              

# Down: 
ALTER TABLE "table_name" 
DROP CONSTRAINT "FK_[tablename]_[referenced_table]" 
FOREIGN KEY ("[referenced_table]_id") 
REFERENCES "[referenced_table]"("id")
``` 
***Note: Referenced table must exist before being referenced in constraints.***

- Run new migration `nx run server-data-source:migration-run`

- Change DB_HOST in .env from "localhost" to "postgres"

## Running unit tests

Run `nx test server-data-source` to execute the unit tests via [Jest](https://jestjs.io).
