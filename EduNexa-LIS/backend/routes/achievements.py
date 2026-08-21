from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime, timedelta

achievements_bp = Blueprint('achievements', __name__)

DEFAULT_ACHIEVEMENTS = [
    {
        'code': 'first_course_completion',
        'title': 'First Steps',
        'description': 'Complete your first course to unlock this achievement.',
        'category': 'learning',
        'rarity': 'common',
        'points': 10,
        'requirements': ['Complete at least one course with 100% progress'],
        'metric': 'courses_completed',
        'threshold': 1,
        'icon': '🎓'
    },
    {
        'code': 'course_champion',
        'title': 'Course Champion',
        'description': 'Complete three courses end-to-end.',
        'category': 'learning',
        'rarity': 'rare',
        'points': 40,
        'requirements': ['Finish three courses with full progress'],
        'metric': 'courses_completed',
        'threshold': 3,
        'icon': '🏅'
    },
    {
        'code': 'assignment_streak',
        'title': 'Assignment Streak',
        'description': 'Submit five assignments to keep the learning momentum going.',
        'category': 'engagement',
        'rarity': 'common',
        'points': 20,
        'requirements': ['Submit five assignments'],
        'metric': 'assignments_submitted',
        'threshold': 5,
        'icon': '📝'
    },
    {
        'code': 'perfect_score',
        'title': 'Perfect Score',
        'description': 'Earn a perfect grade on any assignment.',
        'category': 'performance',
        'rarity': 'epic',
        'points': 75,
        'requirements': ['Score the maximum points on an assignment'],
        'metric': 'assignments_perfect',
        'threshold': 1,
        'icon': '💯'
    },
    {
        'code': 'early_bird',
        'title': 'Early Bird',
        'description': 'Submit three assignments at least 24 hours before the deadline.',
        'category': 'engagement',
        'rarity': 'rare',
        'points': 35,
        'requirements': ['Submit three assignments a full day before they are due'],
        'metric': 'assignments_on_time',
        'threshold': 3,
        'icon': '🐦'
    }
]


def _ensure_achievements_seeded(db):
    """Seed default achievement definitions if they do not exist."""
    for achievement in DEFAULT_ACHIEVEMENTS:
        db.achievements.update_one(
            {'code': achievement['code']},
            {
                '$setOnInsert': {
                    **achievement,
                    'created_at': datetime.utcnow()
                }
            },
            upsert=True
        )


def _calculate_user_metrics(db, user_id: str) -> dict:
    """Aggregate metrics used for achievements for a given user."""
    metrics = {
        'courses_completed': 0,
        'assignments_submitted': 0,
        'assignments_perfect': 0,
        'assignments_on_time': 0,
    }

    # Courses completed (progress >= 100)
    metrics['courses_completed'] = db.enrollments.count_documents({
        'student_id': user_id,
        'progress': {'$gte': 100}
    })

    # Assignment submissions
    submissions = list(db.submissions.find({'student_id': user_id}))
    metrics['assignments_submitted'] = len(submissions)

    if not submissions:
        return metrics

    assignment_ids = []
    for submission in submissions:
        assignment_id = submission.get('assignment_id')
        if assignment_id and ObjectId.is_valid(assignment_id):
            assignment_ids.append(ObjectId(assignment_id))

    assignments_map = {}
    if assignment_ids:
        assignments = db.assignments.find({'_id': {'$in': assignment_ids}})
        for assignment in assignments:
            assignments_map[str(assignment['_id'])] = assignment

    for submission in submissions:
        assignment = assignments_map.get(submission.get('assignment_id'))
        if not assignment:
            continue

        max_points = assignment.get('max_points')
        grade = submission.get('grade')
        submitted_at = submission.get('submitted_at')
        due_date = assignment.get('due_date')

        if max_points and grade is not None and grade >= max_points:
            metrics['assignments_perfect'] += 1

        if submitted_at and isinstance(submitted_at, datetime) and due_date and isinstance(due_date, datetime):
            # Consider it "on time" if submitted at least 24 hours before due date
            if submitted_at <= (due_date - timedelta(hours=24)):
                metrics['assignments_on_time'] += 1

    return metrics


def _serialize_achievement(definition, progress_current, unlocked_at, is_unlocked):
    """Serialize definition and progress into API response."""
    return {
        'id': str(definition['_id']),
        'code': definition['code'],
        'title': definition['title'],
        'description': definition['description'],
        'category': definition.get('category', 'learning'),
        'rarity': definition.get('rarity', 'common'),
        'points': definition.get('points', 0),
        'icon': definition.get('icon', '🏆'),
        'requirements': definition.get('requirements', []),
        'progress': {
            'current': progress_current,
            'total': definition.get('threshold', 1)
        },
        'is_unlocked': is_unlocked,
        'unlocked_at': unlocked_at.isoformat() if unlocked_at else None
    }


@achievements_bp.route('/', methods=['GET'])
@jwt_required()
def get_achievements():
    """Return achievement progress for the current user."""
    db = current_app.db
    user_id = get_jwt_identity()

    _ensure_achievements_seeded(db)

    definitions = list(db.achievements.find())
    metrics = _calculate_user_metrics(db, user_id)

    unlocked_records = {
        record['achievement_code']: record
        for record in db.user_achievements.find({'user_id': user_id})
    }

    response = []

    for definition in definitions:
        threshold = max(int(definition.get('threshold', 1)), 1)
        metric_name = definition.get('metric')
        metric_value = metrics.get(metric_name, 0)
        progress_current = min(metric_value, threshold)
        unlocked_record = unlocked_records.get(definition['code'])
        is_unlocked = bool(unlocked_record) or metric_value >= threshold

        if is_unlocked and not unlocked_record:
            unlocked_record = {
                'user_id': user_id,
                'achievement_code': definition['code'],
                'unlocked_at': datetime.utcnow()
            }
            db.user_achievements.insert_one(unlocked_record)

        unlocked_at = unlocked_record['unlocked_at'] if unlocked_record else None
        response.append(_serialize_achievement(definition, progress_current, unlocked_at, is_unlocked))

    return jsonify({'achievements': response})

