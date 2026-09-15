from fastapi import APIRouter
from .endpoints import interview, pdf_report

api_router = APIRouter()
api_router.include_router(interview.router, prefix="", tags=["Interview"])
api_router.include_router(pdf_report.router, prefix="", tags=["Reports"])
