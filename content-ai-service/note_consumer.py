from kafka import KafkaConsumer, KafkaProducer
import json
from app.services.tagger import get_tags_from_note_text  # Function to extract tags
from app.services.embedder import embed_texts
from app.services.mongo_client import db

note_vector_collection = db["note_vectors"]

consumer = KafkaConsumer(
    "tag-request",
    bootstrap_servers="127.0.0.1:9092",
    group_id="ai-note-consumer",
    value_deserializer=lambda m: json.loads(m.decode("utf-8")),
    api_version=(0, 10)
)

producer = KafkaProducer(
    bootstrap_servers="127.0.0.1:9092",
    value_serializer=lambda m: json.dumps(m).encode("utf-8"),
    api_version=(0, 10)
)

print("🧠 AI Backend Note Consumer is running...")

for message in consumer:
    data = message.value

    if data.get("content_type") != "note":
        continue

    content_id = data.get("content_id")
    note_text = data.get("text")

    try:
        # Generate tags dynamically using get_tags_from_note_text function
        tags = get_tags_from_note_text(note_text)  # Get tags dynamically from text

        # Optionally: Use embedding logic if you want to generate vector embeddings
        vectors = embed_texts(tags)

        # Save generated embeddings in MongoDB (optional)
        for entry in vectors:
            note_vector_collection.insert_one({
                "note_id": content_id,
                "text": entry["text"],
                "vector": entry["vector"]
            })

        # Send dynamically generated tags back to Kafka 'tag-response' topic
        producer.send("tag-response", {
            "content_id": content_id,
            "tags": tags  # Send tags to Main Backend
        })

        print(f"✅ Processed note: {content_id}, Tags: {tags}")

    except Exception as e:
        print(f"❌ Error processing note: {e}")
