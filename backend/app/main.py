from fastapi import FastAPI
from .database import Base, engine
from .routers import auth_routes

# Cria as tabelas no SQLite se elas ainda não existirem
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="API de Lista de Tarefas (To-Do List)",
    description="Desafio Técnico - AFL Consultores",
    version="1.0.0"
)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_credentials=True,   # obrigatório para cookies funcionarem
    allow_methods=["*"],
    allow_headers=["*"],
)
# Registro de Rotas
app.include_router(auth_routes.router)


@app.get("/")
def read_root():
    return {"mensagem": "API To-Do List rodando com sucesso!"}