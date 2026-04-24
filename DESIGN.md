# Sistema de Gerenciamento de Paletas e Imagens — Design de Alto Nível

## 1. Arquitetura Geral

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js App                             │
│                                                                 │
│   ┌──────────────┐   ┌────────────────────────────────────┐     │
│   │              │   │              Pages                 │     │
│   │   Sidebar    │   │   /images    │    /palettes        │     │
│   │    + Nav     │   └────────────────────────────────────┘     │
│   │              │              │                               │
│   └──────────────┘    ┌─────────▼────────────────────────┐      │
│                       │      Feature Modules             │      │
│                       │  ImageModule  │  PaletteModule   │      │
│                       └─────────────┬────────────────────┘      │
│                                     │                           │
│                       ┌─────────────▼────────────────────┐      │
│                       │     Shared Components            │      │
│                       │  Toolbar  GroupSelector          │      │
│                       │  TagPicker  CommentsSection      │      │
│                       │  Modal                           │      │
│                       └─────────────┬────────────────────┘      │
│                                     │                           │
│   ┌─────────────────────────────────▼────────────────────┐      │
│   │                 Zustand Store                        │      │
│   │  imagesSlice │ palettesSlice │ uiSlice │ organization│      │
│   └─────────────────────────────────┬────────────────────┘      │
│                                     │                           │
│   ┌─────────────────────────────────▼────────────────────┐      │
│   │              Persistence Layer                       │      │
│   │              IndexedDB (via idb)                     │      │
│   └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

```
┌────────────────────┐
│  Ação do usuário   │
└─────────┬──────────┘
          │
          ▼
┌─────────────────────────────┐
│  UI Component               │
└─────────┬───────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│  Action (Zustand)                   │
│  ──────────────────► Reducer/Mutator│
└────────────────────┬────────────────┘
                     │
                     ▼
┌─────────────────────────────────────┐
│  Direct DB call (fire-and-forget)   │
│  imageDB.put / paletteDB.put / etc. │
└────────────────────┬────────────────┘
                     │
                     ▼
                 IndexedDB
                     │
                     ▼
    (rehydration na inicialização)

Fluxo paralelo — sugestão de tags por IA:
┌────────────────────────────────────────────┐
│  useTagSuggestions (debounce 1200ms)        │
│  → POST /api/suggest-tags { imageUrl }      │
│  → Groq API (LLaMA 4-scout vision)          │
│  → { group: string|null, tags: string[] }   │
│  → AiSuggestionBar exibe e permite aplicar  │
└────────────────────────────────────────────┘
```

### Modelo de Estado Global

```typescript
// Estado real do store (flat — não aninhado)
interface AppStore {
  // ImagesSlice
  images: Image[]
  imagesViewMode: ViewMode          // 'grid' | 'list'
  imagesFilter: FilterState

  // PalettesSlice
  palettes: ColorPalette[]
  palettesViewMode: ViewMode
  palettesFilter: FilterState

  // OrganizationSlice
  groups: Group[]
  tags: Tag[]

  // UISlice
  sidebarOpen: boolean
  modal: ModalState | null
  hydrated: boolean                 // true após rehydration do IndexedDB
}

interface FilterState {
  search: string        // busca por nome, comentário ou tag
  groupId: string | null
  tagIds: string[]
}
```

---

## 2. Componentes Principais

### Estrutura de Pastas

