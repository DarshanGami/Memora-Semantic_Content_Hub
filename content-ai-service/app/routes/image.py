# app/routes/image.py

import base64
from flask import Blueprint, request, jsonify
from app.services.tagger import get_tags_from_image_base64
from app.services.embedder import embed_texts
from app.services.mongo_client import image_vector_collection
import uuid


image_router = Blueprint("image_router", __name__)

@image_router.route("/image", methods=["POST"])
def process_image():
    if "file" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image_file = request.files["file"]
    image_bytes = image_file.read()

    # Convert to base64
    base64_image = base64.b64encode(image_bytes).decode("utf-8").replace("\n", "")

    try:
        tags = get_tags_from_image_base64(base64_image)
        tag_vectors = embed_texts(tags)

        image_id = str(uuid.uuid4())  # Generate unique ID

        # Insert each tag + vector into MongoDB
        for entry in tag_vectors:
            image_vector_collection.insert_one({
                "image_id": image_id,
                "text": entry["text"],
                "vector": entry["vector"]
            })

        return jsonify({
            "status": "success",
            "image_id": image_id,
            "tags": [entry["text"] for entry in tag_vectors]  # Only return tag strings
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
