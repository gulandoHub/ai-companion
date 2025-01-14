import logging
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from openai import OpenAI
from ..core.config import settings
import os
from sqlalchemy.orm import Session
from ..dependencies import get_db
from ..models.models import FineTunedModel
from datetime import datetime

router = APIRouter()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/fine-tune")
async def start_fine_tuning(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")

    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    training_file_path = os.path.join(os.path.dirname(__file__), '../data/training_data.jsonl')
    validation_file_path = os.path.join(os.path.dirname(__file__), '../data/validation_data.jsonl')

    if not os.path.exists(training_file_path) or not os.path.exists(validation_file_path):
        raise HTTPException(status_code=404, detail="Training or validation data not found")

    def fine_tune():
        try:
            # Upload training file
            logger.info("Uploading training file to OpenAI")
            with open(training_file_path, 'rb') as training_file:
                training_response = client.files.create(
                    file=training_file,
                    purpose='fine-tune'
                )
            logger.info(f"Training file uploaded: {training_response.id}")

            # Upload validation file
            logger.info("Uploading validation file to OpenAI")
            with open(validation_file_path, 'rb') as validation_file:
                validation_response = client.files.create(
                    file=validation_file,
                    purpose='fine-tune'
                )
            logger.info(f"Validation file uploaded: {validation_response.id}")

            # Start fine-tuning
            logger.info("Starting fine-tuning process")
            fine_tune_response = client.fine_tuning.jobs.create(
                training_file=training_response.id,
                validation_file=validation_response.id,
                model="gpt-3.5-turbo"
            )
            logger.info(f"Fine-tuning started: {fine_tune_response.id}")

            # Save to database
            db_model = FineTunedModel(
                fine_tune_id=fine_tune_response.id,
                status=fine_tune_response.status,
                training_file=training_response.id,
                validation_file=validation_response.id
            )
            db.add(db_model)
            db.commit()
            logger.info(f"Saved fine-tuning job to database with ID: {db_model.id}")

        except Exception as e:
            logger.error(f"Fine-tuning error: {str(e)}")
            db.rollback()

    background_tasks.add_task(fine_tune)
    return {"message": "Fine-tuning started"}

@router.get("/fine-tune/{fine_tune_id}/status")
async def get_fine_tune_status(
    fine_tune_id: str,
    db: Session = Depends(get_db)
):
    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.fine_tuning.jobs.retrieve(fine_tune_id)
        status = response.status
        logger.info(f"Fine-tuning status for {fine_tune_id}: {status}")

        # Update database record
        db_model = db.query(FineTunedModel).filter(FineTunedModel.fine_tune_id == fine_tune_id).first()
        if db_model:
            db_model.status = status
            db_model.model_id = response.fine_tuned_model if response.fine_tuned_model else None
            if status in ['succeeded', 'failed', 'cancelled']:
                db_model.finished_at = datetime.now()
            db.commit()

        return {
            "fine_tune_id": fine_tune_id,
            "status": status,
            "model": response.fine_tuned_model if response.fine_tuned_model else None,
            "created_at": response.created_at,
            "finished_at": response.finished_at,
            "training_file": response.training_file,
            "validation_file": response.validation_file
        }
    except Exception as e:
        logger.error(f"Error retrieving fine-tuning status: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving fine-tuning status") 