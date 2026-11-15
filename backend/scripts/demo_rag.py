"""End-to-end RAG demo against the real Supabase pgvector database.

Creates a temporary user, ingests a short document (real embeddings stored in
pgvector), runs a similarity-search question, prints the cited answer, then
cleans everything up. Proves the full Phase 5 pipeline.
"""

from __future__ import annotations

import asyncio
import os
import sys
import uuid

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import dispose_engine, get_sessionmaker
from app.models.user import User
from app.services.documents import service as docsvc
from app.services.rag import service as rag

DOC_TEXT = (
    "NEXORA AI is an all-in-one AI productivity workspace founded in 2026. "
    "Its headquarters is located in Pune, India. "
    "The free plan includes 50 AI messages per month and 3 document uploads. "
    "The Pro plan raises this to 2000 AI messages per month."
)
QUESTION = "How many AI messages does the free plan include per month?"


async def main() -> None:
    factory = get_sessionmaker()
    async with factory() as db:
        user = User(id=uuid.uuid4(), email=f"demo-{uuid.uuid4().hex}@nexora.test",
                    role="user", subscription="free", is_active=True)
        db.add(user)
        await db.flush()
        print("1) temp user created:", user.id, flush=True)

        doc = await docsvc.create_document(
            db, user, filename="nexora_facts.txt",
            data=DOC_TEXT.encode(), content_type="text/plain",
        )
        await db.commit()
        print("2) document uploaded:", doc.id, flush=True)

        print("3) processing (real embeddings -> pgvector)...", flush=True)
        await docsvc.process_document(db, doc.id)
        await db.commit()
        refreshed = await docsvc.get_document(db, user, doc.id)
        print("   status:", refreshed.status, "pages:", refreshed.page_count, flush=True)

        print("4) asking:", QUESTION, flush=True)
        answer = await rag.query_documents(db, user, question=QUESTION, document_id=doc.id)
        print("   ANSWER:", answer["answer"], flush=True)
        print("   SOURCES:", [(s["page_number"], s["snippet"][:40]) for s in answer["sources"]], flush=True)

        # Cleanup (cascades to document + chunks).
        await db.delete(user)
        await db.commit()
        print("5) cleaned up temp user + document + chunks", flush=True)

    await dispose_engine()


if __name__ == "__main__":
    asyncio.run(main())
