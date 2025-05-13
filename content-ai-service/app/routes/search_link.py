# app/routes/search_link.py

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
        # Step 1: Embed the search query
        embedded = embed_texts([query])[0]["vector"]

        # Step 2: Perform vector search using $vectorSearch in MongoDB
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "link_vector_index",  # Your index name in MongoDB
                    "queryVector": embedded,
                    "path": "vector",
                    "numCandidates": 100,
                    "limit": 5
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "link_id": 1,
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
            if r["link_id"] not in seen:
                seen.add(r["link_id"])
                links.append({
                    "link_id": r["link_id"],
                    "url": r["url"],
                    "tags": r["text"],
                    "score": round(r["score"], 4)
                })

        return jsonify({
            "status": "success",
            "query": query,
            "matches": links
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
