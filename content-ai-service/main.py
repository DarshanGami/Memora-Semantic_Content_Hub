# main.py

from flask import Flask
from flask_cors import CORS
import os

# Import Blueprints
from app.routes.image import image_router
from app.routes.search import search_router
from app.routes.note import note_router
from app.routes.search_note import search_note_router
from app.routes.link import link_router
from app.routes.search_link import search_link_router
from app.routes.custom_tags import custom_tags_router

def create_app():
    app = Flask(__name__)

    # Enable CORS for all domains on all routes
    CORS(app)

    # Register Blueprints with common /api prefix
    app.register_blueprint(image_router, url_prefix="/api")
    app.register_blueprint(search_router, url_prefix="/api")
    app.register_blueprint(note_router, url_prefix="/api")
    app.register_blueprint(search_note_router, url_prefix="/api")
    app.register_blueprint(link_router, url_prefix="/api")
    app.register_blueprint(search_link_router, url_prefix="/api")
    app.register_blueprint(custom_tags_router, url_prefix="/api")

    return app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app = create_app()
    app.run(host="0.0.0.0", port=port, debug=True)
