import base64
import hashlib
from typing import Optional
from cryptography.fernet import Fernet
from app.core.config import settings

def _get_fernet() -> Fernet:
    """
    Derives a consistent 32-byte Fernet key from the server's SECRET_KEY.
    Ensures authenticated AES-128-CBC encryption at rest.
    """
    secret = settings.SECRET_KEY.encode("utf-8")
    derived_bytes = hashlib.sha256(secret).digest()
    fernet_key = base64.urlsafe_b64encode(derived_bytes)
    return Fernet(fernet_key)

def encrypt_secret(plain_text: str) -> str:
    """Encrypts plain text string to an authenticated ciphertext string."""
    if not plain_text:
        return ""
    f = _get_fernet()
    return f.encrypt(plain_text.encode("utf-8")).decode("utf-8")

def decrypt_secret(cipher_text: str) -> str:
    """Decrypts ciphertext string back to plain text string."""
    if not cipher_text:
        return ""
    try:
        f = _get_fernet()
        return f.decrypt(cipher_text.encode("utf-8")).decode("utf-8")
    except Exception:
        return ""

def mask_api_key(key: Optional[str]) -> Optional[str]:
    """
    Returns a safe, masked representation of an API key.
    Never exposes the full key to client responses or logs.
    Example: AIzaSyD...x7Q9 -> AIza••••••••x7Q9
    """
    if not key:
        return None
    cleaned = key.strip()
    if len(cleaned) <= 8:
        return "••••••••"
    return f"{cleaned[:4]}••••••••{cleaned[-4:]}"
