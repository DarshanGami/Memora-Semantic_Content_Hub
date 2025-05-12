# app/services/tagger.py

import os
import json
import httpx
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise EnvironmentError("GEMINI_API_KEY not set in environment or .env file")

GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
HEADERS = {"Content-Type": "application/json"}
PROMPT = "Return a flat JSON array of lowercase tags describing this image. No explanation, just the array."

def get_tags_from_image_base64(base64_image: str):
    """
    Send a base64-encoded image to Gemini Flash and return a list of tags.
    """
    payload = {
        "contents": [{
            "parts": [
                {"text": PROMPT},
                {
                    "inline_data": {
                        "mime_type": "image/jpeg",
                        "data": base64_image
                    }
                }
            ]
        }],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "ARRAY",
                "items": {"type": "STRING"}
            }
        }
    }

    response = httpx.post(GEMINI_URL, headers=HEADERS, json=payload, timeout=15.0)

    if response.status_code != 200:
        raise Exception(f"Gemini API failed: {response.status_code} - {response.text}")

    result = response.json()
    parts = result["candidates"][0]["content"]["parts"][0]

    if "json_data" in parts:
        return parts["json_data"]
    elif "text" in parts:
        return json.loads(parts["text"])
    else:
        raise Exception("Gemini did not return tags.")
