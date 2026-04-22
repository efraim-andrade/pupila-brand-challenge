<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Code Style & Engineering Standards

## Frontend Specialist Guidelines
- Use React Server Components by default; add `"use client"` only when interactivity or browser APIs are needed
- Colocate component state as close to the usage as possible — lift only when truly shared
- Prefer custom hooks to extract stateful logic from components; keep hooks focused on one concern
- Use TypeScript strictly: no `any`, explicit return types on exported functions, discriminated unions for complex state
- Prefer named exports over default exports for components (aids refactoring and tree-shaking)
- Always type event handlers explicitly (`React.ChangeEvent<HTMLInputElement>`, etc.)
- Use `const` arrow functions for components; keep JSX readable by extracting sub-expressions into named variables
- Avoid inline object/array literals in JSX props that cause needless re-renders; extract or memoize them

## Clean Code Principles
- **Single responsibility**: each function and component does one thing — if you need "and" to describe it, split it
- **Expressive naming**: names should reveal intent; avoid abbreviations, generic names (`data`, `info`, `handler`), Hungarian notation, and single-letter or meaningless names (`a`, `s`, `x`, `temp`, `val`) — every variable, parameter, and callback argument must be descriptive enough to understand without reading its type or surrounding context
- **No comments for what**: well-named identifiers explain the what; only comment the *why* when it is non-obvious
- **Small units**: functions under ~20 lines, components under ~100 lines; extract when they grow
- **No premature abstraction**: duplicate twice, abstract the third time with a concrete use case in mind
- **Pure functions first**: prefer functions with no side effects; isolate side effects at the edges (event handlers, effects)
- **Avoid deep nesting**: use early returns, guard clauses, and extraction to keep indentation shallow
- **Consistent abstraction levels**: a function should operate at one level of abstraction — mix not high-level orchestration with low-level details


