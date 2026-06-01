import logging
import sys
from app.core.correlation import get_correlation_id
from datetime import datetime, timezone

class CorrelationIdFilter(logging.Filter):
    def filter(self, record):
        record.correlation_id = get_correlation_id() or "NO-CORRELATION-ID"
        # ISO timestamp format matching the requirement
        record.iso_timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        return True

def setup_logging():
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # Format: [timestamp][correlationId][fileName][lineNumber][level] message
    formatter = logging.Formatter(
        "[%(iso_timestamp)s][%(correlation_id)s][%(filename)s][%(lineno)d][%(levelname)s] %(message)s"
    )
    
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    handler.addFilter(CorrelationIdFilter())
    
    # Remove existing handlers
    if logger.hasHandlers():
        logger.handlers.clear()
        
    logger.addHandler(handler)
    return logger
