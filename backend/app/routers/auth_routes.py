from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import criar_token_acesso, gerar_hash_senha, verificar_senha
from ..dependencies import get_db

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post(
    "/register",
    response_model=schemas.UsuarioResponse,
    status_code=status.HTTP_201_CREATED
)
def registrar_usuario(
    usuario: schemas.UsuarioCreate,
    db: Session = Depends(get_db)
):
    usuario_existente = db.query(models.Usuario).filter(
        models.Usuario.email == usuario.email
    ).first()

    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-mail já cadastrado"
        )

    senha_criptografada = gerar_hash_senha(usuario.senha)
    novo_usuario = models.Usuario(
        email=usuario.email,
        senha_hash=senha_criptografada
    )

    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)

    return novo_usuario


@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # No OAuth2PasswordRequestForm, o campo username recebe o email do usuário
    usuario = db.query(models.Usuario).filter(
        models.Usuario.email == form_data.username
    ).first()

    if not usuario or not verificar_senha(form_data.password, str(usuario.senha_hash)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_acesso = criar_token_acesso(data={"sub": str(usuario.email)})

    return {"access_token": token_acesso, "token_type": "bearer"}
