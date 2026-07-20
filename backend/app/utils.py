import secrets
import string
import threading
import time
from datetime import datetime


def generate_reference_number() -> str:
    """e.g. WD-20260720-7K3QX"""
    suffix = "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(5))
    return f"WD-{datetime.utcnow():%Y%m%d}-{suffix}"


class RateLimiter:
    """In-memory sliding-window limiter, keyed by client IP.

    Sufficient for a single-process deployment; swap for a Redis-backed
    limiter if the portal runs multiple workers.
    """

    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: dict[str, list[float]] = {}
        self._lock = threading.Lock()

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        cutoff = now - self.window_seconds
        with self._lock:
            hits = [t for t in self._hits.get(key, []) if t > cutoff]
            if len(hits) >= self.max_requests:
                self._hits[key] = hits
                return False
            hits.append(now)
            self._hits[key] = hits
            return True
