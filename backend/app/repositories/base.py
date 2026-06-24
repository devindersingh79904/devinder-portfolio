from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from uuid import UUID
from sqlalchemy.orm import Session
from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=Any)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=Any)

class BaseRepository(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        return db.query(self.model).filter(self.model.id == id).first()

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100, filters: dict = None
    ) -> List[ModelType]:
        query = db.query(self.model)
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    query = query.filter(getattr(self.model, key) == value)
        # Honor display_order for portfolio content so the seeded/admin ordering is respected.
        if hasattr(self.model, "display_order"):
            query = query.order_by(self.model.display_order)
        return query.offset(skip).limit(limit).all()
        
    def count(self, db: Session, filters: dict = None) -> int:
        query = db.query(self.model)
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    query = query.filter(getattr(self.model, key) == value)
        return query.count()

    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        if isinstance(obj_in, dict):
            obj_in_data = obj_in
        else:
            obj_in_data = obj_in.model_dump(exclude_unset=True)
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, *, db_obj: ModelType, obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        
        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])
                
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: Any) -> ModelType:
        obj = db.query(self.model).get(id)
        db.delete(obj)
        db.commit()
        return obj

    def soft_delete(self, db: Session, *, id: Any) -> Optional[ModelType]:
        obj = db.query(self.model).get(id)
        if obj and hasattr(obj, "is_active"):
            obj.is_active = False
            db.add(obj)
            db.commit()
            db.refresh(obj)
            return obj
        return None
