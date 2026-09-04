from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import (
    ALGORITHM,
    REFRESH_TOKEN_EXPIRE_DIAS,
    SECRET_KEY,
    criar_refresh_token,
    criar_token_acesso,
    gerar_hash_senha,
    hash_token,
    verificar_senha,
)
from ..dependencies import get_current_user, get_db

router = APIRouter(prefix="/auth", tags=["Autenticação"])

if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY não configurada. Crie um arquivo .env na pasta backend/ "
        "com a variável SECRET_KEY definida."
    )

@router.post(
    "/register",
    response_model=schemas.UsuarioResponse,
    status_code=status.HTTP_201_CREATED,
)
def registrar_usuario(
    usuario: schemas.UsuarioCreate,
    db: Session = Depends(get_db),
):
    usuario_existente = (
        db.query(models.Usuario)
        .filter(models.Usuario.email == usuario.email)
        .first()
    )

    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-mail já cadastrado",
        )

    senha_criptografada = gerar_hash_senha(usuario.senha)
    novo_usuario = models.Usuario(
        email=usuario.email,
        senha_hash=senha_criptografada,
    )

    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)

    return novo_usuario


@router.post("/login", response_model=schemas.Token)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    usuario = (
        db.query(models.Usuario)
        .filter(models.Usuario.email == form_data.username)
        .first()
    )

    if not usuario or not verificar_senha(form_data.password, str(usuario.senha_hash)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_acesso = criar_token_acesso(data={"sub": str(usuario.email)})
    refresh_token = criar_refresh_token(data={"sub": str(usuario.email)})

    # Salva no banco com timezone UTC (offset-aware)
    usuario.refresh_token_hash = hash_token(refresh_token)
    usuario.refresh_token_expira = datetime.now(timezone.utc) + timedelta(
        days=REFRESH_TOKEN_EXPIRE_DIAS
    )
    db.commit()

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Altere para True em produção com HTTPS
        samesite="strict",
        max_age=REFRESH_TOKEN_EXPIRE_DIAS * 24 * 60 * 60,
        path="/auth",
    )

    return {"access_token": token_acesso, "token_type": "bearer"}


@router.post("/refresh", response_model=schemas.Token)
def renovar_access_token(request: Request, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token ausente",
        )

    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
            )
        email = payload.get("sub")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido ou expirado",
        )

    usuario = (
        db.query(models.Usuario)
        .filter(models.Usuario.email == email)
        .first()
    )

    if not usuario or usuario.refresh_token_hash != hash_token(refresh_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token não reconhecido",
        )

    # O SQLite armazena datetimes sem fuso (naive). Se vier sem timezone, adicionamos UTC.
    expiracao = usuario.refresh_token_expira
    if expiracao is not None and expiracao.tzinfo is None:
        expiracao = expiracao.replace(tzinfo=timezone.utc)

    if expiracao is None or expiracao < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expirado",
        )

    novo_access_token = criar_token_acesso(data={"sub": str(usuario.email)})
    return {"access_token": novo_access_token, "token_type": "bearer"}


@router.post("/logout")
def logout(
    response: Response,
    usuario: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    usuario.refresh_token_hash = None
    usuario.refresh_token_expira = None
    db.commit()
    response.delete_cookie("refresh_token", path="/auth")
    return {"mensagem": "Logout realizado com sucesso"}