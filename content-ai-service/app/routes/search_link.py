from flask import Blueprint, request, jsonify
from app.services.embedder import embed_texts
from app.services.mongo_client import db

search_link_router = Blueprint("search_link_router", __name__)
link_vector_collection = db["link_vectors"]

@search_link_router.route("/search/link", methods=["GET"])
def search_link():
    query = request.args.get("q")
    if not query:
        return jsonify({"error": "Missing search query (?q=...)"}), 400

    try:
        # Embed the query
        embedded = embed_texts([query])[0]["vector"]

        # Vector search pipeline
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "link_vector_index",
                    "queryVector": embedded,
                    "path": "vector",
                    "numCandidates": 100,
                    "limit": 25
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "content_id": 1,
                    "url": 1,
                    "text": 1,
                    "score": {"$meta": "vectorSearchScore"}
                }
            }
        ]

        results = list(link_vector_collection.aggregate(pipeline))

        seen = set()
        links = []
        for r in results:
            content_id = r.get("content_id")
            if not content_id:
                continue
            if content_id not in seen:
                seen.add(content_id)
                links.append({
                    "content_id": content_id,
                    "url": r.get("url", ""),
                    "matched_tag": r.get("text", ""),
                    "score": round(r.get("score", 0), 4)
                })

        return jsonify({
            "status": "success",
            "query": query,
            "matches": links
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
