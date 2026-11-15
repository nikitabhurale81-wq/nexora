"""ORM models.

Importing every model here ensures their tables register on
``Base.metadata`` so Alembic autogenerate and ``create_all`` see them.
"""

from app.models.analysis_job import AnalysisJob
from app.models.audit_log import AuditLog
from app.models.conversation import Conversation
from app.models.dataset import Dataset
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.feedback import Feedback
from app.models.memory import UserMemory
from app.models.message import Message
from app.models.payment import Payment
from app.models.report import Report
from app.models.subscription import Subscription
from app.models.usage_log import UsageLog
from app.models.user import User, UserPreferences

__all__ = [
    "AnalysisJob",
    "AuditLog",
    "Conversation",
    "Dataset",
    "Document",
    "DocumentChunk",
    "Feedback",
    "Message",
    "Payment",
    "Report",
    "Subscription",
    "UsageLog",
    "User",
    "UserPreferences",
    "UserMemory",
]
