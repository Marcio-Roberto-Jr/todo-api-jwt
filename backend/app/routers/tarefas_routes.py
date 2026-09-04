from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..dependencies import get_current_user, get_db

router = APIRouter(prefix="/tarefas", tags=["Tarefas"])


@router.post(
    "",
    response_model=schemas.TarefaResponse,
    status_code=status.HTTP_201_CREATED,
)
def criar_tarefa(
    tarefa_in: schemas.TarefaCreate,
    usuario_atual: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    nova_tarefa = models.Tarefa(
        titulo=tarefa_in.titulo,
        descricao=tarefa_in.descricao,
        status=False,
        usuario_id=usuario_atual.id,
    )
    db.add(nova_tarefa)
    db.commit()
    db.refresh(nova_tarefa)
    return nova_tarefa


@router.get(
    "",
    response_model=list[schemas.TarefaResponse],
    status_code=status.HTTP_200_OK,
)
def listar_tarefas(
    status_filtro: schemas.StatusTarefa | None = Query(default=None, alias="status"),
    usuario_atual: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.Tarefa).filter(
        models.Tarefa.usuario_id == usuario_atual.id
    )

    if status_filtro is not None:
        filtro_bool = status_filtro == schemas.StatusTarefa.concluida
        query = query.filter(models.Tarefa.status == filtro_bool)

    tarefas = query.order_by(models.Tarefa.id.asc()).all()
    return tarefas


@router.get(
    "/{id}",
    response_model=schemas.TarefaResponse,
    status_code=status.HTTP_200_OK,
)
def buscar_tarefa(
    id: int,
    usuario_atual: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tarefa = (
        db.query(models.Tarefa)
        .filter(
            models.Tarefa.id == id,
            models.Tarefa.usuario_id == usuario_atual.id,
        )
        .first()
    )

    if not tarefa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarefa não encontrada",
        )

    return tarefa


@router.put(
    "/{id}",
    response_model=schemas.TarefaResponse,
    status_code=status.HTTP_200_OK,
)
def atualizar_tarefa(
    id: int,
    tarefa_in: schemas.TarefaUpdate,
    usuario_atual: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tarefa = (
        db.query(models.Tarefa)
        .filter(
            models.Tarefa.id == id,
            models.Tarefa.usuario_id == usuario_atual.id,
        )
        .first()
    )

    if not tarefa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarefa não encontrada",
        )

    if tarefa_in.titulo is not None:
        tarefa.titulo = tarefa_in.titulo
    if tarefa_in.descricao is not None:
        tarefa.descricao = tarefa_in.descricao
    if tarefa_in.status is not None:
        tarefa.status = tarefa_in.status == schemas.StatusTarefa.concluida

    db.commit()
    db.refresh(tarefa)
    return tarefa


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def deletar_tarefa(
    id: int,
    usuario_atual: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tarefa = (
        db.query(models.Tarefa)
        .filter(
            models.Tarefa.id == id,
            models.Tarefa.usuario_id == usuario_atual.id,
        )
        .first()
    )

    if not tarefa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarefa não encontrada",
        )

    db.delete(tarefa)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
