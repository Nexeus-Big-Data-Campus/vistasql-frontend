Directory to develop and store treesitter grammars

## Getting started

https://tree-sitter.github.io/tree-sitter/creating-parsers/1-getting-started.html

1. Make changes
2. Generate 

    ` npx tree-sitter generate`

3. Test

    `npx tree-sitter parse tests/select.sql`

4. Build to wasm

    `npx tree-sitter build -w`