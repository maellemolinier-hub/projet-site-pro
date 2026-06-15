from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class CourseInfo(BaseModel):
    id: str
    title: str
    description: str
    modules_count: int
    duration_hours: float
    is_certified: bool


class LessonProgress(BaseModel):
    lesson_id: str
    user_id: str
    watched_seconds: int
    completed: bool


@router.get("/courses", response_model=list[CourseInfo])
async def list_courses():
    """Liste des formations disponibles."""
    return [
        CourseInfo(
            id="valeur-venale-expert",
            title="Expert en Valeur Vénale",
            description=(
                "Maîtrisez les méthodes d'évaluation immobilière reconnues : "
                "comparaison directe, capitalisation des revenus, coût de remplacement. "
                "Formation certifiante 100% en ligne."
            ),
            modules_count=8,
            duration_hours=12.5,
            is_certified=True,
        ),
        CourseInfo(
            id="prospection-terrain",
            title="Prospection terrain avancée",
            description=(
                "Techniques de prospection terrain et utilisation de l'app IA. "
                "Scripts de prise de contact, gestion des objections, conversion."
            ),
            modules_count=5,
            duration_hours=6.0,
            is_certified=False,
        ),
    ]


@router.post("/progress")
async def update_progress(progress: LessonProgress):
    """Mise à jour de la progression d'une leçon."""
    return {
        "status": "updated",
        "lesson_id": progress.lesson_id,
        "completed": progress.completed,
    }


@router.get("/certificate/{user_id}")
async def get_certificate_status(user_id: str):
    """Statut de certification d'un utilisateur."""
    return {
        "user_id": user_id,
        "status": "in_progress",
        "progress_pct": 0,
        "modules_completed": 0,
        "modules_total": 8,
        "exam_unlocked": False,
    }
