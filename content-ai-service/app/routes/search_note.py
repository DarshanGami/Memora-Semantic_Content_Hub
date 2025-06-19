# app/routes/search_note.py

from flask import Blueprint, request, jsonify
from app.services.embedder import embed_texts
from app.services.mongo_client import db

search_note_router = Blueprint("search_note_router", __name__)
note_vector_collection = db["note_vectors"]

@search_note_router.route("/search/note", methods=["GET"])
def search_note():
    query = request.args.get("q")
    if not query:
        return jsonify({"error": "Missing search query (?q=...)"}), 400

    try:
        embedded = embed_texts([query])[0]["vector"]

        pipeline = [
            {
                "$vectorSearch": {
                    "index": "note_vector_index",   # Use your vector index name
                    "queryVector": embedded,
                    "path": "vector",
                    "numCandidates": 500,
                    "limit": 25
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "note_id": 1,
                    "text": 1,
                    "score": {"$meta": "vectorSearchScore"}
                }
            }
        ]

        results = list(note_vector_collection.aggregate(pipeline))

        seen = set()
        notes = []
        for r in results:
            note_id = r.get("note_id")
            if not note_id:
                continue
            if note_id not in seen:
                seen.add(note_id)
                notes.append({
                    "note_id": note_id,
                    "matched_tag": r.get("text", ""),
                    "score": round(r.get("score", 0), 4)
                })


        return jsonify({
            "status": "success",
            "query": query,
            "matches": notes
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
