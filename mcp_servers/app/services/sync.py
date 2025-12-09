import httpx
import csv
import io
import sys
from langchain_core.documents import Document
from app.db.vector import VectorDB
from app.core.config import settings

# Ensure stdout uses UTF-8 encoding (prevents logging errors on Windows)
sys.stdout.reconfigure(encoding='utf-8')


async def sync_data_job():
    print("[CRON] Starting data check and synchronization...", file=sys.stderr)

    if not settings.CSV_URL:
        print("[CRON] Missing CSV_URL configuration in settings",
              file=sys.stderr)
        return

    try:
        # --- STEP 1: Fetch EXISTING questions from Database ---
        supabase_client = VectorDB.get_client()

        # Only select the 'content' column (question) for lightweight comparison
        # Note: 'content' is the column storing the question text in the 'documents' table
        response = supabase_client.table(
            settings.TABLE_NAME).select("content").execute()

        # Create a Set of existing questions for O(1) lookup speed
        existing_questions = {item['content'] for item in response.data}
        print(
            f"[CRON] Database currently holds {len(existing_questions)} questions.", file=sys.stderr)

        # --- STEP 2: Download and parse CSV from Google Sheets ---
        async with httpx.AsyncClient(follow_redirects=True) as client:
            resp = await client.get(settings.CSV_URL, timeout=30.0)
            # Remove Byte Order Mark (BOM) if present
            content = resp.text.lstrip('\ufeff')

            reader = csv.DictReader(io.StringIO(content))

            # Normalize headers (strip whitespace)
            if reader.fieldnames:
                reader.fieldnames = [x.strip() for x in reader.fieldnames]

            rows = list(reader)

        if not rows:
            print("[CRON] CSV file is empty. Aborting sync.",
                  file=sys.stderr)
            return

        # --- STEP 3: Filter for NEW questions ---
        new_docs = []
        # Set to track all questions currently in the sheet (used to identify deletions later)
        current_sheet_questions = set()

        for row in rows:
            q = row.get("question", "").strip()
            if not q:
                continue

            current_sheet_questions.add(q)

            # CRITICAL LOGIC: Only add to list if the question is NOT in the DB
            if q not in existing_questions:
                print(f"Found new question: {q}", file=sys.stderr)
                new_docs.append(Document(
                    page_content=q,
                    metadata={
                        "answer": row.get("answer", ""),
                        "category": row.get("category", ""),
                        "policy_type": row.get("policy_type", "")
                    }
                ))

        # --- STEP 4: Execute Updates ---
        vector_store = VectorDB.get_store()

        # 4a. Insert New Records
        if new_docs:
            print(
                f"Embedding and adding {len(new_docs)} new questions...", file=sys.stderr)
            vector_store.add_documents(new_docs)
            print("Insertion completed.", file=sys.stderr)
        else:
            print("No new questions to add.", file=sys.stderr)

        # 4b. Delete Obsolete Records
        # Logic: (Questions in DB) - (Questions in Current Sheet) = (Items to Delete)
        questions_to_delete = existing_questions - current_sheet_questions

        if questions_to_delete:
            print(
                f"Detected {len(questions_to_delete)} questions removed from Sheet. Deleting...", file=sys.stderr)

            # Perform batch deletion using Supabase Client
            supabase_client.table(settings.TABLE_NAME) \
                .delete() \
                .in_("content", list(questions_to_delete)) \
                .execute()
            print("Obsolete data deleted.", file=sys.stderr)

        print("[CRON] Synchronization complete!", file=sys.stderr)

    except Exception as e:
        print(f"[CRON] Error during synchronization: {e}", file=sys.stderr)
