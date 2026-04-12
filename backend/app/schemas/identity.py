from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
import re


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role_id: str
    lob_id: Optional[str] = None
    team_id: Optional[str] = None
    project_id: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", v):
            raise ValueError("Invalid email address")
        return v.lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role_id: Optional[str] = None
    lob_id: Optional[str] = None
    team_id: Optional[str] = None
    project_id: Optional[str] = None
    is_active: Optional[bool] = None


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role_id: str
    role_name: Optional[str] = None
    lob_id: Optional[str] = None
    lob_name: Optional[str] = None
    team_id: Optional[str] = None
    team_name: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    is_active: bool

    model_config = {"from_attributes": True}


class ProjectCreate(BaseModel):
    name: str
    team_id: str
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    team_id: Optional[str] = None
    description: Optional[str] = None


class ProjectOut(BaseModel):
    id: str
    name: str
    team_id: str
    team_name: Optional[str] = None
    lob_id: Optional[str] = None
    lob_name: Optional[str] = None

    model_config = {"from_attributes": True}
