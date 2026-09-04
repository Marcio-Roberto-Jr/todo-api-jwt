from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from .database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    senha_hash: Mapped[str] = mapped_column(String)
    refresh_token_hash: Mapped[str | None] = mapped_column(String, nullable=True)
    refresh_token_expira: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    tarefas: Mapped[list["Tarefa"]] = relationship(
        back_populates="dono", cascade="all, delete-orphan"
    )


class Tarefa(Base):
    __tablename__ = "tarefas"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    titulo: Mapped[str] = mapped_column(String)
    descricao: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[bool] = mapped_column(Boolean, default=False)
    data_criacao: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"))

    dono: Mapped["Usuario"] = relationship(back_populates="tarefas")
