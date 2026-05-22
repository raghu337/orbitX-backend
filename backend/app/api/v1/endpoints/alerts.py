from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.learning import Alert as AlertModel
from app.models.user import User as UserModel
from app.core import deps
from app.db.session import get_db

router = APIRouter()

@router.post("/create")
def create_alert(
    *,
    db: Session = Depends(get_db),
    satellite_id: int,
    alert_type: str,
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    alert = AlertModel(
        user_id=current_user.id,
        satellite_id=satellite_id,
        alert_type=alert_type
    )
    db.add(alert)
    db.commit()
    return {"message": "Alert created successfully"}

@router.get("/{user_id}")
def get_user_alerts(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    alerts = db.query(AlertModel).filter(AlertModel.user_id == user_id).all()
    return alerts
