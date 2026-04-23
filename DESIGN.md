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
│                       │  GroupSelector  TagPicker        │      │
│                       │  CommentsSection  Modal          │      │
│                       └─────────────┬────────────────────┘      │
│                                     │                           │
│   ┌─────────────────────────────────▼────────────────────┐      │
│   │                 Zustand Store                        │      │
│   │  imagesSlice │ palettesSlice │ uiSlice │ organization│      │
│   └─────────────────────────────────┬────────────────────┘      │
│                                     │                           │
│   ┌─────────────────────────────────▼────────────────────┐      │
│   │              Persistence Layer                       │      │
│   │        IndexedDB (via idb)  +  localStorage          │      │
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
│  Persistence Hook                   │
│  (auto-sync IDB)                    │
└────────────────────┬────────────────┘
                     │
                     ▼
         IndexedDB / localStorage
                     │
                     ▼
    (rehydration na inicialização)
```

### Modelo de Estado Global

```typescript
interface AppState {
  images: {
    items: Image[]
    selectedId: string | null
    viewMode: 'grid' | 'list' | 'detail'
    filters: FilterState
  }
  palettes: {
    items: ColorPalette[]
    selectedId: string | null
    viewMode: 'grid' | 'list' | 'detail'
    filters: FilterState
  }
  groups: Group[]
  tags: Tag[]
  ui: {
    sidebarOpen: boolean
    activeModule: 'images' | 'palettes'
    modal: ModalState | null
  }
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
│   └── palettes/page.tsx
│
├── features/
│   ├── images/
│   │   ├── components/
│   │   │   ├── ImageGrid.tsx
│   │   │   ├── ImageCard.tsx
│   │   │   ├── AddImageModal.tsx
│   │   │   ├── EditImageModal.tsx
│   │   │   ├── ImageLightbox.tsx
│   │   │   ├── ImagesToolbar.tsx
│   │   │   └── CreatePaletteFromImageModal.tsx
│   │   └── hooks/
│   │       └── useImagesPage.ts
│   │
│   ├── palettes/
│   │   ├── components/
│   │   │   ├── PaletteGrid.tsx
│   │   │   ├── PaletteCard.tsx
│   │   │   ├── AddPaletteModal.tsx
│   │   │   ├── EditPaletteModal.tsx
│   │   │   ├── PaletteViewModal.tsx
│   │   │   ├── PalettesToolbar.tsx
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
│       ├── Card.tsx
│       ├── Badge.tsx
│       └── Select.tsx
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
│   └── mockData.ts
│
└── types/
    └── index.ts
```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx                # redirect → /images
│   ├── images/page.tsx
│   └── palettes/page.tsx
│
├── features/
│   ├── images/
│   │   ├── components/
│   │   │   ├── ImageGrid.tsx
│   │   │   ├── ImageCard.tsx
│   │   │   ├── AddImageModal.tsx
│   │   │   ├── EditImageModal.tsx
│   │   │   ├── ImageLightbox.tsx
│   │   │   ├── ImagesToolbar.tsx
│   │   │   └── CreatePaletteFromImageModal.tsx
│   │   └── hooks/useImagesPage.ts
│   │
│   ├── palettes/
│   │   ├── components/
│   │   │   ├── PaletteGrid.tsx
│   │   │   ├── PaletteCard.tsx
│   │   │   ├── AddPaletteModal.tsx
│   │   │   ├── EditPaletteModal.tsx
│   │   │   ├── PaletteViewModal.tsx
│   │   │   ├── PalettesToolbar.tsx
│   │   │   └── ColorEditor.tsx
│   │   ├── hooks/usePalettesPage.ts
│   │   └── lib/
│   │       └── colorEditorUtils.ts
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
│       ├── Card.tsx
│       ├── Badge.tsx
│       └── Select.tsx
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
| `ImageLightbox` | Visualização em tela cheia de imagem |
| `ColorEditor` | Ajuste de cor via HEX / RGB / HSL / picker nativo |
| `GroupSelector` | Seleção de grupo para itens |
| `TagPicker` | Seleção múltipla de tags |
| `CommentsSection` | Comentários em itens |
| `ImagesToolbar` / `PalettesToolbar` | Toolbar com actions e filtros |
| `ConfigurationModal` | Configurações do app |

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
  extractedPaletteId?: string   // paleta gerada via IA
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
  name?: string                 // ex: "Cerulean Blue"
}

interface Group {
  id: string
  name: string
  type: 'image' | 'palette' | 'shared'
  color?: string                // cor de identificação visual
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
```

### Persistência

```
┌────────────────────────────────────┐
│  Dois níveis de persistência:      │
└────────────────────────────────────┘

1. IndexedDB (via idb)
   ┌─────────────────────────────────┐
   │  Stores: "images" | "palettes" ││
   │          | "groups" | "tags"  │ │
   └─────────────────────────────────┘
   └── Chave primária: id (string)
       Índices secundários: groupId, tagIds (multiEntry)
       Sincronizado automaticamente via middleware Zustand

2. localStorage
   ┌─────────────────────────────────┐
   │  Somente preferências de UI:    │
   └─────────────────────────────────┘
       viewMode, sidebarOpen, activeModule, filtros ativos

┌────────────────────────────────────┐
│  Hidratação na inicialização:      │
└────────────────────────────────────┘
         app/layout.tsx → <StoreHydrator /> (Client Component)
                        └── lê IndexedDB → popula store → renderiza
```

### Busca e Filtragem

```
┌────────────────────────────────────┐
│  Filtragem no lado cliente           │
│  (dados já em memória)            │
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
│  Busca textual:                     │
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
| **Next.js 15 (App Router)** | Framework principal | Roteamento baseado em arquivo, Server/Client Components, ecossistema sólido |
| **TypeScript strict** | Obrigatório | Segurança de tipos em domínio com muitas entidades relacionadas |
| **Zustand** | State management | API simples, sem boilerplate, suporte nativo a slices e middleware |
| **idb** | IndexedDB wrapper | API Promise-based, tipada, sem overhead de ORM |
| **Tailwind CSS** | Estilização | Utilitários inline evitam saltos de contexto, consistência visual fácil |
| **Vitest + Testing Library** | Testes | Integração nativa com Vite/Next.js, API compatível com Jest |

### Padrões de Design

- **Slice pattern (Zustand):** cada domínio tem seu slice com estado + ações colocalizados
- **Feature-based folders:** cada feature é auto-contida; imports cruzados só via `index.ts`
- **Custom hooks como API:** componentes consomem `useImages()`, nunca acessam o store diretamente
- **Derivação > duplicação:** estatísticas e contagens são derivadas via `useMemo`, nunca persistidas
- **Optimistic UI:** mutações locais são imediatas; persistência no IndexedDB é fire-and-forget

### Considerações de Desempenho

- Virtualização de listas longas (`react-virtual`) para grid de imagens
- Lazy load de imagens com `<Image>` do Next.js (lazy + blur placeholder)
- `useMemo` / `useCallback` aplicados nos pontos de filtragem — não globalmente
- IndexedDB operações em batch na exportação/importação para evitar travamento do thread
- Chamadas de IA debounced e canceláveis via `AbortController`

### Considerações de Usabilidade

- Feedback imediato em todas as ações (toast / spinner)
- Confirmação explícita apenas para exclusão permanente
- Atalhos de teclado para ações frequentes (nova paleta, busca, troca de modo de visualização)
- Drag-and-drop para reordenar cores dentro de uma paleta (`@dnd-kit/core`)

### Estratégia de Testes

```
┌────────────────────────────────────┐
│  Cobertura prioritária:               │
└────────────────────────────────────┘
   1. colorUtils.ts        → pure functions: hex ↔ rgb ↔ hsl, contraste
   2. store slices       → ações e seletores com estado mockado
   3. exportImport.ts   → serialização/desserialização JSON round-trip
   4. FilterPanel       → lógica de filtragem combinada
   5. useImages / usePalettes → hooks com store real (não mockado)

┌────────────────────────────────────┐
│  Integração:                        │
└────────────────────────────────────┘
     Fluxo completo:
     adicionar imagem → extrair paleta → salvar → exportar

