from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from openai import OpenAI
from ..core.config import settings
from ..models.models import User, Conversation, Message, FineTunedModel
from ..dependencies import get_db, get_current_user
from ..schemas.chat import MessageCreate, MessageResponse, ConversationResponse
import logging

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conversation = Conversation(user_id=current_user.id)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation

@router.post("/{conversation_id}/messages", response_model=MessageResponse)
async def send_message(
    conversation_id: int,
    message: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify conversation belongs to user
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Save user message
    user_message = Message(
        conversation_id=conversation_id,
        content=message.content,
        is_ai=False
    )
    db.add(user_message)
    db.commit()

    # Get conversation history for context
    history = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.desc()).limit(5).all()
    
    history_text = "\n".join([
        f"{'AI' if msg.is_ai else 'User'}: {msg.content}"
        for msg in reversed(history)
    ])

    try:
        # Get the latest successful fine-tuned model
        fine_tuned_model = db.query(FineTunedModel).filter(
            FineTunedModel.status == 'succeeded',
            FineTunedModel.model_id.isnot(None)
        ).order_by(FineTunedModel.created_at.desc()).first()

        # Determine which model to use
        model_id = fine_tuned_model.model_id if fine_tuned_model else "gpt-3.5-turbo"
        
        # Log detailed information about the model being used
        if fine_tuned_model:
            logger.info(
                f"Using fine-tuned model for conversation {conversation_id}:\n"
                f"  - Model ID: {model_id}\n"
                f"  - Fine-tune ID: {fine_tuned_model.fine_tune_id}\n"
                f"  - Created at: {fine_tuned_model.created_at}\n"
                f"  - Training file: {fine_tuned_model.training_file}\n"
                f"  - Validation file: {fine_tuned_model.validation_file}"
            )
        else:
            logger.info(f"Using base model {model_id} for conversation {conversation_id} (no fine-tuned model available)")
        
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model=model_id,  # Use fine-tuned model if available
            messages=[
                {"role": "system", "content": """You are a compassionate and understanding AI companion. 
                Your role is to provide emotional support, listen actively, and help users process their thoughts 
                and feelings. While you can offer suggestions and perspective, make it clear that you're not a 
                replacement for professional mental health support when serious issues arise."""},
                {"role": "user", "content": f"Previous conversation:\n{history_text}\n\nUser: {message.content}"}
            ],
            temperature=0.7,
            max_tokens=500
        )

        ai_response = response.choices[0].message.content

        # Save AI response
        ai_message = Message(
            conversation_id=conversation_id,
            content=ai_response,
            is_ai=True
        )
        db.add(ai_message)
        db.commit()
        db.refresh(ai_message)

        return ai_message

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(Conversation.created_at.desc()).all()

@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.asc()).all()

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # First, verify the conversation belongs to the user
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Delete all messages in the conversation
    db.query(Message).filter(Message.conversation_id == conversation_id).delete()
    
    # Delete the conversation
    db.delete(conversation)
    db.commit()
    
    return {"message": "Conversation deleted successfully"}

@router.patch("/conversations/{conversation_id}/name", response_model=ConversationResponse)
async def update_conversation_name(
    conversation_id: int,
    name: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation.name = name
    db.commit()
    db.refresh(conversation)
    return conversation
