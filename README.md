# MozUp Academy

MozUp Academy é uma plataforma interativa de e-learning focada no desenvolvimento profissional e capacitação, com especialização na área de Petróleo, Gás Natural e Gás Natural Liquefeito (GNL).

## Funcionalidades

- **Autenticação de Utilizadores**: Sistema seguro de login e registo.
- **Progressão de Cursos**: Acompanhamento sequencial do progresso dos alunos.
- **Avaliações e Quizzes**: Testes interativos integrados nos módulos.
- **Certificação**: Geração automática de certificados após a conclusão bem-sucedida.
- **Painel de Administração**: Gestão completa de cursos, alunos e relatórios.

## Tecnologias Utilizadas

- **Frontend**: React, Vite, Tailwind CSS
- **Backend/Base de Dados**: Supabase (PostgreSQL, Autenticação, Storage)
- **Roteamento**: React Router
- **Geração de PDF**: jsPDF, html2canvas

## Pré-requisitos

- Node.js (versão 18 ou superior)
- Conta no Supabase (para configuração da base de dados e autenticação)

## Instalação e Configuração

1. **Clonar o repositório**
   ```bash
   git clone https://github.com/seu-usuario/mozup-academy.git
   cd mozup-academy
   ```

2. **Instalar as dependências**
   ```bash
   npm install
   ```

3. **Configurar as variáveis de ambiente**
   Crie um ficheiro `.env.local` na raiz do projecto e adicione as suas credenciais do Supabase:
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   ```
   *Nota: O projecto actual utiliza credenciais configuradas directamente no serviço do Supabase (`src/services/supabase.ts`). Recomenda-se a migração para variáveis de ambiente num ambiente de produção.*

4. **Configurar a Base de Dados**
   Execute o script SQL fornecido em `supabase_schema.sql` no painel SQL do seu projecto Supabase para criar as tabelas e políticas de segurança necessárias.

## Executar o Projecto

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

## Compilar para Produção

Para compilar o projecto para produção:

```bash
npm run build
```

Os ficheiros compilados estarão disponíveis na pasta `dist`.

## Licença

Este projecto está licenciado sob a [MIT License](LICENSE).
