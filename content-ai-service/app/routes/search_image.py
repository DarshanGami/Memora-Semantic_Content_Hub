from flask import Blueprint, request, jsonify
from app.services.embedder import embed_texts
from app.services.mongo_client import db

image_vector_collection = db["image_vectors"]

search_router = Blueprint("search_router", __name__)

@search_router.route("/search/image", methods=["GET"])
def search_image():
    query = request.args.get("q")
    if not query:
        return jsonify({"error": "Missing search query (?q=...)"}), 400

    try:
        # Step 1: Embed the query
        embedded = embed_texts([query])[0].get("vector")
        if not embedded:
            return jsonify({"error": "Embedding failed"}), 500

        # Step 2: Build vector search pipeline
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "image_vector_index",  # MongoDB Atlas vector index
                    "queryVector": embedded,
                    "path": "vector",
                    "numCandidates": 500,
                    "limit": 25
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "content_id": 1,
                    "text": 1,
                    "score": {"$meta": "vectorSearchScore"}
                }
            }
        ]

        results = list(image_vector_collection.aggregate(pipeline))

        # Step 3: Deduplicate by content_id
        seen = set()
        images = []
        for r in results:
            content_id = r.get("content_id")
            if not content_id:
                continue
            if content_id not in seen:
                seen.add(content_id)
                images.append({
                    "content_id": content_id,
                    "matched_tag": r.get("text", ""),
                    "score": round(r.get("score", 0.0), 4)
                })

        return jsonify({
            "status": "success",
            "query": query,
            "matches": images[:10]  # Return only top 10 distinct content_ids
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
