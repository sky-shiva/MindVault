from datetime import datetime, timedelta, timezone
from typing import Tuple

DEFAULT_INTERVALS = [1, 3, 7, 14, 30, 60, 120]

def calculate_next_revision(
    current_repetitions: int,
    current_interval_days: int,
    current_ease: float,
    rating: str
) -> Tuple[int, int, float, datetime, str]:
    """
    Spaced repetition interval calculator.
    Ratings:
      - 'forgot': resets progress, sets 1-day interval
      - 'partial': modest interval, slight ease reduction
      - 'well': expands interval, increases ease factor
    Returns:
      (new_repetitions, new_interval_days, new_ease, next_review_at, status)
    """
    now = datetime.now(timezone.utc)
    
    if rating == "forgot":
        new_repetitions = 0
        new_interval_days = 1
        new_ease = max(1.3, current_ease - 0.2)
        status = "due"
        next_review = now + timedelta(days=1)
        
    elif rating == "partial":
        new_repetitions = max(1, current_repetitions)
        new_interval_days = max(2, int(current_interval_days * 1.2))
        new_ease = max(1.3, current_ease - 0.05)
        status = "upcoming"
        next_review = now + timedelta(days=new_interval_days)
        
    else:  # "well"
        new_repetitions = current_repetitions + 1
        if new_repetitions <= len(DEFAULT_INTERVALS):
            new_interval_days = DEFAULT_INTERVALS[new_repetitions - 1]
        else:
            new_interval_days = int(current_interval_days * current_ease)
            
        new_ease = min(3.0, current_ease + 0.1)
        status = "upcoming"
        next_review = now + timedelta(days=new_interval_days)
        
    return (new_repetitions, new_interval_days, round(new_ease, 2), next_review, status)
