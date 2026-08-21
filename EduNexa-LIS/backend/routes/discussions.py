from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime

discussions_bp = Blueprint('discussions', __name__)


def _serialize_discussion(doc):
    return {
        'id': str(doc['_id']),
        'title': doc['title'],
        'content': doc.get('content', ''),
        'course_id': doc.get('course_id'),
        'course_title': doc.get('course_title', ''),
        'tags': doc.get('tags', []),
        'author_id': doc['author_id'],
        'author_name': doc['author_name'],
        'author_role': doc.get('author_role', ''),
        'created_at': doc['created_at'].isoformat(),
        'updated_at': doc['updated_at'].isoformat(),
        'last_reply_at': doc.get('last_reply_at', doc['created_at']).isoformat(),
        'reply_count': len(doc.get('replies', [])),
        'likes': len(doc.get('likes', [])),
        'is_resolved': doc.get('is_resolved', False)
    }


@discussions_bp.route('/', methods=['GET'])
@jwt_required()
def list_discussions():
    """Return all discussions (optionally filtered by course)."""
    db = current_app.db
    course_id = request.args.get('course_id')

    query = {}
    if course_id:
        query['course_id'] = course_id

    discussions = list(db.discussions.find(query).sort('last_reply_at', -1))
    serialized = [_serialize_discussion(doc) for doc in discussions]

    return jsonify({'discussions': serialized})


@discussions_bp.route('/', methods=['POST'])
@jwt_required()
def create_discussion():
    """Create a new discussion thread."""
    db = current_app.db
    user_id = get_jwt_identity()
    user = db.users.find_one({'_id': ObjectId(user_id)})

    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    title = (data.get('title') or '').strip()
    content = (data.get('content') or '').strip()
    tags = data.get('tags') or []
    course_id = data.get('course_id')

    if not title or not content:
        return jsonify({'error': 'Title and content are required'}), 400

    course_title = ''
    if course_id and ObjectId.is_valid(course_id):
        course = db.courses.find_one({'_id': ObjectId(course_id)})
        if course:
            course_title = course.get('title', '')
        else:
            course_id = None  # Course not found, store as general discussion

    now = datetime.utcnow()
    discussion_doc = {
        'title': title,
        'content': content,
        'course_id': course_id,
        'course_title': course_title,
        'tags': [str(tag).lower() for tag in tags if isinstance(tag, str)],
        'author_id': user_id,
        'author_name': user.get('name', 'User'),
        'author_role': user.get('role', ''),
        'created_at': now,
        'updated_at': now,
        'last_reply_at': now,
        'likes': [],
        'replies': [],
        'is_resolved': False
    }

    result = db.discussions.insert_one(discussion_doc)
    discussion_doc['_id'] = result.inserted_id

    return jsonify({'discussion': _serialize_discussion(discussion_doc)}), 201


@discussions_bp.route('/<discussion_id>', methods=['GET'])
@jwt_required()
def get_discussion(discussion_id):
    """Get a single discussion with all replies."""
    db = current_app.db
    
    if not ObjectId.is_valid(discussion_id):
        return jsonify({'error': 'Invalid discussion ID'}), 400
    
    discussion = db.discussions.find_one({'_id': ObjectId(discussion_id)})
    if not discussion:
        return jsonify({'error': 'Discussion not found'}), 404
    
    # Serialize discussion with replies
    serialized = _serialize_discussion(discussion)
    serialized['replies'] = discussion.get('replies', [])
    
    return jsonify({'discussion': serialized})


@discussions_bp.route('/<discussion_id>/reply', methods=['POST'])
@jwt_required()
def add_reply(discussion_id):
    """Add a reply to a discussion."""
    db = current_app.db
    user_id = get_jwt_identity()
    user = db.users.find_one({'_id': ObjectId(user_id)})
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if not ObjectId.is_valid(discussion_id):
        return jsonify({'error': 'Invalid discussion ID'}), 400
    
    discussion = db.discussions.find_one({'_id': ObjectId(discussion_id)})
    if not discussion:
        return jsonify({'error': 'Discussion not found'}), 404
    
    data = request.get_json() or {}
    content = (data.get('content') or '').strip()
    
    if not content:
        return jsonify({'error': 'Reply content is required'}), 400
    
    now = datetime.utcnow()
    reply = {
        'id': str(ObjectId()),
        'author_id': user_id,
        'author_name': user.get('name', 'User'),
        'author_role': user.get('role', ''),
        'content': content,
        'created_at': now.isoformat(),
        'likes': []
    }
    
    # Add reply to discussion
    db.discussions.update_one(
        {'_id': ObjectId(discussion_id)},
        {
            '$push': {'replies': reply},
            '$set': {
                'last_reply_at': now,
                'updated_at': now
            }
        }
    )
    
    return jsonify({'reply': reply}), 201


@discussions_bp.route('/<discussion_id>/resolve', methods=['POST'])
@jwt_required()
def resolve_discussion(discussion_id):
    """Mark a discussion as resolved."""
    db = current_app.db
    user_id = get_jwt_identity()
    
    if not ObjectId.is_valid(discussion_id):
        return jsonify({'error': 'Invalid discussion ID'}), 400
    
    discussion = db.discussions.find_one({'_id': ObjectId(discussion_id)})
    if not discussion:
        return jsonify({'error': 'Discussion not found'}), 404
    
    # Only author or teacher can resolve
    user = db.users.find_one({'_id': ObjectId(user_id)})
    if discussion['author_id'] != user_id and user.get('role') not in ['teacher', 'admin', 'super_admin']:
        return jsonify({'error': 'Only the author or a teacher can resolve this discussion'}), 403
    
    db.discussions.update_one(
        {'_id': ObjectId(discussion_id)},
        {'$set': {'is_resolved': True, 'updated_at': datetime.utcnow()}}
    )
    
    return jsonify({'message': 'Discussion marked as resolved'})

