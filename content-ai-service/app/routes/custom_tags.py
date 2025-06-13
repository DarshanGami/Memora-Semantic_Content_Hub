import uuid
from flask import Blueprint, request, jsonify
from bson import ObjectId
from app.services.embedder import embed_texts
from app.services.mongo_client import db

custom_tags_router = Blueprint("custom_tags_router", __name__)

# MongoDB collections
image_vector_collection = db["image_vectors"]
note_vector_collection = db["note_vectors"]
link_vector_collection = db["link_vectors"]

# =========================
#        ADD TAG APIs
# =========================

@custom_tags_router.route("/add/image-tag", methods=["POST"])
def add_image_tag():
    data = request.get_json()
    if not data or "content_id" not in data or "custom_tag" not in data:
        return jsonify({"error": "Missing content_id or custom_tag"}), 400

    content_id = data["content_id"]
    custom_tag = data["custom_tag"]
    tag_vectors = embed_texts([custom_tag])

    for entry in tag_vectors:
        image_vector_collection.insert_one({
            "content_id": content_id,
            "text": entry["text"],
            "vector": entry["vector"]
        })

    return jsonify({"status": "success", "message": "Custom tag added to image."})


@custom_tags_router.route("/add/note-tag", methods=["POST"])
def add_note_tag():
    data = request.get_json()
    if not data or "content_id" not in data or "custom_tag" not in data:
        return jsonify({"error": "Missing content_id or custom_tag"}), 400

    content_id = data["content_id"]
    custom_tag = data["custom_tag"]
    tag_vectors = embed_texts([custom_tag])

    for entry in tag_vectors:
        note_vector_collection.insert_one({
            "content_id": content_id,
            "text": entry["text"],
            "vector": entry["vector"]
        })

    return jsonify({"status": "success", "message": "Custom tag added to note."})


@custom_tags_router.route("/add/link-tag", methods=["POST"])
def add_link_tag():
    data = request.get_json()
    if not data or "content_id" not in data or "custom_tag" not in data:
        return jsonify({"error": "Missing content_id or custom_tag"}), 400

    content_id = data["content_id"]
    custom_tag = data["custom_tag"]
    tag_vectors = embed_texts([custom_tag])

    for entry in tag_vectors:
        link_vector_collection.insert_one({
            "content_id": content_id,
            "text": entry["text"],
            "vector": entry["vector"]
        })

    return jsonify({"status": "success", "message": "Custom tag added to link."})


# =========================
#       DELETE TAG APIs (by _id)
# =========================

@custom_tags_router.route("/delete/image-tag", methods=["DELETE"])
def delete_image_tag():
    content_id = request.args.get("content_id")
    custom_tag = request.args.get("custom_tag")

    if not content_id or not custom_tag:
        return jsonify({"error": "Missing content_id or custom_tag"}), 400

    try:
        result = image_vector_collection.delete_one({
            "content_id": content_id,
            "text": custom_tag
        })
        print(f"Deleted tag: {custom_tag}, id: {content_id}")
        return jsonify({
            "status": "success",
            "deleted_count": result.deleted_count,
            "message": f"Deleted {result.deleted_count} image tag(s)."
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@custom_tags_router.route("/delete/note-tag", methods=["DELETE"])
def delete_note_tag():
    content_id = request.args.get("content_id")
    custom_tag = request.args.get("custom_tag")

    if not content_id or not custom_tag:
        return jsonify({"error": "Missing content_id or custom_tag"}), 400

    try:
        result = note_vector_collection.delete_one({
            "content_id": content_id,
            "text": custom_tag
        })
        print(f"Deleted note tag: {custom_tag}, id: {content_id}")
        return jsonify({
            "status": "success",
            "deleted_count": result.deleted_count,
            "message": f"Deleted {result.deleted_count} note tag(s)."
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@custom_tags_router.route("/delete/link-tag", methods=["DELETE"])
def delete_link_tag():
    content_id = request.args.get("content_id")
    custom_tag = request.args.get("custom_tag")

    if not content_id or not custom_tag:
        return jsonify({"error": "Missing content_id or custom_tag"}), 400

    try:
        result = link_vector_collection.delete_one({
            "content_id": content_id,
            "text": custom_tag
        })
        print(f"Deleted link tag: {custom_tag}, id: {content_id}")
        return jsonify({
            "status": "success",
            "deleted_count": result.deleted_count,
            "message": f"Deleted {result.deleted_count} link tag(s)."
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500