```
src/
├── app/                     # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx            # redirect → /images
│   ├── images/page.tsx
│   ├── palettes/page.tsx
│   ├── statistics/
│   │   ├── page.tsx
│   │   └── components/           # StatCard, GroupsChart, GroupsTable, TagsChart, TagsTable, EmptyState
│   └── api/
│       ├── image-proxy/route.ts    # proxy para imagens cross-origin
│       └── suggest-tags/route.ts  # sugestão de tags via IA (Groq)
│
├── features/
│   ├── images/
│   │   ├── components/
│   │   │   ├── ImageGrid.tsx
│   │   │   ├── ImageCard.tsx
│   │   │   ├── AddImageModal.tsx
│   │   │   ├── EditImageModal.tsx
│   │   │   ├── ImageViewModal.tsx
│   │   │   ├── ImagesToolbar.tsx       # wrapper de Toolbar para images
│   │   │   ├── AiSuggestionBar.tsx     # barra de sugestões de grupo/tags via IA
│   │   │   └── CreatePaletteFromImageModal.tsx
│   │   ├── hooks/
│   │   │   ├── useImagesPage.ts
│   │   │   └── useTagSuggestions.ts   # debounce + chamada à /api/suggest-tags
│   │   └── lib/
│   │       └── filterImages.ts
│   │
│   ├── palettes/
│   │   ├── components/
│   │   │   ├── PaletteGrid.tsx
│   │   │   ├── PaletteCard.tsx
│   │   │   ├── AddPaletteModal.tsx
│   │   │   ├── EditPaletteModal.tsx
│   │   │   ├── PaletteViewModal.tsx
│   │   │   ├── PalettesToolbar.tsx     # wrapper de Toolbar para palettes
│   │   │   └── ColorEditor.tsx
│   │   ├── hooks/
│   │   │   └── usePalettesPage.ts
│   │   └── lib/
│   │       ├── colorEditorUtils.ts
│   │       └── filterPalettes.ts
│   │
│   └── dashboard/
│       └── components/
│           └── ConfigurationModal.tsx
│
├── shared/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── GroupSelector.tsx
│   │   ├── TagPicker.tsx
│   │   ├── CommentsSection.tsx
│   │   └── StoreHydrator.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── ModalWithContent.tsx    # wrapper de Modal com layout de conteúdo
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Comment.tsx             # exibição de comentário individual com ações
│       ├── ConfirmDialog.tsx       # modal de confirmação para ações destrutivas
│       ├── Select.tsx
│       └── Toolbar.tsx             # toolbar genérica compartilhada
│
├── store/
│   ├── index.ts
│   ├── imagesSlice.ts
│   ├── palettesSlice.ts
│   ├── organizationSlice.ts
│   ├── uiSlice.ts
│   └── useGroups.ts
│
├── lib/
│   ├── db.ts
│   ├── exportImport.ts
│   ├── colorUtils.ts
│   ├── colors.ts
│   └── mockData.ts
│
└── types/
    └── index.ts
```

### Responsabilidades por Componente

| Componente | Responsabilidade |
|---|---|
| `AppShell` | Layout global, sidebar, roteamento entre módulos |
| `ImageGrid` / `PaletteGrid` | Renderiza lista/grade, aplica filtros do store |
| `ImageCard` / `PaletteCard` | Item visual com ações rápidas (editar, deletar, tag) |
| `AddImageModal` / `AddPaletteModal` | Formulário para criar novo item |
| `EditImageModal` / `EditPaletteModal` | Formulário para editar item existente |
| `PaletteViewModal` | Visão expandida de paleta com cores |
| `ImageViewModal` | Visualização em tela cheia de imagem |
| `ColorEditor` | Ajuste de cor via HEX / RGB / HSL / picker nativo |
| `AiSuggestionBar` | Exibe sugestões de grupo e tags geradas pela IA; permite aplicar com um clique |
| `Toolbar` | Toolbar genérica compartilhada: busca, filtro por grupo/tag, viewMode, botão de ação |
| `ImagesToolbar` / `PalettesToolbar` | Wrappers de `Toolbar` com props específicas do domínio |
| `GroupSelector` | Seleção de grupo para itens |
| `TagPicker` | Seleção múltipla de tags |
| `CommentsSection` | Lista de comentários com add/edit/delete; usa `Comment` para cada item |
| `Comment` | Exibe um comentário individual com ações de editar/deletar inline |
| `ConfirmDialog` | Modal de confirmação reutilizável para ações destrutivas (ex.: deletar paleta) |
| `ModalWithContent` | Wrapper de `Modal` com layout padronizado (header + conteúdo + footer) |
| `ConfigurationModal` | Configurações do app (grupos, tags, export/import) |
| `StatCard` / `GroupsChart` / `GroupsTable` / `TagsChart` / `TagsTable` | Componentes da página `/statistics`: contadores e gráficos de uso de grupos e tags |
| `image-proxy` (API route) | Proxy server-side para contornar CORS ao buscar imagens externas |
| `suggest-tags` (API route) | Envia URL da imagem ao Groq (LLaMA 4-scout) e retorna sugestões de grupo e tags |

