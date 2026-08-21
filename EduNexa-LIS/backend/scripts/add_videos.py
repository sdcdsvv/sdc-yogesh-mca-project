"""Add YouTube Videos to All Courses"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# Course videos mapping
VIDEOS = {
    "Machine Learning": [
        {"title": "Intro to ML", "url": "https://www.youtube.com/watch?v=ukzFI9rgwfU", "desc": "ML fundamentals", "duration": "45 min"},
        {"title": "Supervised Learning", "url": "https://www.youtube.com/watch?v=4qVRBYAdLAo", "desc": "Supervised learning guide", "duration": "30 min"}
    ],
    "Web Development": [
        {"title": "Full Stack Tutorial", "url": "https://www.youtube.com/watch?v=nu_pCVPKzTk", "desc": "Full stack guide", "duration": "60 min"},
        {"title": "React Tutorial", "url": "https://www.youtube.com/watch?v=SqcY0GlETPk", "desc": "React basics", "duration": "50 min"}
    ],
    "Data Science": [
        {"title": "Data Science Course", "url": "https://www.youtube.com/watch?v=ua-CiDNNj30", "desc": "Complete DS course", "duration": "90 min"},
        {"title": "Python Data Analysis", "url": "https://www.youtube.com/watch?v=GPVsHOlRBBI", "desc": "Pandas tutorial", "duration": "40 min"}
    ],
    "Cloud Computing": [
        {"title": "AWS Tutorial", "url": "https://www.youtube.com/watch?v=k1RI5locZE4", "desc": "AWS basics", "duration": "75 min"},
        {"title": "Cloud Fundamentals", "url": "https://www.youtube.com/watch?v=M988_fsOSWo", "desc": "Cloud computing intro", "duration": "35 min"}
    ],
    "Mobile": [
        {"title": "React Native", "url": "https://www.youtube.com/watch?v=0-S5a0eXPoc", "desc": "Mobile app dev", "duration": "120 min"}
    ],
    "Python": [
        {"title": "Python Tutorial", "url": "https://www.youtube.com/watch?v=_uQrJ0TkZlc", "desc": "Python course", "duration": "240 min"}
    ]
}

def get_videos(title, category):
    for key, vids in VIDEOS.items():
        if key.lower() in title.lower() or key.lower() in category.lower():
            return vids
    return [{"title": f"Intro to {title}", "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "desc": f"Learn {title}", "duration": "45 min"}]

def main():
    try:
        mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/edunexadb')
        client = MongoClient(mongo_uri)
        db = client.get_database()
        
        print("Adding YouTube videos to courses...")
        courses = list(db.courses.find())
        print(f"Found {len(courses)} courses")
        
        added = 0
        for course in courses:
            cid = str(course['_id'])
            title = course.get('title', 'Unknown')
            cat = course.get('category', 'General')
            tid = course.get('teacher_id')
            
            print(f"\nProcessing: {title}")
            
            # Check existing YouTube videos only
            existing = db.materials.count_documents({
                'course_id': cid, 
                'type': 'video', 
                'youtube_url': {'$exists': True, '$ne': ''}
            })
            if existing > 0:
                print(f"  Already has {existing} YouTube video(s), skipping")
                continue
            
            # Get/create module
            mod = db.modules.find_one({'course_id': cid})
            if not mod:
                mod_data = {'course_id': cid, 'title': 'Introduction', 'description': 'Getting started', 'order': 1, 'created_at': datetime.utcnow()}
                mid = str(db.modules.insert_one(mod_data).inserted_id)
            else:
                mid = str(mod['_id'])
            
            # Add videos
            vids = get_videos(title, cat)
            for i, v in enumerate(vids):
                mat = {
                    'course_id': cid, 'module_id': mid, 'title': v['title'], 'description': v['desc'],
                    'type': 'video', 'content': '', 'youtube_url': v['url'], 'duration': v['duration'],
                    'order': i+1, 'is_required': True, 'uploaded_by': tid, 'created_at': datetime.utcnow(),
                    'views': 0, 'completed_by': []
                }
                db.materials.insert_one(mat)
                added += 1
                print(f"  Added: {v['title']}")
        
        print(f"\nSuccess! Added {added} videos")
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
