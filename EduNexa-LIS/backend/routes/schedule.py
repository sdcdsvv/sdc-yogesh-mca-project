from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime

schedule_bp = Blueprint('schedule', __name__)

EVENT_COLORS = {
    'class': 'bg-blue-500',
    'meeting': 'bg-purple-500',
    'deadline': 'bg-red-500',
    'exam': 'bg-orange-500',
    'office-hours': 'bg-green-500'
}


def _serialize_event(doc):
    return {
        'id': str(doc['_id']),
        'title': doc['title'],
        'description': doc.get('description', ''),
        'type': doc.get('type', 'class'),
        'date': doc['date'],
        'startTime': doc['start_time'],
        'endTime': doc['end_time'],
        'location': doc.get('location', ''),
        'courseId': doc.get('course_id'),
        'courseTitle': doc.get('course_title', ''),
        'color': doc.get('color', EVENT_COLORS.get(doc.get('type', 'class'), 'bg-blue-500')),
        'isShared': doc.get('is_shared', False),
        'createdAt': doc['created_at'].isoformat(),
        'updatedAt': doc['updated_at'].isoformat()
    }


def _resolve_course_title(db, course_id: str) -> str:
    if not course_id or not ObjectId.is_valid(course_id):
        return ''

    course = db.courses.find_one({'_id': ObjectId(course_id)})
    if course:
        return course.get('title', '')
    return ''


@schedule_bp.route('/events', methods=['GET'])
@jwt_required()
def get_events():
    """Return all schedule events for the current user."""
    db = current_app.db
    user_id = get_jwt_identity()
    include_shared = request.args.get('include_shared', 'false').lower() == 'true'

    if include_shared:
        query = {'$or': [{'user_id': user_id}, {'is_shared': True}]}
    else:
        query = {'user_id': user_id}

    events = list(db.schedule_events.find(query).sort([('date', 1), ('start_time', 1)]))
    serialized = [_serialize_event(event) for event in events]

    return jsonify({'events': serialized})


@schedule_bp.route('/events', methods=['POST'])
@jwt_required()
def create_event():
    """Create a schedule event for the current user."""
    db = current_app.db
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    title = (data.get('title') or '').strip()
    date = (data.get('date') or '').strip()
    start_time = (data.get('startTime') or data.get('start_time') or '').strip()
    end_time = (data.get('endTime') or data.get('end_time') or '').strip()

    if not title or not date or not start_time or not end_time:
        return jsonify({'error': 'Title, date, start time and end time are required'}), 400

    event_type = (data.get('type') or 'class').strip().lower()
    color = EVENT_COLORS.get(event_type, EVENT_COLORS['class'])
    course_id = data.get('courseId') or data.get('course_id')
    course_title = _resolve_course_title(db, course_id)

    now = datetime.utcnow()
    event_doc = {
        'user_id': user_id,
        'title': title,
        'description': (data.get('description') or '').strip(),
        'type': event_type,
        'date': date,
        'start_time': start_time,
        'end_time': end_time,
        'location': (data.get('location') or '').strip(),
        'course_id': course_id if course_title else None,
        'course_title': course_title,
        'color': color,
        'is_shared': bool(data.get('isShared') or data.get('is_shared')),
        'created_at': now,
        'updated_at': now
    }

    result = db.schedule_events.insert_one(event_doc)
    event_doc['_id'] = result.inserted_id

    return jsonify({'event': _serialize_event(event_doc)}), 201


@schedule_bp.route('/events/<event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    """Delete a schedule event."""
    db = current_app.db
    user_id = get_jwt_identity()

    if not ObjectId.is_valid(event_id):
        return jsonify({'error': 'Invalid event id'}), 400

    event = db.schedule_events.find_one({'_id': ObjectId(event_id)})
    if not event:
        return jsonify({'error': 'Event not found'}), 404

    if event.get('user_id') != user_id:
        return jsonify({'error': 'Access denied'}), 403

    db.schedule_events.delete_one({'_id': ObjectId(event_id)})
    return jsonify({'message': 'Event deleted successfully'})

