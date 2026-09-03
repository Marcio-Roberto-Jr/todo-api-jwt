from fastapi import FastAPI
from .database import engine, Base

# Cria as tabelas no SQLite se elas ainda não existirem
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API de Lista de Tarefas (To-Do List)",
    description="Desafio Técnico - AFL Consultores",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"mensagem": "API To-Do List rodando com sucesso!"}