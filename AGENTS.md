# Project Rules

## Descriptive Naming Conventions (Clean Code)

All variable, parameter, function, and state names must be **intention-revealing** and **domain-specific**. Follow these rules, verified against Clean Code principles (Robert C. Martin / clean-code-javascript):

### 1. No cryptic abbreviations or single-letter names

Single-letter names (`p`, `e`, `x`) are forbidden except in trivial arrow functions when scope is under 3 lines and the type is obvious.

**Bad:**
```ts
const existing = palettes.find((p) => p.name.toLowerCase() === resolvedName.toLowerCase());
```

**Good:**
```ts
const conflictingPalette = palettes.find(
  (palette) => palette.name.toLowerCase() === resolvedPaletteName.toLowerCase()
);
```

### 2. Names must reveal intent — avoid generic terms

Avoid `data`, `item`, `result`, `value`, `existing`, `tmp`, `obj` when a more specific name is available. The name should answer *what* it holds, not just *that* it holds something.

**Bad:**
```ts
const resolvedName = name.trim() || 'Untitled';
const [duplicateName, setDuplicateName] = useState<string | null>(null);
const handleReplace = () => { ... };
const handleCancel = () => { ... };
```

**Good:**
```ts
const resolvedPaletteName = name.trim() || 'Untitled';
const [conflictingPaletteName, setConflictingPaletteName] = useState<string | null>(null);
const handleReplaceConflictingPalette = () => { ... };
const handleDismissConflict = () => { ... };
```

### 3. Use consistent vocabulary for the same concept

If a thing is a "palette" in one place, call it "palette" everywhere — not "palette" in one spot and "item" or "entity" in another.

| Concept | Consistent prefix | Bad | Good |
|---|---|---|---|
| Palette name conflict | `conflictingPalette` | `existing`, `duplicate` | `conflictingPalette` |
| Resolved display name | `resolvedPaletteName` | `resolvedName`, `finalName` | `resolvedPaletteName` |
| Dismiss a dialog | `handleDismiss...` | `handleCancel`, `handleClose` | `handleDismissConflict` |

### 4. Handler functions must say what they handle and what they do

Event handler names follow the pattern `handle<Verb><Context>` or `on<Verb><Context>` for props.

**Bad:**
```ts
const handleReplace = () => { ... };
const handleRename = () => { ... };
```

**Good:**
```ts
const handleReplaceConflictingPalette = () => { ... };
const handleRenameNewPalette = () => { ... };
```

### 5. State variables must describe their domain

`useState` variable names must include the domain context when the component deals with multiple entities.

**Bad:**
```ts
const [duplicateName, setDuplicateName] = useState<string | null>(null);
```

**Good:**
```ts
const [conflictingPaletteName, setConflictingPaletteName] = useState<string | null>(null);
```

### 6. Component prop names must be self-documenting

Props passed to reusable components should describe the action from the consumer's perspective, not use generic terms.

**Bad:**
```tsx
<DuplicateNameDialog
  onRename={handleRename}
  onReplace={handleReplace}
  onCancel={handleCancel}
/>
```

**Good:**
```tsx
<DuplicateNameDialog
  onChooseRename={handleRenameNewPalette}
  onChooseReplace={handleReplaceConflictingPalette}
  onDismiss={handleDismissConflict}
/>
```

### 7. Don't add unnecessary context

If the component/file already provides context, don't repeat it in every variable. But do include it when the variable lives in a broader scope where domain might be ambiguous.

- Inside `PaletteCard.tsx`: `name` is fine (the card is already a palette)
- Inside `AddPaletteModal.tsx`: `resolvedPaletteName` is better because `name` could be confused with form field name vs. the resolved final name

### 8. Callback parameters must be named, not abbreviated

**Bad:**
```ts
palettes.find((p) => p.id !== palette.id && ...)
```

**Good:**
```ts
palettes.find((candidate) => candidate.id !== palette.id && ...)
```

When iterating a collection of the same type, use `candidate` to differentiate from an already-scoped variable. When iterating a different type, use the full domain name.

## Tech Stack & Tools

- **Lint:** `biome check .` (runs lint + format)
- **TypeCheck:** `tsc --noEmit`
- **Test:** `vitest run`

## graphify

This project has a graphify knowledge graph at .graphify/.

Rules:
- Before answering architecture or codebase questions, read .graphify/GRAPH_REPORT.md for god nodes and community structure
- If .graphify/wiki/index.md exists, navigate it instead of reading raw files
- If .graphify/graph.json is missing but graphify-out/graph.json exists, run `graphify migrate-state --dry-run` first; if tracked legacy artifacts are reported, ask before using the recommended `git mv -f graphify-out .graphify` and commit message
- If .graphify/needs_update exists or .graphify/branch.json has stale=true, warn before relying on semantic results and run the graphify skill with --update when appropriate
- If the user asks to build, update, query, path, or explain the graph, use the installed `graphify` skill instead of ad-hoc file traversal
- Before deep graph traversal, prefer `graphify summary --graph .graphify/graph.json` for compact first-hop orientation
- For review impact on changed files, use `graphify review-delta --graph .graphify/graph.json` instead of generic traversal
- After modifying code files in this session, run `npx graphify hook-rebuild` to keep the graph current
