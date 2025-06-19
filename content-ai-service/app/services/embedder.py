# app/services/embedder.py
import logging
import torch
import numpy as np
from sentence_transformers import SentenceTransformer

# Log device info
device = "cuda" if torch.cuda.is_available() else "cpu"
logging.info(f"🧠 Loading embedding model on device: {device}")

# Load model only once at startup
model = SentenceTransformer("mixedbread-ai/mxbai-embed-large-v1", device=device)
logging.info("✅ Embedding model loaded and ready.")

def embed_texts(text_list):
    """
    Converts a list of strings to 1024-dim vectors using the loaded model.
    Returns a list of dictionaries: { "text": ..., "vector": [...] }
    """
    if not text_list:
        return []

    # Ensure strings are stripped
    cleaned_texts = []
    for t in text_list:
        stripped = t.strip()
        if stripped:
            cleaned_texts.append(stripped)

    if not cleaned_texts:
        return []

    # Generate embeddings
    vectors = model.encode(cleaned_texts, show_progress_bar=False, normalize_embeddings=True)

    # Convert vectors to lists of floats (for MongoDB storage)
    return [
        {
            "text": text,
            "vector": vector.tolist() if isinstance(vector, np.ndarray) else list(vector)
        }
        for text, vector in zip(cleaned_texts, vectors)
    ]
