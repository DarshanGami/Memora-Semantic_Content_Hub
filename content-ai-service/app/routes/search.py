# app/routes/search.py

from flask import Blueprint, request, jsonify
from app.services.embedder import embed_texts
from app.services.mongo_client import image_vector_collection

search_router = Blueprint("search_router", __name__)

@search_router.route("/search/image", methods=["GET"])
def search_image():
    query = request.args.get("q")
    if not query:
        return jsonify({"error": "Missing search query (?q=...)"})

    try:
        # Embed the query
        embedded = embed_texts([query])[0]["vector"]

        # Perform vector search using $vectorSearch (MongoDB Atlas)
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "image_vector_index",   # Your index name in MongoDB
                    "queryVector": embedded,
                    "path": "vector",
                    "numCandidates": 500,
                    "limit": 50
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "image_id": 1,
                    "text": 1,
                    "score": {"$meta": "vectorSearchScore"}
                }
            }
        ]

        results = list(image_vector_collection.aggregate(pipeline))

        # Group by image_id, return top 3–5 distinct image_ids
        seen = set()
        images = []
        for r in results:
            if r["image_id"] not in seen:
                seen.add(r["image_id"])
                images.append({
                    "image_id": r["image_id"],
                    "matched_tag": r["text"],
                    "score": round(r["score"], 4)
                })

        return jsonify({
            "status": "success",
            "query": query,
            "matches": images[:10]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
