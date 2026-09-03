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

# Registro de Rotas
app.include_router(auth_routes.router)


@app.get("/")
def read_root():
    return {"mensagem": "API To-Do List rodando com sucesso!"}