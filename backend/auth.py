from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from werkzeug.security import generate_password_hash, check_password_hash
import os
import secrets

SECRET_KEY = os.getenv("SECRET_KEY", "mysecretkey1926taskmanager1926")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://taskmanager-sandy-phi.vercel.app")

def hash_password(password: str) -> str:
    return generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return check_password_hash(hashed_password, plain_password)

def create_access_token(data: dict, expires_delta=None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def generate_verification_token():
    return secrets.token_urlsafe(32)

def send_verification_email(email: str, username: str, token: str):
    try:
        import resend
        resend.api_key = RESEND_API_KEY
        verification_url = f"{FRONTEND_URL}/verify-email?token={token}"
        resend.Emails.send({
            "from": "TaskManager <onboarding@resend.dev>",
            "to": email,
            "subject": "Verify your TaskManager email",
            "html": f"""
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
                <h2 style="color: #2D6A4F;">Welcome to TaskManager, {username}!</h2>
                <p style="color: #706E69;">Please verify your email address to activate your account.</p>
                <a href="{verification_url}" 
                   style="display: inline-block; margin-top: 16px; padding: 12px 24px; 
                          background: #2D6A4F; color: white; text-decoration: none; 
                          border-radius: 6px; font-weight: 500;">
                    Verify Email
                </a>
                <p style="color: #A8A59F; margin-top: 24px; font-size: 13px;">
                    If you didn't create this account, ignore this email.
                </p>
            </div>
            """
        })
        return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False