---

## 3. Estratégia de Gerenciamento de Dados

### Modelo de Dados

```typescript
interface Image {
  id: string
  url: string
  name: string
  groupId: string | null
  tagIds: string[]
  comments: Comment[]
  extractedPaletteId?: string   // paleta gerada a partir da imagem
  createdAt: string             // ISO 8601
  updatedAt: string
}

interface ColorPalette {
  id: string
  name: string
  colors: Color[]
  groupId: string | null
  tagIds: string[]
  comments: Comment[]
  sourceImageId?: string
  createdAt: string
  updatedAt: string
}

interface Color {
  hex: string                   // #RRGGBB — fonte da verdade
  name?: string
}

interface Group {
  id: string
  name: string
  type: 'image' | 'palette' | 'shared'
  color?: string
}

interface Tag {
  id: string
  name: string
  color?: string
}

interface Comment {
  id: string
  text: string
  createdAt: string
  updatedAt: string
}

// Usado na exportação/importação de dados
interface ExportData {
  version: 1
  exportedAt: string
  images: Image[]
  palettes: ColorPalette[]
  groups: Group[]
  tags: Tag[]
}

type ModalType =
  | 'addImage' | 'editImage'
  | 'addPalette' | 'editPalette' | 'viewPalette'
  | 'createPaletteFromImage'
  | 'colorEditor'
  | 'exportImport'
  | 'configuration'
```

### Persistência

```
┌────────────────────────────────────┐
│  IndexedDB (via idb)               │
└────────────────────────────────────┘

   DB name: "pupila-brand-zone"  version: 1

   Object stores:
   ┌───────────┬────────────┬────────────────────┐
   │  Store    │  Key path  │  Indexes           │
   ├───────────┼────────────┼────────────────────┤
   │  images   │  id        │  by_group (groupId)│
   │  palettes │  id        │  by_group (groupId)│
   │  groups   │  id        │  —                 │
   │  tags     │  id        │  —                 │
   └───────────┴────────────┴────────────────────┘

   Sincronização: cada ação do store chama
   diretamente DB.put() / DB.delete() (fire-and-forget)

┌────────────────────────────────────┐
│  Hidratação na inicialização:      │
└────────────────────────────────────┘
         app/layout.tsx → <StoreHydrator /> (Client Component)
                        └── lê IndexedDB → popula store → seta hydrated: true
```

### Busca e Filtragem

```
┌────────────────────────────────────┐
│  Filtragem no lado cliente         │
│  (dados já em memória)             │
└────────────────────────────────────┘
         │
         ▼
      useMemo(() => {
        return items
          .filter(byGroup)
          .filter(byTags)        // AND semântico entre tags
          .filter(bySearchText) // name | comments[].text | tags
      }, [items, filters])

┌────────────────────────────────────┐
│  Busca textual:                    │
└────────────────────────────────────┘
       normalização: lowercase + remove acentos
       campos: name, comments[].text, tag names resolvidas
       debounce 200ms no input
```

---

## 4. Decisões Técnicas

### Stack e Justificativas

| Tecnologia | Decisão | Justificativa |
|---|---|---|
| **Next.js 16 (App Router)** | Framework principal | Roteamento baseado em arquivo, Server/Client Components, ecossistema sólido |
| **TypeScript strict** | Obrigatório | Segurança de tipos em domínio com muitas entidades relacionadas |
| **Zustand 5** | State management | API simples, sem boilerplate, suporte nativo a slices |
| **idb** | IndexedDB wrapper | API Promise-based, tipada, sem overhead de ORM |
| **Tailwind CSS 4** | Estilização | Utilitários inline evitam saltos de contexto, consistência visual fácil |
| **sonner** | Toast notifications | API simples, integra nativamente com React 19 |
| **recharts** | Gráficos | Biblioteca declarativa para visualizações de dados (usada na página de estatísticas) |
| **@dnd-kit/core + sortable** | Drag-and-drop | Acessível, headless, funciona bem com React 19 |
| **Groq API (LLaMA 4-scout)** | IA para sugestão de tags | Vision LLM — analisa a imagem e sugere grupo + tags; configurado via `GROQ_API_KEY` |
| **Jest + Testing Library** | Testes | Integração nativa via `next/jest`, API familiar |

