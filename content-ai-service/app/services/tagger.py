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


def get_tags_from_image_base64(base64_image: str):
    """
    Send a base64-encoded image to Gemini Flash and return a list of tags.
    """
    payload = {
        "contents": [{
            "parts": [
                {"text": "Return a flat JSON array of lowercase tags describing this image. No explanation, just the array."},
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






def get_tags_from_note_text(note_text: str):
    """
    Sends plain text note to Gemini Flash and returns a list of tags.
    """
    payload = {
        "contents": [{
            "parts": [
                {
                    "text": (
                                "Given the following content, generate a concise list of relevant tags or keywords that summarize its main topics and themes. "
                                "Prioritize nouns and key phrases. Avoid overly generic terms. The number of tags should be proportional to the content's length and complexity:\n\n"
                                "- Short paragraph (1–3 sentences): 3–5 tags\n"
                                "- Medium paragraph (4–7 sentences): 5–8 tags\n"
                                "- Long paragraph or full note (8+ sentences): 8–12 tags\n"
                                "- Extra long paragraph: up to 20 tags\n\n"
                                "Return only a flat JSON array of lowercase tags. No explanation.\n\n"
                                + note_text
                            )

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
        raise Exception("Gemini did not return tags for note text.")



def generate_tags_from_url(url):
    """
    Sends a URL to Gemini Flash and returns a list of tags based on its content.
    """
    payload = {
        "contents": [{
            "parts": [
                {"text": "Generate 5–10 relevant tags or keywords from the content of this URL that kind of summerise the website or link. Return a flat JSON array of lowercase tags only. No explanation.\n\n" + url}
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

    # Send request to Gemini
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