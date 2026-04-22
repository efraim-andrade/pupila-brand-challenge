This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


---

# Teste de Implementação Frontend - Pupila Brand Studio

## Contexto
A Pupila Brand Studio está desenvolvendo uma nova área de gerenciamento de referências visuais para sua plataforma Brand Zone. Esta ferramenta permitirá que profissionais de marketing e design organizem referências visuais para seus projetos de branding de forma eficiente.

## Objetivo
Você deve desenvolver o MVP desse sistema, com dois módulos principais: Imagens e Paleta de Cores. O usuário deve ser capaz de fazer a completa gestão do seu conteúdo, organizando-as em grupos e/ou tags, e podendo adicionar comentários em cada item.

## Parte 1: Design de Sistema

Antes de iniciar a implementação, elabore um documento de design de sistema em alto nível que contenha:

1. **Arquitetura Geral**:
   - Diagrama de componentes da aplicação
   - Fluxo de dados entre componentes
   - Modelo de estado da aplicação

2. **Componentes Principais**:
   - Descrição dos principais componentes da interface
   - Responsabilidades de cada componente
   - Interações entre os componentes

3. **Estratégia de Gerenciamento de Dados**:
   - Como os dados serão estruturados
   - Abordagem para persistência de dados
   - Estratégia para busca e filtragem

4. **Decisões Técnicas**:
   - Tecnologias escolhidas e justificativas
   - Padrões de design aplicados
   - Considerações de desempenho e usabilidade

O documento deve ser conciso e pode incluir diagramas simples para ilustrar a arquitetura.

## Parte 2: Implementação

### Requisitos Funcionais

1. **Módulo de Imagens**:
   - Visualização de imagens em grid
   - Adição de novas imagens (via URL ou API simulada)
   - Organização em grupos personalizados
   - Atribuição de tags às imagens
   - Adição e edição de comentários em cada imagem
   - Exclusão de imagens

2. **Módulo de Paleta de Cores**:
   - Visualização de paletas de cores salvas
   - Criação de novas paletas (conjunto de cores)
   - Organização em grupos personalizados
   - Atribuição de tags às paletas
   - Adição e edição de comentários em cada paleta
   - Exclusão de paletas

3. **Organização**:
   - Criação e gerenciamento de grupos
   - Criação e gerenciamento de tags
   - Filtragem de conteúdo por grupo ou tag
   - Pesquisa por nome, comentário ou tag

## Recursos Adicionais Sugeridos

Você pode implementar os recursos abaixo conforme julgar relevante para demonstrar suas habilidades e melhorar a experiência do usuário:

- **Persistência de dados**: Utilização de localStorage ou IndexedDB para salvar os dados do usuário
- **Exportação/Importação**: Funcionalidade para exportar paletas em formato JSON ou importar paletas de arquivos
- **Recursos de IA**: Integração com APIs de IA para sugerir paletas de cores com base em imagens ou gerar tags automáticas
- **Visualização avançada**: Modos diferentes de visualizar as paletas (lista, grade, detalhes)
- **Estatísticas de uso**: Dashboard mostrando estatísticas sobre as coleções (quantidade por grupo, tags mais usadas)
- **Editor de cores**: Ferramentas para ajustar cores dentro das paletas

Você decide quais desses recursos implementar. Qualidade é mais importante que quantidade. Documente suas escolhas e o raciocínio por trás delas.

## Requisitos Técnicos
- Implementação preferencialmente usando Next.js, mas você pode escolher outro framework se desejar (justificando sua escolha)
- TypeScript para definições de tipos
- Componentes reutilizáveis e bem estruturados
- Implementação de testes unitários para as funcionalidades principais
- Gerenciamento de estado (local ou global, conforme necessário)



## Observações Importantes
- O foco deste teste é avaliar sua capacidade de estruturar uma aplicação frontend com gerenciamento de dados
- Você pode simular uma API backend com dados mockados (não é necessário implementar um backend real)
- O layout não precisa ser responsivo, mas deve ter uma aparência profissional e usável
- Priorize a funcionalidade e organização do código sobre visual elaborado

## Entrega
A entrega deve ser feita através de um repositório Git contendo:

1. **Documento de Design de Sistema** (em formato PDF ou Markdown)
2. **Código fonte da implementação**
3. **README com**:
   - Instruções de instalação e execução
   - Explicação da estrutura do projeto
   - Decisões técnicas e justificativas
   - Limitações conhecidas e possíveis melhorias
4. **Testes unitários implementados**

## Critérios de Avaliação
1. **Design de Sistema**
   - Clareza e coerência da arquitetura proposta
   - Adequação das decisões técnicas aos requisitos
   - Qualidade dos diagramas e documentação
   - Considerações sobre extensibilidade e manutenção

2. **Qualidade do Código**
   - Clareza e organização
   - Uso adequado de TypeScript
   - Componentização e reutilização
   - Boas práticas de desenvolvimento

3. **Funcionalidade**
   - Implementação correta dos requisitos
   - Interface funcional e intuitiva
   - Tratamento adequado de estados e erros

4. **Documentação**
   - Clareza nas explicações
   - Documentação de componentes e arquitetura
   - Instruções de uso

5. **Testes**
   - Presença de testes unitários relevantes
   - Qualidade e utilidade dos testes implementados

6. **Criatividade e Iniciativa**
   - Implementação criativa de recursos adicionais
   - Escolhas tecnológicas bem justificadas
   - Resolução de problemas não explicitamente definidos