     Persistência:
     escrever no IDB → recarregar store → checar dados

┌────────────────────────────────────┐
│  O que NÃO testar unitariamente:   │
└────────────────────────────────────┘
     Renderização visual  → coberto por Storybook / testes e2e futuros
     Chamadas de IA     → mockar o cliente HTTP
```

---

## 5. Diagrama de Fluxo — Caso de Uso Principal

```
┌─────────────────────┐
│  Usuário abre        │
│  /images           │
└─────────┬──────────┘
          │
          ▼
┌─────────────────────┐
│  StoreHydrator      │
│  lê IndexedDB      │
└─────────┬──────────┘
          │
          ▼
┌─────────────────────┐
│  ImageGrid         │
│  renderiza itens  │
│  filtrados        │
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
┌────────┐ │  ImageLightbox    │
│ Add    │ │  ou EditImageModal│
│ Image  │ │  • editar        │
│ Modal  │ │  • comentários   │
└───┬────┘ │  • gerenciar tags│
    │     │  • mover grupo   │
    │     │  • criar paleta  │
    │     └───────┬──────────┘
    │             │
    ▼             ▼
┌────────────────────────┐
│  store.addImage      │
└─────────┬───────────┘
          │
          ▼
┌────────────────────────┐
│  IndexedDB persiste    │
└────────────────────────┘
```
