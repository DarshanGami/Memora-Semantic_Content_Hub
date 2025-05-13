# app/routes/note.py

from flask import Blueprint, request, jsonify
from app.services.tagger import get_tags_from_note_text
from app.services.embedder import embed_texts
from app.services.mongo_client import db
import uuid

note_router = Blueprint("note_router", __name__)
note_vector_collection = db["note_vectors"]

@note_router.route("/note", methods=["POST"])
def process_note():
    data = request.get_json()
    if not data or "note_text" not in data:
        return jsonify({"error": "Missing note_text in request body"}), 400

    note_text = data["note_text"]
    try:
        tags = get_tags_from_note_text(note_text)
        tag_vectors = embed_texts(tags)
        note_id = str(uuid.uuid4())

        for entry in tag_vectors:
            note_vector_collection.insert_one({
                "note_id": note_id,
                "text": entry["text"],
                "vector": entry["vector"]
            })

        return jsonify({
            "status": "success",
            "note_id": note_id,
            "tags": [entry["text"] for entry in tag_vectors]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
