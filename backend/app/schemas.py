from datetime import datetime
from enum import Enum
from pydantic import BaseModel, ConfigDict


class UsuarioCreate(BaseModel):
    email: str
    senha: str


class UsuarioResponse(BaseModel):
    id: int
    email: str

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: str | None = None


class StatusTarefa(str, Enum):
    pendente = "pendente"
    concluida = "concluida"


class TarefaCreate(BaseModel):
    titulo: str
    descricao: str | None = None


class TarefaUpdate(BaseModel):
    titulo: str | None = None
    descricao: str | None = None
    status: StatusTarefa | None = None


class TarefaResponse(BaseModel):
    id: int
    titulo: str
    descricao: str | None
    status: bool
    data_criacao: datetime

    model_config = ConfigDict(from_attributes=True)