### Padrões de Design

- **Slice pattern (Zustand):** cada domínio tem seu slice com estado + ações colocalizados
- **Feature-based folders:** cada feature é auto-contida; imports cruzados só via `index.ts`
- **Custom hooks como API:** componentes consomem `useImagesPage()` / `usePalettesPage()`, nunca acessam o store diretamente
- **Toolbar genérica compartilhada:** `ImagesToolbar` e `PalettesToolbar` são wrappers finos em torno de `Toolbar`, que contém toda a lógica de UI
- **Derivação > duplicação:** estatísticas e contagens são derivadas via `useMemo`, nunca persistidas
- **Optimistic UI:** mutações locais são imediatas; persistência no IndexedDB é fire-and-forget

### Considerações de Desempenho

- Lazy load de imagens com `<Image>` do Next.js (lazy + blur placeholder)
- `useMemo` / `useCallback` aplicados nos pontos de filtragem — não globalmente
- IndexedDB operações em batch na exportação/importação para evitar travamento do thread
- Proxy server-side (`/api/image-proxy`) para imagens externas com CORS, com cache de 1h no header

### Considerações de Usabilidade

- Feedback imediato em todas as ações via `sonner` (toast)
- Confirmação explícita (`ConfirmDialog`) apenas para exclusão permanente
- Drag-and-drop para reordenar cores dentro de uma paleta (`@dnd-kit/sortable`)
- Sugestões de grupo/tags por IA com debounce (1200ms) e aplicação opcional com um clique

### Estratégia de Testes

```
┌────────────────────────────────────┐
│  Cobertura prioritária:            │
└────────────────────────────────────┘
   1. colorUtils.ts            → pure functions: hex ↔ rgb ↔ hsl, contraste
   2. store slices             → ações e seletores com estado mockado
   3. exportImport.ts          → serialização/desserialização JSON round-trip
   4. filterPalettes.ts        → lógica de filtragem combinada
   5. filterImages.ts          → lógica de filtragem para imagens
   6. colorEditorUtils.ts      → utilitários do editor de cores
   7. useTagSuggestions.ts     → hook de sugestão via IA (Groq)
   8. suggest-tags (API route) → endpoint de sugestão de tags
   9. Toolbar / UI atoms       → comportamento de interação

┌────────────────────────────────────┐
│  Integração:                       │
└────────────────────────────────────┘
     Fluxo completo:
     adicionar imagem → extrair paleta → salvar → exportar

     Persistência:
     escrever no IDB → recarregar store → checar dados

┌────────────────────────────────────┐
│  O que NÃO testar unitariamente:   │
└────────────────────────────────────┘
     Renderização visual  → coberto por testes e2e futuros
```

---

## 5. Diagrama de Fluxo — Caso de Uso Principal

```
┌─────────────────────┐
│  Usuário abre        │
│  /images            │
└─────────┬──────────┘
          │
          ▼
┌─────────────────────┐
│  StoreHydrator      │
│  lê IndexedDB       │
│  seta hydrated:true │
└─────────┬──────────┘
          │
          ▼
┌─────────────────────┐
│  ImageGrid          │
│  renderiza itens    │
│  filtrados          │
└─────────┬──────────┘
          │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌────────┐  ┌────────────────┐
│ + Nova │  │ Card existente │
│ imagem │  └───────┬────────┘
└───┬────┘          │
    │               ▼
    ▼       ┌──────────────────┐
┌────────┐  │  ImageViewModal  │
│ Add    │  │  ou EditImageModal│
│ Image  │  │  • editar        │
│ Modal  │  │  • comentários   │
└───┬────┘  │  • gerenciar tags│
    │       │  • mover grupo   │
    │       │  • criar paleta  │
    │       └───────┬──────────┘
    │               │
    ▼               ▼
┌────────────────────────┐
│  store.addImage /      │
│  store.updateImage     │
└─────────┬──────────────┘
          │
          ▼
┌────────────────────────┐
│  imageDB.put()         │
│  (IndexedDB persiste)  │
└────────────────────────┘
```
