# To-Do List API + Frontend

Aplicação full-stack de gerenciamento de tarefas com autenticação de usuário via JWT (access token + refresh token). Backend em **FastAPI** com persistência em **SQLite**, frontend em **React + Vite + Tailwind CSS**.

## Tecnologias

**Backend**
- Python 3.13
- FastAPI
- SQLAlchemy (ORM)
- SQLite
- python-jose (JWT)
- passlib + bcrypt (hash de senha)

**Frontend**
- React (Vite)
- Tailwind CSS
- Axios
- React Router DOM

## Funcionalidades

- Cadastro e login de usuário
- Autenticação via JWT (access token de curta duração + refresh token via cookie `httpOnly`)
- CRUD completo de tarefas (`id`, `titulo`, `descricao`, `status`, `data_criacao`)
- Isolamento de dados: cada usuário acessa apenas suas próprias tarefas
- Interface para login, cadastro e gerenciamento de tarefas, com filtro por status

---

## Pré-requisitos

- [Python 3.10+](https://www.python.org/downloads/) instalado (`python --version` ou `py --version` para confirmar)
- [Node.js 18+](https://nodejs.org/) instalado (`node --version` para confirmar)
- Git (para clonar o repositório)

Não é necessário instalar SQLite separadamente — ele já vem embutido no Python.

---

## Como executar localmente

A aplicação tem duas partes que rodam de forma independente, cada uma em seu próprio terminal: **backend** (API) e **frontend** (interface).

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
```

### 2. Configurar e executar o Backend

Abra um terminal na raiz do projeto e execute:

```powershell
# Entrar na pasta do backend
cd backend

# Criar o ambiente virtual
python -m venv venv

# Ativar o ambiente virtual
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / Mac:
source venv/bin/activate

# Instalar as dependências
pip install -r requirements.txt
```

**Configurar variáveis de ambiente:** copie o arquivo de exemplo e ajuste os valores.

```powershell
copy .env.example .env
```
*(Linux/Mac: `cp .env.example .env`)*

Abra o `.env` recém-criado e gere uma chave secreta segura para `SECRET_KEY` (não use um valor previsível). Você pode gerar uma automaticamente com:

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

Copie o valor gerado para a variável `SECRET_KEY` dentro do `backend/.env`.

**Iniciar o servidor:**

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

O backend estará disponível em:
- API: http://127.0.0.1:8000
- Documentação interativa (Swagger): http://127.0.0.1:8000/docs

> ⚠️ O servidor recusa iniciar se as variáveis `SECRET_KEY`, `ALGORITHM` ou `ACCESS_TOKEN_EXPIRE_MINUTES` não estiverem definidas no `.env` — isso é intencional, como medida de segurança.

### 3. Configurar e executar o Frontend

Abra um **segundo terminal**, na raiz do projeto:

```powershell
cd frontend
npm install
```

**Configurar variáveis de ambiente:**

```powershell
copy .env.example .env
```
*(Linux/Mac: `cp .env.example .env`)*

O valor padrão (`VITE_API_URL=http://127.0.0.1:8000`) já é suficiente se você seguiu o passo do backend sem alterar a porta.

**Iniciar o servidor de desenvolvimento:**

```powershell
npm run dev
```

O terminal exibirá a URL local, geralmente:
```
➜  Local:   http://localhost:5173/
```

> Se a porta 5173 estiver ocupada, o Vite sobe automaticamente em outra porta (5174, 5175...) e exibe qual foi escolhida no próprio terminal. O backend já está configurado para aceitar requisições de qualquer porta local (`localhost`/`127.0.0.1`), então isso não impede o funcionamento.

Acesse a URL exibida no navegador.

---

## Como testar a aplicação

1. Acesse o frontend no navegador (URL exibida pelo `npm run dev`)
2. Clique em "Cadastre-se" e crie uma conta (e-mail e senha)
3. Faça login
4. No Dashboard: crie, edite, marque como concluída/pendente e exclua tarefas
5. Os filtros por status (Todas / Pendentes / Concluídas) ficam na barra de ações

### Testando a API diretamente (Swagger)

Acesse http://127.0.0.1:8000/docs e:
1. Use `POST /auth/register` para criar um usuário
2. Use `POST /auth/login` para autenticar (retorna o `access_token`)
3. Clique no cadeado 🔒 no topo da página e cole o `access_token` recebido
4. Teste as rotas de `/tarefas` (criar, listar, atualizar, excluir)

---

## Estrutura do projeto

```
<pasta-raiz>/
├── backend/
│   ├── app/
│   │   ├── main.py               # instância FastAPI + CORS + rotas
│   │   ├── database.py           # conexão SQLite
│   │   ├── models.py             # modelos SQLAlchemy (Usuario, Tarefa)
│   │   ├── schemas.py            # schemas Pydantic (validação da API)
│   │   ├── auth.py               # hash de senha, criação/validação JWT
│   │   ├── dependencies.py       # get_current_user, get_db
│   │   └── routers/
│   │       ├── auth_routes.py    # /auth/register, /auth/login, /auth/refresh, /auth/logout
│   │       └── tarefas_routes.py # /tarefas (CRUD)
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/            # Alert, Navbar, ProtectedRoute, TaskCard, TaskModal
│   │   ├── context/                # AuthContext (estado global de autenticação)
│   │   ├── pages/                  # Dashboard, Login, Register
│   │   ├── services/               # api.js (instância Axios + interceptors)
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── .env.example
│
└── README.md
```

## Decisões técnicas relevantes

- **Refresh token via cookie `httpOnly`**: o access token (curta duração) é enviado via header `Authorization`; o refresh token (7 dias) fica em um cookie `httpOnly` + `SameSite=Strict`, inacessível via JavaScript, mitigando roubo de token por XSS.
- **Hash de senha com bcrypt** (via `passlib`) — senha nunca é armazenada em texto puro.
- **Isolamento de dados por usuário**: toda consulta/atualização/exclusão de tarefa filtra por `usuario_id` diretamente na query, retornando `404` tanto para tarefas inexistentes quanto para tarefas de outro usuário (evita vazar informação sobre a existência de recursos de terceiros).
- **CORS com origem dinâmica** (`allow_origin_regex`): aceita qualquer porta local (`localhost`/`127.0.0.1`), já que o Vite pode variar a porta entre execuções.
