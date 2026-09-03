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
