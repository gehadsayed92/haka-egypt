"""
Cilantro CEO Tool - API Key Authentication

Security approach:
- Keys stored in environment variable CEO_TOOL_API_KEYS (comma-separated)
- Keys passed via X-API-Key header
- To rotate: add new key to env, deploy, remove old key from env, deploy again
- Role-based: keys can optionally be prefixed with role (e.g., "admin:key123")
"""

import secrets
from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader

from config import settings

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def parse_key_with_role(raw_key: str) -> tuple[str, str]:
    """Parse 'role:key' format. Default role is 'viewer'."""
    if ":" in raw_key and raw_key.split(":")[0] in ("admin", "viewer", "analyst"):
        role, key = raw_key.split(":", 1)
        return role, key
    return "viewer", raw_key


async def validate_api_key(
    api_key: str = Security(api_key_header),
) -> dict:
    """
    Validate the API key from the request header.
    Returns dict with role information.
    """
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API key. Include X-API-Key header.",
        )

    if not settings.API_KEYS:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No API keys configured. Set CEO_TOOL_API_KEYS env variable.",
        )

    for raw_key in settings.API_KEYS:
        role, stored_key = parse_key_with_role(raw_key)
        # Use constant-time comparison to prevent timing attacks
        if secrets.compare_digest(api_key, stored_key):
            return {"role": role, "authenticated": True}

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Invalid API key.",
    )


def require_role(required_role: str):
    """Dependency factory: require a specific role."""

    async def check_role(auth: dict = Security(validate_api_key)):
        role_hierarchy = {"admin": 3, "analyst": 2, "viewer": 1}
        user_level = role_hierarchy.get(auth["role"], 0)
        required_level = role_hierarchy.get(required_role, 0)

        if user_level < required_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{auth['role']}' insufficient. Requires '{required_role}'.",
            )
        return auth

    return check_role
