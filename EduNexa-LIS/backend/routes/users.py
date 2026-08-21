from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime
from typing import Any, Dict
from utils.api_response import error_response, success_response, prepare_api_response
from utils.case_converter import convert_dict_keys_to_camel

users_bp = Blueprint('users', __name__)

# -----------------------------
# Helpers
# -----------------------------

def to_object_id(value: str):
    """Safely convert a string to ObjectId or return None if invalid."""
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        return None


def serialize_user(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return {}
    doc = dict(doc)
    doc['_id'] = str(doc.get('_id'))
    doc.pop('password', None)
    # Convert nested ObjectIds if any
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            doc[k] = str(v)
    return doc

# -----------------------------
# Routes
# -----------------------------

@users_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    try:
        user_id = get_jwt_identity()
        db = current_app.db

        # Check if user is admin or super_admin
        me = db.users.find_one({'_id': to_object_id(user_id)})
        if not me or me.get('role') not in ['admin', 'super_admin']:
            return jsonify({'error': 'Admin access required'}), 403

        # Query params
        role = request.args.get('role')
        department = request.args.get('department')
        search = request.args.get('search')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))

        query: Dict[str, Any] = {}
        if role:
            query['role'] = role
        if department:
            query['department'] = department
        if search:
            query['$or'] = [
                {'name': {'$regex': search, '$options': 'i'}},
                {'email': {'$regex': search, '$options': 'i'}},
                {'roll_no': {'$regex': search, '$options': 'i'}},
                {'employee_id': {'$regex': search, '$options': 'i'}},
            ]

        total = db.users.count_documents(query)
        cursor = (db.users.find(query)
                  .skip(max(0, (page - 1) * limit))
                  .limit(limit)
                  .sort('created_at', -1))
        users = [serialize_user(u) for u in cursor]

        return jsonify({
            'users': users,
            'total': total,
            'page': page,
            'limit': limit,
            'total_pages': (total + limit - 1) // limit,
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@users_bp.route('/<target_user_id>', methods=['GET'])
@jwt_required()
def get_user(target_user_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db

        me = db.users.find_one({'_id': to_object_id(user_id)})
        if not me:
            return jsonify({'error': 'Unauthorized'}), 401

        target_oid = to_object_id(target_user_id)
        if not target_oid:
            return jsonify({'error': 'Invalid user id'}), 400

        # Only self or admin can view
        if me.get('role') != 'admin' and user_id != target_user_id:
            return jsonify({'error': 'Access denied'}), 403

        target_user = db.users.find_one({'_id': target_oid})
        if not target_user:
            return jsonify({'error': 'User not found'}), 404

        user_out = serialize_user(target_user)

        # Role-specific enrichments
        if user_out.get('role') == 'student':
            enrollments = list(db.enrollments.find({'student_id': target_user_id}))
            enrolled_courses = []
            for enr in enrollments:
                course = db.courses.find_one({'_id': to_object_id(enr.get('course_id'))})
                if course:
                    enrolled_courses.append({
                        'course_id': str(course['_id']),
                        'title': course.get('title'),
                        'progress': enr.get('progress', 0),
                        'enrolled_at': enr.get('enrolled_at'),
                    })
            user_out['enrolled_courses_details'] = enrolled_courses
            user_out['total_submissions'] = db.submissions.count_documents({'student_id': target_user_id})

        elif user_out.get('role') == 'teacher':
            courses = list(db.courses.find({'teacher_id': target_user_id}))
            created_courses = []
            for c in courses:
                enrollment_count = db.enrollments.count_documents({'course_id': str(c['_id'])})
                created_courses.append({
                    'course_id': str(c['_id']),
                    'title': c.get('title'),
                    'enrolled_students': enrollment_count,
                    'created_at': c.get('created_at'),
                })
            user_out['created_courses_details'] = created_courses

        return jsonify({'user': user_out}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@users_bp.route('/<target_user_id>', methods=['PUT'])
@jwt_required()
def update_user(target_user_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db

        me = db.users.find_one({'_id': to_object_id(user_id)})
        if not me:
            return jsonify({'error': 'Unauthorized'}), 401

        target_oid = to_object_id(target_user_id)
        if not target_oid:
            return jsonify({'error': 'Invalid user id'}), 400

        target_user = db.users.find_one({'_id': target_oid})
        if not target_user:
            return jsonify({'error': 'User not found'}), 404

        # Only self or admin can update
        if me.get('role') != 'admin' and user_id != target_user_id:
            return jsonify({'error': 'Access denied'}), 403

        data = request.get_json() or {}

        user_updatable = ['name', 'phone', 'profile_pic']
        admin_updatable = [
            'email', 'role', 'department', 'year', 'semester', 'designation',
            'specializations', 'is_active'
        ]

        update_data: Dict[str, Any] = {}

        if user_id == target_user_id:
            for f in user_updatable:
                if f in data:
                    update_data[f] = data[f]

        if me.get('role') == 'admin':
            for f in admin_updatable:
                if f in data:
                    update_data[f] = data[f]

        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400

        update_data['updated_at'] = datetime.utcnow()

        db.users.update_one({'_id': target_oid}, {'$set': update_data})

        updated = db.users.find_one({'_id': target_oid})
        return jsonify({'message': 'User updated successfully', 'user': serialize_user(updated)}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@users_bp.route('/<target_user_id>/deactivate', methods=['POST'])
@jwt_required()
def deactivate_user(target_user_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db

        me = db.users.find_one({'_id': to_object_id(user_id)})
        if not me or me.get('role') not in ['admin', 'super_admin']:
            return jsonify({'error': 'Admin access required'}), 403

        target_oid = to_object_id(target_user_id)
        if not target_oid:
            return jsonify({'error': 'Invalid user id'}), 400

        if str(user_id) == str(target_user_id):
            return jsonify({'error': 'Cannot deactivate your own account'}), 400

        target_user = db.users.find_one({'_id': target_oid})
        if not target_user:
            return jsonify({'error': 'User not found'}), 404

        db.users.update_one({'_id': target_oid}, {'$set': {'is_active': False, 'updated_at': datetime.utcnow()}})
        return jsonify({'message': 'User deactivated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@users_bp.route('/<target_user_id>/activate', methods=['POST'])
@jwt_required()
def activate_user(target_user_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db

        me = db.users.find_one({'_id': to_object_id(user_id)})
        if not me or me.get('role') not in ['admin', 'super_admin']:
            return jsonify({'error': 'Admin access required'}), 403

        target_oid = to_object_id(target_user_id)
        if not target_oid:
            return jsonify({'error': 'Invalid user id'}), 400

        target_user = db.users.find_one({'_id': target_oid})
        if not target_user:
            return jsonify({'error': 'User not found'}), 404

        db.users.update_one({'_id': target_oid}, {'$set': {'is_active': True, 'updated_at': datetime.utcnow()}})
        return jsonify({'message': 'User activated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@users_bp.route('/<target_user_id>/reset-password', methods=['POST'])
@jwt_required()
def reset_user_password(target_user_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db

        me = db.users.find_one({'_id': to_object_id(user_id)})
        if not me or me.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        target_oid = to_object_id(target_user_id)
        if not target_oid:
            return jsonify({'error': 'Invalid user id'}), 400

        target_user = db.users.find_one({'_id': target_oid})
        if not target_user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json() or {}
        new_password = data.get('new_password')
        if not new_password:
            return jsonify({'error': 'New password is required'}), 400
        if len(new_password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400

        hashed = generate_password_hash(new_password)
        db.users.update_one({'_id': target_oid}, {'$set': {'password': hashed, 'updated_at': datetime.utcnow()}})
        return jsonify({'message': 'Password reset successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@users_bp.route('/', methods=['POST'])
@jwt_required()
def create_user():
    try:
        user_id = get_jwt_identity()
        db = current_app.db

        me = db.users.find_one({'_id': to_object_id(user_id)})
        if not me or me.get('role') not in ['admin', 'super_admin']:
            return jsonify({'error': 'Admin access required'}), 403

        data = request.get_json() or {}

        # Required fields
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'student')

        if not name or not email or not password:
            return jsonify({'error': 'Name, email, and password are required'}), 400

        if len(password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400

        # Validate role
        if role not in ['student', 'teacher', 'admin', 'super_admin']:
            return jsonify({'error': 'Invalid role'}), 400

        # Check if email already exists (case-insensitive)
        email = email.lower()
        if db.users.find_one({'email': email}):
            return jsonify({'error': 'User with this email already exists'}), 400

        # Create new user
        new_user: Dict[str, Any] = {
            'name': name,
            'email': email,
            'password': generate_password_hash(password),
            'role': role,
            'phone': data.get('phone', ''),
            'profile_pic': data.get('profile_pic', ''),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'is_active': True,
        }

        # Add role-specific fields
        if role == 'student':
            new_user.update({
                'roll_no': data.get('roll_no', ''),
                'department': data.get('department', ''),
                'year': data.get('year', ''),
                'semester': data.get('semester', ''),
                'enrolled_courses': [],
                'completed_courses': [],
                'total_points': 0,
                'badges': [],
            })
        elif role == 'teacher':
            new_user.update({
                'employee_id': data.get('employee_id', ''),
                'department': data.get('department', ''),
                'designation': data.get('designation', ''),
                'courses_created': [],
                'specializations': data.get('specializations', []),
            })
        elif role in ['admin', 'super_admin']:
            new_user.update({
                'department': data.get('department', ''),
            })

        result = db.users.insert_one(new_user)
        new_user['_id'] = str(result.inserted_id)
        new_user.pop('password', None)

        return jsonify({
            'message': 'User created successfully',
            'user': serialize_user(new_user)
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@users_bp.route('/bulk-import', methods=['POST'])
@jwt_required()
def bulk_import_users():
    try:
        user_id = get_jwt_identity()
        db = current_app.db

        me = db.users.find_one({'_id': to_object_id(user_id)})
        if not me or me.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        data = request.get_json() or {}
        users_data = data.get('users', [])
        if not users_data:
            return jsonify({'error': 'No users data provided'}), 400

        created_users = []
        errors = []

        for i, user_data in enumerate(users_data, start=1):
            try:
                # Required fields
                for field in ['name', 'email', 'role']:
                    if not user_data.get(field):
                        errors.append(f'Row {i}: {field} is required')
                        raise ValueError('skip')

                # Unique email (case-insensitive)
                email = str(user_data['email']).lower()
                if db.users.find_one({'email': email}):
                    errors.append(f'Row {i}: User with email {email} already exists')
                    raise ValueError('skip')

                password = user_data.get('password', 'TempPass@123')

                new_user: Dict[str, Any] = {
                    'name': user_data['name'],
                    'email': email,
                    'password': generate_password_hash(password),
                    'role': user_data['role'],
                    'phone': user_data.get('phone', ''),
                    'profile_pic': user_data.get('profile_pic', ''),
                    'created_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow(),
                    'is_active': True,
                }

                if user_data['role'] == 'student':
                    new_user.update({
                        'roll_no': user_data.get('roll_no', ''),
                        'department': user_data.get('department', ''),
                        'year': user_data.get('year', ''),
                        'semester': user_data.get('semester', ''),
                        'enrolled_courses': [],
                        'completed_courses': [],
                        'total_points': 0,
                        'badges': [],
                    })
                elif user_data['role'] == 'teacher':
                    new_user.update({
                        'employee_id': user_data.get('employee_id', ''),
                        'department': user_data.get('department', ''),
                        'designation': user_data.get('designation', ''),
                        'courses_created': [],
                        'specializations': user_data.get('specializations', []),
                    })

                result = db.users.insert_one(new_user)
                new_user['_id'] = str(result.inserted_id)
                new_user.pop('password', None)
                created_users.append(new_user)

            except ValueError as ve:
                if str(ve) != 'skip':
                    errors.append(f'Row {i}: {str(ve)}')
                continue
            except Exception as e:
                errors.append(f'Row {i}: {str(e)}')
                continue

        return jsonify({
            'message': f'Bulk import completed. {len(created_users)} users created.',
            'created_users': created_users,
            'errors': errors,
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@users_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_user_statistics():
    try:
        user_id = get_jwt_identity()
        db = current_app.db

        me = db.users.find_one({'_id': to_object_id(user_id)})
        if not me or me.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        total_users = db.users.count_documents({})
        active_users = db.users.count_documents({'is_active': True})
        students = db.users.count_documents({'role': 'student'})
        teachers = db.users.count_documents({'role': 'teacher'})
        admins = db.users.count_documents({'role': 'admin'})

        # Recent registrations (from month start)
        month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        recent_registrations = db.users.count_documents({'created_at': {'$gte': month_start}})

        pipeline = [
            {'$match': {'role': {'$in': ['student', 'teacher']}}},
            {'$group': {'_id': '$department', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
        ]
        department_stats = list(db.users.aggregate(pipeline))

        return jsonify({
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': total_users - active_users,
            'students': students,
            'teachers': teachers,
            'admins': admins,
            'recent_registrations': recent_registrations,
            'department_distribution': department_stats,
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@users_bp.route('/<target_user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(target_user_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db

        me = db.users.find_one({'_id': to_object_id(user_id)})
        if not me or me.get('role') not in ['admin', 'super_admin']:
            return jsonify({'error': 'Admin access required'}), 403

        if str(user_id) == str(target_user_id):
            return jsonify({'error': 'Cannot delete your own account'}), 400

        target_oid = to_object_id(target_user_id)
        if not target_oid:
            return jsonify({'error': 'Invalid user id'}), 400

        target_user = db.users.find_one({'_id': target_oid})
        if not target_user:
            return jsonify({'error': 'User not found'}), 404

        result = db.users.delete_one({'_id': target_oid})
        if result.deleted_count == 1:
            return jsonify({'message': 'User deleted successfully'}), 200
        return jsonify({'error': 'Failed to delete user'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
