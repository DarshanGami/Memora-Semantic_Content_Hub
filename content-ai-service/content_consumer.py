import json
import requests
import base64
import re
import os
from dotenv import load_dotenv

from kafka import KafkaConsumer, KafkaProducer
from app.services.tagger import (
    get_tags_from_note_text,
    get_tags_from_image_base64,
    generate_tags_from_url,
)
load_dotenv()

BROKER_URL = os.getenv("BROKER_URL")
USERNAME = os.getenv("USERNAME")
PASSWORD = os.getenv("PASSWORD")

from app.services.embedder import embed_texts
from app.services.mongo_client import db

# Collections to store vectors separately per content type
note_vector_collection = db["note_vectors"]
image_vector_collection = db["image_vectors"]
link_vector_collection = db["link_vectors"]

def safe_json_deserializer(m):
    try:
        text = m.decode("utf-8")
        # Remove unescaped control characters (except \n, \t, etc. if you want to keep them)
        text = re.sub(r'[\x00-\x1f\x7f]', ' ', text)  # Replaces invalid control chars with space
        return json.loads(text)
    except Exception as e:
        print("❌ Failed to decode JSON:", e)
        print("🧾 Raw message:", m)
        return None
    
# consumer = KafkaConsumer(
#     "tag-request",
#     bootstrap_servers="redpanda:9092",
#     group_id="ai-content-consumer-new",
#     value_deserializer=safe_json_deserializer,
#     api_version=(0, 10)
# )

# producer = KafkaProducer(
#     bootstrap_servers="redpanda:9092",
#     value_serializer=lambda m: json.dumps(m).encode("utf-8"),
#     api_version=(0, 10)
# )

# Consumer setup
consumer = KafkaConsumer(
    "tag-request",
    bootstrap_servers=BROKER_URL,
    group_id="ai-content-consumer-new",
    value_deserializer=safe_json_deserializer,
    security_protocol="SASL_SSL",
    sasl_mechanism="SCRAM-SHA-256",
    sasl_plain_username=USERNAME,
    sasl_plain_password=PASSWORD,
)

# Producer setup
producer = KafkaProducer(
    bootstrap_servers=BROKER_URL,
    value_serializer=lambda m: json.dumps(m).encode("utf-8"),
    security_protocol="SASL_SSL",
    sasl_mechanism="SCRAM-SHA-256",
    sasl_plain_username=USERNAME,
    sasl_plain_password=PASSWORD,
)

print("🧠 AI Backend Content Consumer is running...")


def fetch_image_and_convert_to_base64(url):
    """Fetch image bytes from URL and convert to base64 string."""
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    image_bytes = response.content
    base64_image = base64.b64encode(image_bytes).decode("utf-8").replace("\n", "")
    return base64_image


for message in consumer:
    data = message.value
    content_type = data.get("content_type")
    content_id = data.get("content_id")
    text = data.get("text", "")

    try:
        if content_type == "note":
            # Use existing Gemini note tag generator
            tags = get_tags_from_note_text(text)

            # Embed and store tags
            vectors = embed_texts(tags)
            for entry in vectors:
                note_vector_collection.insert_one({
                    "content_id": content_id,
                    "text": entry["text"],
                    "vector": entry["vector"]
                })

        elif content_type == "image":
            # For images, text is the Cloudinary URL
            base64_image = fetch_image_and_convert_to_base64(text)
            tags = get_tags_from_image_base64(base64_image)

            vectors = embed_texts(tags)
            for entry in vectors:
                image_vector_collection.insert_one({
                    "content_id": content_id,
                    "text": entry["text"],
                    "vector": entry["vector"]
                })

        elif content_type == "link":
            # Generate tags from URL string
            tags = generate_tags_from_url(text)

            vectors = embed_texts(tags)
            for entry in vectors:
                link_vector_collection.insert_one({
                    "content_id": content_id,
                    "text": entry["text"],
                    "vector": entry["vector"]
                })

        else:
            print(f"⚠️ Skipping unsupported content_type: {content_type}")
            continue

        # Send tag response back to main backend
        producer.send("tag-response", {
            "content_id": content_id,
            "content_type": content_type,
            "tags": tags
        })

        print(f"✅ Processed {content_type}: {content_id}, tags: {tags}")

    except Exception as e:
        print(f"❌ Error processing {content_type} {content_id}: {e}")
