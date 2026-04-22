# Sistema de Gerenciamento de Paletas e Imagens — Design de Alto Nível

## 1. Arquitetura Geral

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App                          │
│                                                             │
│  ┌──────────┐   ┌─────────────────────────────────────┐    │
│  │          │   │              Pages                   │    │
│  │ Sidebar  │   │  /images  │  /palettes  │ /dashboard │    │
│  │  + Nav   │   └─────────────────────────────────────┘    │
│  │          │              │                               │
│  └──────────┘   ┌──────────▼──────────────────────────┐    │
│                 │         Feature Modules               │    │
│                 │  ImageModule  │  PaletteModule        │    │
│                 │  Dashboard    │  ColorEditor          │    │
│                 └──────────────────────┬────────────────┘    │
│                                        │                     │
│                 ┌──────────────────────▼────────────────┐    │
│                 │          Shared Components             │    │
│                 │  GroupManager  TagManager  SearchBar   │    │
│                 │  FilterPanel   AIPanel     ExportPanel │    │
│                 └──────────────────────┬────────────────┘    │
│                                        │                     │
│  ┌─────────────────────────────────────▼────────────────┐   │
│  │                   Zustand Store                       │   │
│  │  imagesSlice │ palettesSlice │ uiSlice │ aiSlice      │   │
│  └─────────────────────────────────────┬────────────────┘   │
│                                        │                     │
│  ┌─────────────────────────────────────▼────────────────┐   │
│  │               Persistence Layer                       │   │
│  │         IndexedDB (via idb)  +  localStorage          │   │
│  └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         │                              │
   ┌─────▼──────┐               ┌───────▼──────┐
   │  AI APIs   │               │  Mock API    │
   │ (OpenAI /  │               │  (JSON data) │
   │  Anthropic)│               └──────────────┘
   └────────────┘
```

### Fluxo de Dados

```
Ação do usuário
     │
     ▼
UI Component  ──► Action (Zustand) ──► Reducer/Mutator
                                              │
                                    ┌─────────▼─────────┐
                                    │  Persistence Hook  │
                                    │  (auto-sync IDB)   │
                                    └─────────┬──────────┘
                                              │
                                    IndexedDB / localStorage
                                              │
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
    activeModule: 'images' | 'palettes' | 'dashboard'
    modal: ModalState | null
  }
  ai: {
    loading: boolean
    lastSuggestions: ColorPalette[]
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
├── app/                        # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx                # redirect → /images
│   ├── images/page.tsx
│   ├── palettes/page.tsx
│   └── dashboard/page.tsx
│
├── features/
│   ├── images/
│   │   ├── components/
│   │   │   ├── ImageGrid.tsx
│   │   │   ├── ImageCard.tsx
│   │   │   ├── ImageDetail.tsx
│   │   │   └── AddImageModal.tsx
│   │   ├── hooks/useImages.ts
│   │   └── index.ts
│   │
│   ├── palettes/
│   │   ├── components/
│   │   │   ├── PaletteGrid.tsx
│   │   │   ├── PaletteCard.tsx
│   │   │   ├── PaletteDetail.tsx
│   │   │   ├── ColorEditor.tsx
│   │   │   └── AddPaletteModal.tsx
│   │   ├── hooks/usePalettes.ts
│   │   └── index.ts
│   │
│   ├── organization/
│   │   ├── components/
│   │   │   ├── GroupManager.tsx
│   │   │   └── TagManager.tsx
│   │   └── hooks/useOrganization.ts
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── GroupChart.tsx
│   │   │   └── TopTagsChart.tsx
│   │   └── hooks/useDashboardStats.ts
│   │
│   └── ai/
│       ├── components/AIPanel.tsx
│       ├── hooks/useAI.ts
│       └── api/aiClient.ts
│
├── shared/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx    # sidebar + header + main
│   │   │   └── Sidebar.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── ViewToggle.tsx
│   │   ├── ExportImportPanel.tsx
│   │   └── CommentEditor.tsx
│   └── ui/                     # primitives (Button, Modal, Badge…)
│
├── store/
│   ├── index.ts                # Zustand store root
│   ├── imagesSlice.ts
│   ├── palettesSlice.ts
│   ├── organizationSlice.ts
│   └── uiSlice.ts
│
├── lib/
│   ├── db.ts                   # IndexedDB via idb
│   ├── exportImport.ts
│   ├── colorUtils.ts           # hex ↔ rgb ↔ hsl, contrast, etc.
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
| `ImageDetail` / `PaletteDetail` | Visão expandida com comentários, tags, grupo |
| `ColorEditor` | Ajuste de cor via HEX / RGB / HSL / picker nativo |
| `GroupManager` | CRUD de grupos, atribuição de itens |
| `TagManager` | CRUD de tags, cores de tag |
| `FilterPanel` | Controla `FilterState` no store (grupo, tags, busca) |
| `ExportImportPanel` | Serializa/deserializa JSON para arquivo local |
| `AIPanel` | Dispara chamadas de IA, exibe sugestões |
| `Dashboard` | Agrega estatísticas via `useDashboardStats` |

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
Dois níveis de persistência:

1. IndexedDB (via idb)
   Stores: "images" | "palettes" | "groups" | "tags"
   ├── Chave primária: id (string)
   ├── Índices secundários: groupId, tagIds (multiEntry)
   └── Sincronizado automaticamente via middleware Zustand

2. localStorage
   └── Somente preferências de UI:
       viewMode, sidebarOpen, activeModule, filtros ativos

Hidratação na inicialização:
  app/layout.tsx → <StoreHydrator /> (Client Component)
  └── lê IndexedDB → popula store → renderiza
```

### Busca e Filtragem

```
Filtragem ocorre no lado cliente (dados já em memória):

useMemo(() => {
  return items
    .filter(byGroup)
    .filter(byTags)          // AND semântico entre tags
    .filter(bySearchText)    // name | comments[].text | tags
}, [items, filters])

Busca textual:
  - normalização: lowercase + remove acentos
  - campos: name, comments[].text, tag names resolvidas
  - debounce 200ms no input
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
| **Recharts** | Dashboard | Biblioteca React-native, leve, suficiente para gráficos de estatísticas |

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
Cobertura prioritária:

1. colorUtils.ts         — pure functions: conversão hex/rgb/hsl, contraste
2. store slices          — ações e seletores com estado mockado
3. exportImport.ts       — serialização/desserialização JSON round-trip
4. FilterPanel           — lógica de filtragem combinada
5. useImages / usePalettes — hooks com store real (não mockado)

Integração:
  - Fluxo completo: adicionar imagem → extrair paleta → salvar → exportar
  - Persistência: escrever no IDB, recarregar store, checar dados

O que não testar unitariamente:
  - Renderização visual (coberto por Storybook / testes e2e futuros)
  - Chamadas de IA (mockar o cliente HTTP)
```

---

## 5. Diagrama de Fluxo — Caso de Uso Principal

```
Usuário abre /images
        │
        ▼
StoreHydrator lê IndexedDB
        │
        ▼
ImageGrid renderiza itens filtrados
        │
   ┌────┴─────┐
   │          │
Clica em    Clica em
"+ Adicionar" card existente
   │          │
   ▼          ▼
AddImageModal  ImageDetail
  (URL input)   ├── editar comentário
       │        ├── gerenciar tags
       ▼        ├── mover para grupo
   store.addImage  └── "Sugerir paleta via IA"
       │                    │
       ▼                    ▼
  IndexedDB           AI API call
  persiste         ────────────────►
                   ◄─── ColorPalette[]
                              │
                         store.addPalette
                              │
                         IndexedDB persiste
```
