from app.db.vector import VectorDB
from app.core.config import settings
import sys


class FAQService:
    def __init__(self):
        self.client = VectorDB.get_client()
        self.embeddings = VectorDB.get_embeddings()

    async def search(self, query: str, k: int = 3) -> str:
        try:
            query_vector = self.embeddings.embed_query(query)

            params = {
                "query_embedding": query_vector,
                "match_threshold": 0.5,
                "match_count": k,
                "filter": {}
            }

            response = self.client.rpc(settings.QUERY_NAME, params).execute()
            results = response.data

            if not results:
                return "Xin lỗi, tôi không tìm thấy thông tin phù hợp."

            responses = []
            for item in results:
                similarity = int(item.get('similarity', 0) * 100)
                content = item.get('content', '')
                metadata = item.get('metadata', {}) or {}

                answer = metadata.get("answer", "N/A")
                category = metadata.get("category", "Chung")

                responses.append(f"""
                                🎯 Độ khớp: {similarity}%
                                ❓ Hỏi: {content}
                                💡 Đáp: {answer}
                                📂 Mục: {category}
                                ---""")

            return "\n".join(responses)

        except Exception as e:
            print(f"❌ Error: {e}", file=sys.stderr)
            return f"Lỗi hệ thống: {str(e)}"


faq_service = FAQService()
