# app/routes/link.py

from flask import Blueprint, request, jsonify
from app.services.tagger import generate_tags_from_url
from app.services.embedder import embed_texts
from app.services.mongo_client import db
import uuid

link_router = Blueprint("link_router", __name__)
link_vector_collection = db["link_vectors"]

@link_router.route("/link", methods=["POST"])
def process_link():
    data = request.get_json()
    if not data or "url" not in data:
        return jsonify({"error": "Missing URL in request body"}), 400

    url = data["url"]
    try:
        # Step 1: Generate tags from the URL using Gemini (from tagger.py)
        tags = generate_tags_from_url(url)
        
        # Step 2: Embed the tags
        tag_vectors = embed_texts(tags)

        # Step 3: Store the tags with vectors in MongoDB
        link_id = str(uuid.uuid4())  # Generate unique ID for the link

        for entry in tag_vectors:
            link_vector_collection.insert_one({
                "link_id": link_id,
                "url": url,
                "text": entry["text"],
                "vector": entry["vector"]
            })

        return jsonify({
            "status": "success",
            "link_id": link_id,
            "tags": [entry["text"] for entry in tag_vectors]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
