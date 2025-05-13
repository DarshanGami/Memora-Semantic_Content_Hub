# app/routes/custom_tags.py

import uuid  # Import uuid for generating unique tag IDs

from flask import Blueprint, request, jsonify
from app.services.embedder import embed_texts
from app.services.mongo_client import db

custom_tags_router = Blueprint("custom_tags_router", __name__)

# Collections
image_vector_collection = db["image_vectors"]
note_vector_collection = db["note_vectors"]
link_vector_collection = db["link_vectors"]

@custom_tags_router.route("/add/image-tag", methods=["POST"])
def add_image_tag():
    data = request.get_json()
    if not data or "image_id" not in data or "custom_tag" not in data:
        return jsonify({"error": "Missing image_id or custom_tag"}), 400

    image_id = data["image_id"]
    custom_tag = data["custom_tag"]

    # Generate the vector for the custom tag using Hugging Face
    tag_vectors = embed_texts([custom_tag])

    # Insert a new document for each custom tag without adding tag_id
    for entry in tag_vectors:
        image_vector_collection.insert_one({
            "image_id": image_id,  # Attach the image ID
            "text": entry["text"],  # Custom tag as a new entry (string)
            "vector": entry["vector"]  # Add the corresponding vector for the tag
        })

    return jsonify({"status": "success", "message": "Custom tag added as a new entry for image."})

@custom_tags_router.route("/add/note-tag", methods=["POST"])
def add_note_tag():
    data = request.get_json()
    if not data or "note_id" not in data or "custom_tag" not in data:
        return jsonify({"error": "Missing note_id or custom_tag"}), 400

    note_id = data["note_id"]
    custom_tag = data["custom_tag"]

    # Generate the vector for the custom tag using Hugging Face
    tag_vectors = embed_texts([custom_tag])

    # Insert a new document for each custom tag without adding tag_id
    for entry in tag_vectors:
        note_vector_collection.insert_one({
            "note_id": note_id,  # Attach the note ID
            "text": entry["text"],  # Custom tag as a new entry (string)
            "vector": entry["vector"]  # Add the corresponding vector for the tag
        })

    return jsonify({"status": "success", "message": "Custom tag added as a new entry for note."})

@custom_tags_router.route("/add/link-tag", methods=["POST"])
def add_link_tag():
    data = request.get_json()
    if not data or "link_id" not in data or "custom_tag" not in data:
        return jsonify({"error": "Missing link_id or custom_tag"}), 400

    link_id = data["link_id"]
    custom_tag = data["custom_tag"]

    # Generate the vector for the custom tag using Hugging Face
    tag_vectors = embed_texts([custom_tag])

    # Insert a new document for each custom tag without adding tag_id
    for entry in tag_vectors:
        link_vector_collection.insert_one({
            "link_id": link_id,  # Attach the link ID
            "text": entry["text"],  # Custom tag as a new entry (string)
            "vector": entry["vector"]  # Add the corresponding vector for the tag
        })

    return jsonify({"status": "success", "message": "Custom tag added as a new entry for link."})
