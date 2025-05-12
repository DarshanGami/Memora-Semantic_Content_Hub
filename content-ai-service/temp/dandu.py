from sentence_transformers import SentenceTransformer

# Load model
model = SentenceTransformer("mixedbread-ai/mxbai-embed-large-v1")

# Define tags to embed
tags = ["vacation mood"]

# Generate embeddings (each will be 1024-d)
vectors = model.encode(tags)

# Print sample
print(f"Tag: {tags[0]}")
print(f"Vector length: {len(vectors[0])}")
print(f"First 5 vector values: {vectors[0][:5]}")
