# models.py
from pydantic import BaseModel
from typing import List

class FilterRequest(BaseModel):
    languages: List[str]
    regions: List[str]
    nationwide: bool
