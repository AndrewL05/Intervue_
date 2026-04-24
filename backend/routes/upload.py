import logging
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
import pypdf
import uuid
import os

from auth.clerk import require_auth
from services.s3 import upload_file_to_s3

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/upload", tags=["upload"])

@router.post("/resume")
async def upload_resume(
    file: UploadFile = File(...),
    clerk_user_id: str = Depends(require_auth)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are supported.")
    
    # Generate unique object name for S3
    file_id = str(uuid.uuid4())
    object_name = f"resumes/{clerk_user_id}/{file_id}.pdf"
    
    # Read file content for pypdf
    file_content = await file.read()
    
    try:
        # Seek to beginning to parse
        from io import BytesIO
        pdf_file = BytesIO(file_content)
        reader = pypdf.PdfReader(pdf_file)
        
        extracted_text = ""
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"
                
    except Exception as e:
        logger.error(f"Failed to parse PDF: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to extract text from PDF.")

    # Upload to S3
    try:
        # Seek back to beginning before uploading
        pdf_file.seek(0)
        s3_url = await upload_file_to_s3(pdf_file, object_name, content_type="application/pdf")
    except Exception as e:
        logger.error(f"Failed to upload resume to S3: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to upload file.")

    return {
        "text": extracted_text.strip(),
        "s3_url": s3_url
    }
