# app/services/mongo_client.py

import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")  # Add this to .env
DB_NAME = "memora"

# Create and export the database client
client = MongoClient(MONGO_URI)
db = client[DB_NAME]


