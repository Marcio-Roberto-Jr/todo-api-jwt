import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from jose import jwt
from passlib.context import CryptContext

load_dotenv()

# Constantes de Configuração
SECRET_KEY = os.getenv("SECRET_KEY", "minha_chave_secreta_super_segura_desafio_afl_2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def gerar_hash_senha(senha: str) -> str:
    """Gera o hash criptografado de uma senha em texto puro."""
    return pwd_context.hash(senha)


def verificar_senha(senha_pura: str, senha_hash: str) -> bool:
    """Valida se a senha em texto puro corresponde ao hash fornecido."""
    return pwd_context.verify(senha_pura, senha_hash)


def criar_token_acesso(data: dict, expires_delta: timedelta | None = None) -> str:
    """Cria um token JWT assinado contendo os dados fornecidos e data de expiração."""
    payload = data.copy()
    agora = datetime.now(timezone.utc)
    if expires_delta:
        expiracao = agora + expires_delta
    else:
        expiracao = agora + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    payload.update({"exp": expiracao})
    token_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token_jwt
