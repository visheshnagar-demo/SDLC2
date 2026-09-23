"""Structured JSON logger and audit metrics accumulator."""
import json
import logging
import sys
from typing import Any, Dict


class JSONFormatter(logging.Formatter):
    """Formats log records as single-line JSON strings."""
    def format(self, record: logging.LogRecord) -> str:
        log_entry: Dict[str, Any] = {
            "severity": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "timestamp": self.formatTime(record, self.datefmt),
        }
        if hasattr(record, "metrics"):
            log_entry["metrics"] = record.metrics
        if hasattr(record, "batch_id"):
            log_entry["batch_id"] = record.batch_id
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry)


def get_logger(name: str = "sales_etl") -> logging.Logger:
    """Creates a configured structured logger."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JSONFormatter())
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger
