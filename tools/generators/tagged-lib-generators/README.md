# Generate libraries with tags for Angular, NestJs and common libraries.

- ## [Usage](#usage)
- ## [Angular libraries generator](#angular-libraries-generators-1)
- ## [NestJs libraries generator](#nestjs-libraries-generators-1)
- ## [Common libraries generator](#common-libraries-generators-1)

## Usage

Argument for name can be added to the generator command; if not, it will prompt for name.                 
*Library name will be {scope}-{type}-{name}*

If 'directory' option prompt is left empty, library will be generated at: libs/{scope}/{type}/{name}.

Test configuration files will also be generated.

## Angular libraries generator.

Use with `nx g @paris-2024/tagged-lib-generators:angular-tagged-lib`.

## NestJs libraries generator.

Use with `nx g @paris-2024/tagged-lib-generators:nest-tagged-lib`.

## Common libraries generator.

Use with `nx g @paris-2024/tagged-lib-generators:tagged-lib`.
