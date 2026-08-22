import time
from fastapi import HTTPException, Request, status
from collections import defaultdict
from typing import Dict, List

# Store IP address -> List of request timestamps
login_signup_limiter: Dict[str, List[float]] = defaultdict(list)
search_limiter: Dict[str, List[float]] = defaultdict(list)

def rate_limit_ip(ip: str, limit: int, window: int, store: Dict[str, List[float]]):
    now = time.time()
    # Filter out timestamps older than the window
    store[ip] = [t for t in store[ip] if now - t < window]
    if len(store[ip]) >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later."
        )
    store[ip].append(now)

def limit_auth_requests(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    # 5 attempts per minute max
    rate_limit_ip(client_ip, limit=5, window=60, store=login_signup_limiter)

def limit_search_requests(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    # 60 search requests per minute max
    rate_limit_ip(client_ip, limit=60, window=60, store=search_limiter)
