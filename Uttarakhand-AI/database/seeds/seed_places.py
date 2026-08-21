"""Script to seed places data into MongoDB"""
import json
import sys
import os
from pymongo import MongoClient
from datetime import datetime

# Add parent directory to path to import config
sys.path.append(os.path.join(os.path.dirname(__file__), '../../backend'))

from app.config.settings import Config

def seed_places():
    """Seed places data from JSON file"""
    try:
        # Connect to MongoDB
        client = MongoClient(Config.MONGO_URI)
        db = client[Config.DB_NAME]
        places_collection = db['places']
        
        # Load seed data
        json_path = os.path.join(os.path.dirname(__file__), 'seed_data.json')
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        places = data.get('places', [])
        
        # Add timestamps
        for place in places:
            place['created_at'] = datetime.utcnow()
            place['updated_at'] = datetime.utcnow()
        
        # Insert places
        if places:
            result = places_collection.insert_many(places)
            print(f"✅ Successfully seeded {len(result.inserted_ids)} places")
        else:
            print("⚠️  No places found in seed data")
        
        # Seed emergencies
        emergencies_collection = db['emergencies']
        emergencies = data.get('emergencies', [])
        
        if emergencies:
            result = emergencies_collection.insert_many(emergencies)
            print(f"✅ Successfully seeded {len(result.inserted_ids)} emergency contacts")
        
        client.close()
        print("✅ Seeding completed successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding data: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    seed_places()

