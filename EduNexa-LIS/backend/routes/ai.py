from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
import google.generativeai as genai
import os
import PyPDF2
import io
import re

ai_bp = Blueprint('ai', __name__)

# Configure Gemini AI
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("⚠️  Warning: GEMINI_API_KEY not found. AI features will use fallback responses.")

def extract_text_from_pdf(pdf_content):
    """Extract text from PDF content"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        return f"Error extracting PDF text: {str(e)}"

def generate_fallback_learning_path(goal, timeframe, enrolled_courses, user):
    """Generate a structured learning path when AI is not available"""
    
    course_titles = [course['title'] for course in enrolled_courses] if enrolled_courses else ['your current courses']
    department = user.get('department', 'your field of study')
    
    # Determine study hours based on timeframe
    if timeframe == 'week':
        study_hours = "10-15 hours"
        weekly_plan = "Focus on current course materials, complete pending assignments, and review challenging topics"
    elif timeframe == 'semester':
        study_hours = "8-12 hours per week"
        weekly_plan = "Build strong foundations, develop skills progressively, and prepare for assessments"
    else:  # month
        study_hours = "10-15 hours per week"
        weekly_plan = "Catch up on materials, strengthen weak areas, and practice consistently"
    
    return f"""### 🎯 {timeframe.title()} Learning Plan

**Goal:** {goal}

**Focus Areas:** {', '.join(course_titles[:3])}{'...' if len(course_titles) > 3 else ''}

**Study Time:** {study_hours}

**Action Plan:** {weekly_plan}

**Quick Tips:**
- Set daily study goals and track progress
- Review material regularly using active recall
- Join study groups for collaborative learning
- Take breaks to maintain focus

*Click "New Path" to generate a custom plan for different goals*"""

def generate_welcome_message(user_name, enrolled_courses):
    """Generate a personalized welcome message for new chat sessions"""
    courses_text = ", ".join(enrolled_courses) if enrolled_courses else "your courses"
    
    return f"""## 👋 Hello {user_name}! Welcome to Your AI Study Assistant!

### 🎓 I'm Here to Help You Succeed!

I'm your personal AI tutor, ready to assist you with **{courses_text}** and much more!

### 🚀 Here's How I Can Help You:

#### 📊 **Performance Tracking**
- **Show your complete performance report** with grades, progress, and achievements
- Track your learning pace and identify areas for improvement
- Get personalized recommendations based on your performance

#### 📚 **Course Support**
- Explain difficult concepts and topics
- Provide study strategies for each subject
- Help you understand course materials better

#### 📝 **Assignment Guidance**
- Break down complex assignments into manageable steps
- Offer study tips for upcoming exams
- Help you prepare for assessments effectively

#### 🎯 **Personalized Learning**
- Create custom study schedules
- Recommend learning resources
- Suggest improvements based on your progress

#### 💡 **Study Tips & Motivation**
- Share proven study techniques
- Help you stay motivated and focused
- Provide time management strategies

### 🌟 **Quick Start Ideas:**
- *"Show me my performance report"* 📊 ⭐ **Most Popular!**
- *"Meri performance btao"* (in Hindi/Hinglish too!)
- *"Help me understand [specific topic]"*
- *"What should I focus on for my upcoming exam?"*
- *"Can you create a study plan for this week?"*
- *"I'm struggling with [subject], can you help?"*

### 💬 **Let's Get Started!**
What would you like to work on today? I'm here to make your learning journey easier and more enjoyable! 😊

**Pro Tip:** Ask me about your performance anytime - I'll give you a complete breakdown! 📈

*Just type your question below and I'll provide detailed, helpful guidance!*"""

def generate_fallback_response(prompt, context=""):
    """Generate a helpful fallback response when AI is not available"""
    
    # Simple keyword-based responses
    prompt_lower = prompt.lower()
    
    if any(word in prompt_lower for word in ['study', 'learn', 'help', 'how']):
        return f"""## 📚 Great Question!

### 🎯 Here's Some General Study Advice:

- **Create a study schedule** and stick to it consistently
- **Break down complex topics** into smaller, manageable chunks
- **Use active learning techniques** like summarization and self-testing
- **Take regular breaks** to maintain focus and retention
- **Join study groups** or find study partners for collaborative learning

### 💡 Study Tips:
1. **Set specific goals** for each study session
2. **Use the Pomodoro Technique** (25 minutes focused study, 5-minute break)
3. **Review material regularly** instead of cramming
4. **Practice with past assignments** and exercises

### 🚀 Next Steps:
Check your course materials and assignments in your dashboard. If you need specific help with a topic, try rephrasing your question or contact your instructor.

Keep up the great work! 😊

*Note: AI assistant is currently in basic mode. For enhanced features, please contact your administrator.*"""
    
    elif any(word in prompt_lower for word in ['assignment', 'homework', 'task']):
        return f"""## 📝 Assignment Help

### 🎯 General Assignment Tips:

- **Read the instructions carefully** and understand what's being asked
- **Break the assignment into smaller tasks** and tackle them one by one
- **Start early** to avoid last-minute stress
- **Create an outline** before you begin writing or coding
- **Review your work** before submitting

### 💡 Getting Started:
1. **Understand the requirements** - what format, length, and criteria are expected?
2. **Research thoroughly** using reliable sources
3. **Create a timeline** with milestones leading to the due date
4. **Ask for help** if you're stuck on specific concepts

### 🚀 Resources:
- Check your course materials for relevant examples
- Review similar assignments you've completed
- Reach out to classmates or your instructor for clarification

You've got this! 💪

*Note: For personalized assignment help, please ensure the AI service is properly configured.*"""
    
    else:
        return f"""## 👋 Hello! I'm Here to Help

### 🎓 I'm Your Study Assistant

Thank you for your question! While I'm currently running in basic mode, I'm still here to support your learning journey.

### 🚀 How I Can Help:
- **Study strategies and techniques**
- **Assignment planning and organization**
- **General academic advice**
- **Learning tips and motivation**

### 💡 Try Asking About:
- *"How can I improve my study habits?"*
- *"What's the best way to prepare for exams?"*
- *"How do I manage my time better?"*
- *"Can you help me understand this concept?"*

### 🔧 For Enhanced Features:
Contact your administrator to enable full AI capabilities for personalized responses, course-specific help, and advanced learning path generation.

Feel free to ask me anything about studying and learning! 😊"""

def generate_explanation(topic, context=""):
    """Generate detailed explanation of a topic"""
    if not GEMINI_API_KEY:
        return f"""## 📚 Understanding {topic}

### 🎯 Key Concepts:
This is a fundamental concept in your course. Let me break it down:

- **Definition**: {topic} is an important concept that builds on previous knowledge
- **Why it matters**: Understanding this helps you grasp more advanced topics
- **Real-world application**: This concept is used in practical scenarios

### 💡 Simple Explanation:
Think of it like this: [simplified analogy would go here]

### 📝 Study Tips:
1. Review your course materials on this topic
2. Practice with examples
3. Connect it to what you already know
4. Ask your instructor for clarification if needed

Need more details? Feel free to ask! 😊"""
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        You are a patient and knowledgeable tutor. Explain the following topic in simple, easy-to-understand terms.
        
        Topic: {topic}
        Student Context: {context}
        
        Provide:
        1. A clear definition
        2. Why it's important
        3. A simple analogy or example
        4. Real-world applications
        5. Common misconceptions to avoid
        6. Study tips
        
        Use markdown formatting with headers (##, ###), bullet points, and emojis.
        Keep it conversational and encouraging.
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        return generate_fallback_response(topic, context)

def generate_summary(content, context=""):
    """Generate a concise summary"""
    if not GEMINI_API_KEY:
        return f"""## 📝 Summary

### Key Points:
- Main concept 1
- Main concept 2
- Main concept 3

### Important Takeaways:
Focus on understanding the core concepts and how they connect.

### Study Recommendation:
Review these key points regularly and practice applying them.

*For a more detailed summary, ensure AI features are properly configured.*"""
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        Summarize the following content into clear, concise bullet points.
        Focus on the most important concepts and key takeaways.
        
        Content: {content}
        Student Context: {context}
        
        Format:
        ## 📝 Summary
        
        ### Key Points:
        - [Main points]
        
        ### Important Takeaways:
        - [What to remember]
        
        ### Study Tips:
        - [How to use this information]
        
        Keep it brief but comprehensive. Use emojis and markdown.
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        return generate_fallback_response(content, context)



def generate_qa_response(question, context=""):
    """Answer questions about course materials"""
    if not GEMINI_API_KEY:
        return generate_fallback_response(question, context)
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        You are a helpful tutor answering a student's question about their course material.
        
        Question: {question}
        Student Context: {context}
        
        Provide a clear, comprehensive answer that:
        1. Directly addresses the question
        2. Explains the reasoning
        3. Provides examples if helpful
        4. Suggests related topics to explore
        5. Encourages further learning
        
        Use markdown formatting with headers, bullet points, and emojis.
        Be friendly and encouraging.
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        return generate_fallback_response(question, context)

def generate_ai_response(prompt, context=""):
    """Generate AI response using Gemini or fallback"""
    
    # Check if Gemini API is available
    if not GEMINI_API_KEY:
        return generate_fallback_response(prompt, context)
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        full_prompt = f"""
        You are an AI learning assistant for EduNexa LMS, a friendly and knowledgeable tutor who helps students succeed.
        
        Student Context: {context}
        Student Question: {prompt}
        
        IMPORTANT FORMATTING RULES:
        1. Always use proper markdown formatting with headers (##, ###)
        2. Use bullet points (-) and numbered lists where appropriate
        3. Include emojis to make responses more engaging
        4. Structure your response with clear sections
        5. Keep responses conversational but professional
        6. Always end with an encouraging note or next steps
        
        RESPONSE STRUCTURE:
        - Start with a friendly greeting acknowledging their question
        - Use ## for main headings and ### for subheadings
        - Provide actionable advice with bullet points
        - Include relevant examples when helpful
        - End with encouragement and offer further help
        
        EXAMPLE FORMAT:
        ## 📚 Great Question About [Topic]!
        
        ### 🎯 Here's What You Need to Know:
        - Point 1 with explanation
        - Point 2 with details
        
        ### 💡 My Recommendations:
        1. First actionable step
        2. Second actionable step
        
        ### 🚀 Next Steps:
        Brief summary of what to do next.
        
        Feel free to ask if you need clarification on anything! 😊
        
        Now respond to the student's question in this style.
        """
        
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        return generate_fallback_response(prompt, context)

@ai_bp.route('/chat/welcome', methods=['GET'])
@jwt_required()
def get_welcome_message():
    """Get personalized welcome message for chat"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get user info
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        enrolled_courses = []
        if user['role'] == 'student':
            # Get enrolled courses
            enrollments = list(db.enrollments.find({'student_id': user_id}))
            if enrollments:
                course_ids = [enrollment['course_id'] for enrollment in enrollments]
                courses = list(db.courses.find({'_id': {'$in': [ObjectId(cid) for cid in course_ids]}}))
                enrolled_courses = [course['title'] for course in courses]
        
        welcome_message = generate_welcome_message(user['name'], enrolled_courses)
        
        return jsonify({
            'message': welcome_message,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_student_performance_data(db, user_id):
    """Get comprehensive performance data for a student"""
    try:
        # Get enrollments with progress
        enrollments = list(db.enrollments.find({'student_id': user_id}))
        courses_data = []
        total_progress = 0
        
        for enrollment in enrollments:
            course = db.courses.find_one({'_id': ObjectId(enrollment['course_id'])})
            if course:
                progress = enrollment.get('progress', 0)
                total_progress += progress
                courses_data.append({
                    'title': course['title'],
                    'progress': progress,
                    'enrolled_at': enrollment.get('enrolled_at', datetime.utcnow())
                })
        
        avg_progress = total_progress / len(enrollments) if enrollments else 0
        
        # Get assignment submissions and grades
        submissions = list(db.submissions.find({'student_id': user_id}))
        graded_submissions = [sub for sub in submissions if sub.get('grade') is not None]
        
        total_assignments = len(submissions)
        graded_assignments = len(graded_submissions)
        
        grades = [sub['grade'] for sub in graded_submissions]
        avg_grade = sum(grades) / len(grades) if grades else 0
        
        # Get overdue assignments
        submitted_assignment_ids = [sub['assignment_id'] for sub in submissions]
        enrolled_course_ids = [enrollment['course_id'] for enrollment in enrollments]
        
        overdue_assignments = list(db.assignments.find({
            'course_id': {'$in': enrolled_course_ids},
            'due_date': {'$lt': datetime.utcnow()},
            '_id': {'$nin': [ObjectId(aid) for aid in submitted_assignment_ids]}
        }))
        
        # Get achievements
        user = db.users.find_one({'_id': ObjectId(user_id)})
        total_points = user.get('total_points', 0)
        achievements = user.get('achievements', [])
        
        # Get recent activity
        recent_submissions = [sub for sub in submissions 
                            if sub.get('submitted_at') and 
                            (datetime.utcnow() - sub['submitted_at']).days <= 7]
        
        # Calculate performance score
        performance_score = 0
        if graded_assignments > 0:
            performance_score = (avg_grade * 0.6) + (avg_progress * 0.4)
        else:
            performance_score = avg_progress
        
        # Determine learning pace
        learning_pace = 'normal'
        if avg_progress > 70 and len(recent_submissions) > 2:
            learning_pace = 'fast'
        elif avg_progress < 30 and len(recent_submissions) < 1:
            learning_pace = 'slow'
        
        return {
            'courses': courses_data,
            'total_courses': len(enrollments),
            'avg_progress': round(avg_progress, 1),
            'total_assignments': total_assignments,
            'graded_assignments': graded_assignments,
            'avg_grade': round(avg_grade, 1),
            'overdue_count': len(overdue_assignments),
            'total_points': total_points,
            'achievements_count': len(achievements),
            'recent_activity': len(recent_submissions),
            'performance_score': round(performance_score, 1),
            'learning_pace': learning_pace,
            'highest_grade': max(grades) if grades else 0,
            'lowest_grade': min(grades) if grades else 0
        }
    except Exception as e:
        print(f"Error getting performance data: {str(e)}")
        return None

def is_performance_query(message):
    """Check if the message is asking about performance"""
    performance_keywords = [
        'performance', 'progress', 'meri performance', 'mera progress',
        'kaisa chal raha', 'kaise kar raha', 'kitna acha', 'kitna progress',
        'how am i doing', 'how is my', 'my performance', 'my progress',
        'show my', 'tell me about my', 'btao meri', 'dikhao meri',
        'grades', 'marks', 'score', 'result', 'achievement'
    ]
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in performance_keywords)

def generate_performance_response(performance_data, user_name):
    """Generate a detailed performance report"""
    if not performance_data:
        return "I couldn't fetch your performance data right now. Please try again later."
    
    # Determine performance level
    score = performance_data['performance_score']
    if score >= 80:
        performance_level = "Excellent! 🌟"
        emoji = "🎉"
    elif score >= 60:
        performance_level = "Good! 👍"
        emoji = "😊"
    elif score >= 40:
        performance_level = "Fair - Room for Improvement 📈"
        emoji = "💪"
    else:
        performance_level = "Needs Attention ⚠️"
        emoji = "📚"
    
    # Build detailed response
    response = f"""## {emoji} {user_name}, Here's Your Complete Performance Report!

### 🎯 Overall Performance: {performance_level}
**Performance Score: {performance_data['performance_score']}/100**

---

### 📊 Course Progress
- **Total Courses Enrolled:** {performance_data['total_courses']}
- **Average Progress:** {performance_data['avg_progress']}%
- **Learning Pace:** {performance_data['learning_pace'].title()} 🚀

#### 📚 Your Courses:
"""
    
    for course in performance_data['courses']:
        days_enrolled = (datetime.utcnow() - course['enrolled_at']).days
        progress_bar = '█' * int(course['progress'] / 10) + '░' * (10 - int(course['progress'] / 10))
        response += f"\n- **{course['title']}**\n  - Progress: [{progress_bar}] {course['progress']}%\n  - Enrolled: {days_enrolled} days ago"
    
    response += f"""

---

### 📝 Assignment Performance
- **Total Assignments:** {performance_data['total_assignments']}
- **Graded Assignments:** {performance_data['graded_assignments']}
- **Average Grade:** {performance_data['avg_grade']}%
"""
    
    if performance_data['graded_assignments'] > 0:
        response += f"""- **Highest Grade:** {performance_data['highest_grade']}% 🏆
- **Lowest Grade:** {performance_data['lowest_grade']}%
"""
    
    if performance_data['overdue_count'] > 0:
        response += f"""
⚠️ **Overdue Assignments:** {performance_data['overdue_count']} - Please complete them soon!
"""
    else:
        response += """
✅ **No Overdue Assignments** - Great job staying on track!
"""
    
    response += f"""

---

### 🏆 Achievements & Points
- **Total Points Earned:** {performance_data['total_points']} 🌟
- **Achievements Unlocked:** {performance_data['achievements_count']} 🏅
- **Recent Activity (Last 7 days):** {performance_data['recent_activity']} submissions

---

### 💡 Personalized Recommendations:
"""
    
    # Add personalized recommendations based on performance
    if performance_data['performance_score'] >= 80:
        response += """
✨ **You're doing amazing!** Keep up the excellent work!
- Consider helping peers who might be struggling
- Challenge yourself with advanced topics
- Maintain your consistent study schedule
"""
    elif performance_data['performance_score'] >= 60:
        response += """
👍 **Good progress!** Here's how to improve further:
- Focus on courses with lower progress
- Review assignments where you scored below 70%
- Set aside dedicated study time each day
- Use active learning techniques
"""
    elif performance_data['performance_score'] >= 40:
        response += """
📈 **You can do better!** Let's work on improvement:
- Prioritize completing overdue assignments
- Spend more time on challenging topics
- Join study groups for collaborative learning
- Break down complex topics into smaller parts
- Reach out to instructors for help
"""
    else:
        response += """
⚠️ **Immediate action needed!** Let's get you back on track:
- Schedule a meeting with your instructor
- Complete overdue assignments as priority
- Create a structured study schedule
- Focus on one course at a time
- Consider tutoring or additional support
- Don't hesitate to ask for help!
"""
    
    if performance_data['learning_pace'] == 'slow':
        response += """

🐢 **Learning Pace:** You're progressing slowly. Consider:
- Setting daily learning goals
- Breaking study sessions into smaller chunks
- Using the Pomodoro technique (25 min study, 5 min break)
- Identifying and addressing any barriers to learning
"""
    elif performance_data['learning_pace'] == 'fast':
        response += """

🚀 **Learning Pace:** You're a fast learner! Keep it up!
- Consider exploring advanced materials
- Help other students who might be struggling
- Take on leadership roles in group projects
"""
    
    response += """

---

### 🎯 Next Steps:
1. Review courses with progress below 50%
2. Complete any pending assignments
3. Set weekly learning goals
4. Track your progress regularly
5. Celebrate your achievements! 🎉

**Need help with specific topics?** Just ask me! I'm here to support your learning journey. 😊

*Keep pushing forward - every step counts!* 💪
"""
    
    return response

@ai_bp.route('/chat', methods=['POST'])
@jwt_required()
def ai_chat():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        data = request.get_json()
        message = data.get('message', '').strip()
        chat_type = data.get('type', 'general')  # general, explain, summarize, qa
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Get user context for personalized responses
        user = db.users.find_one({'_id': ObjectId(user_id)})
        
        # Build comprehensive context
        context_parts = [f"User: {user['name']}", f"Role: {user['role']}"]
        
        # Check if this is a performance query for students
        if user['role'] == 'student' and is_performance_query(message):
            # Get comprehensive performance data
            performance_data = get_student_performance_data(db, user_id)
            if performance_data:
                ai_response = generate_performance_response(performance_data, user['name'])
            else:
                ai_response = "I'm having trouble fetching your performance data right now. Please try again in a moment."
        else:
            # Regular chat flow
            if user['role'] == 'student':
                # Get enrolled courses
                enrollments = list(db.enrollments.find({'student_id': user_id}))
                if enrollments:
                    course_ids = [enrollment['course_id'] for enrollment in enrollments]
                    courses = list(db.courses.find({'_id': {'$in': [ObjectId(cid) for cid in course_ids]}}))
                    course_titles = [course['title'] for course in courses]
                    context_parts.append(f"Enrolled courses: {', '.join(course_titles)}")
            
            context = "; ".join(context_parts)
            
            # Generate AI response based on type
            if chat_type == 'explain':
                ai_response = generate_explanation(message, context)
            elif chat_type == 'summarize':
                ai_response = generate_summary(message, context)
            elif chat_type == 'qa':
                ai_response = generate_qa_response(message, context)
            else:
                ai_response = generate_ai_response(message, context)
        
        # Save chat history
        chat_data = {
            'user_id': user_id,
            'message': message,
            'response': ai_response,
            'type': chat_type,
            'timestamp': datetime.utcnow(),
            'context': "; ".join(context_parts)
        }
        
        db.chat_history.insert_one(chat_data)
        
        return jsonify({
            'response': ai_response,
            'timestamp': datetime.utcnow().isoformat(),
            'type': chat_type
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/summarize', methods=['POST'])
@jwt_required()
def summarize_content():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        content = data.get('content', '').strip()
        content_type = data.get('type', 'text')  # text, pdf, url
        
        if not content:
            return jsonify({'error': 'Content is required'}), 400
        
        # Extract text based on content type
        if content_type == 'pdf':
            # Assuming content is base64 encoded PDF
            import base64
            try:
                pdf_content = base64.b64decode(content)
                text_content = extract_text_from_pdf(pdf_content)
            except Exception as e:
                return jsonify({'error': f'Failed to process PDF: {str(e)}'}), 400
        else:
            text_content = content
        
        # Limit content length for API
        if len(text_content) > 10000:
            text_content = text_content[:10000] + "..."
        
        # Generate summary using AI
        prompt = f"""
        Please provide a concise summary of the following educational content. 
        Focus on key concepts, main points, and important details that students should remember.
        
        Content:
        {text_content}
        
        Summary:
        """
        
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)
            summary = response.text
        except Exception as e:
            return jsonify({'error': f'Failed to generate summary: {str(e)}'}), 500
        
        # Save summary
        summary_data = {
            'user_id': user_id,
            'original_content': text_content[:1000],  # Store first 1000 chars
            'summary': summary,
            'content_type': content_type,
            'created_at': datetime.utcnow()
        }
        
        db.summaries.insert_one(summary_data)
        
        return jsonify({
            'summary': summary,
            'word_count_original': len(text_content.split()),
            'word_count_summary': len(summary.split())
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500



@ai_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get user
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] != 'student':
            return jsonify({'error': 'Recommendations are only available for students'}), 403
        
        # Get user's learning data
        enrollments = list(db.enrollments.find({'student_id': user_id}))
        enrolled_course_ids = [enrollment['course_id'] for enrollment in enrollments]
        
        # Get enrolled courses
        enrolled_courses = list(db.courses.find({
            '_id': {'$in': [ObjectId(cid) for cid in enrolled_course_ids]}
        }))
        

        
        # Get assignment submissions
        submissions = list(db.submissions.find({'student_id': user_id}))
        
        # Analyze performance
        weak_areas = []
        strong_areas = []
        

        
        # Get available courses for recommendations
        available_courses = list(db.courses.find({
            '_id': {'$nin': [ObjectId(cid) for cid in enrolled_course_ids]},
            'is_active': True
        }))
        
        # Generate AI-powered recommendations
        context = f"""
        Student Profile:
        - Department: {user.get('department', 'Not specified')}
        - Year: {user.get('year', 'Not specified')}
        - Enrolled Courses: {[course['title'] for course in enrolled_courses]}
        - Strong Areas: {strong_areas}
        - Areas for Improvement: {weak_areas}
        - Total Points: {user.get('total_points', 0)}
        """
        
        # Get course recommendations
        course_recommendations = []
        if available_courses:
            # Simple recommendation based on department and category
            for course in available_courses[:5]:  # Limit to 5 recommendations
                course['_id'] = str(course['_id'])
                course_recommendations.append(course)
        
        # Generate study tips
        study_tips = [
            "Review your assignment results to identify knowledge gaps",
            "Create a study schedule and stick to it",
            "Use active learning techniques like summarization",
            "Join study groups for collaborative learning",
            "Take regular breaks to improve retention"
        ]
        
        if weak_areas:
            study_tips.insert(0, f"Focus extra time on: {', '.join(weak_areas)}")
        
        return jsonify({
            'course_recommendations': course_recommendations,
            'study_tips': study_tips,
            'performance_summary': {
                'strong_areas': strong_areas,
                'weak_areas': weak_areas,
                'total_points': user.get('total_points', 0),
                'courses_enrolled': len(enrolled_courses),

                'assignments_submitted': len(submissions)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/chat-history', methods=['GET'])
@jwt_required()
def get_chat_history():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        
        # Get chat history
        chat_history = list(db.chat_history.find({'user_id': user_id})
                           .sort('timestamp', -1)
                           .skip((page - 1) * limit)
                           .limit(limit))
        
        # Convert ObjectId to string
        for chat in chat_history:
            chat['_id'] = str(chat['_id'])
        
        total = db.chat_history.count_documents({'user_id': user_id})
        
        return jsonify({
            'chat_history': chat_history,
            'total': total,
            'page': page,
            'limit': limit,
            'total_pages': (total + limit - 1) // limit
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/learning-path', methods=['POST'])
@jwt_required()
def generate_learning_path():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is student
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] != 'student':
            return jsonify({'error': 'Learning paths are only available for students'}), 403
        
        data = request.get_json()
        goal = data.get('goal', '').strip()
        timeframe = data.get('timeframe', 'month')  # week, month, semester
        
        if not goal:
            return jsonify({'error': 'Learning goal is required'}), 400
        
        # Get user's current progress
        enrollments = list(db.enrollments.find({'student_id': user_id}))
        enrolled_courses = []
        for enrollment in enrollments:
            course = db.courses.find_one({'_id': ObjectId(enrollment['course_id'])})
            if course:
                enrolled_courses.append({
                    'title': course['title'],
                    'progress': enrollment.get('progress', 0)
                })
        
        # Generate learning path using AI or fallback
        if GEMINI_API_KEY:
            prompt = f"""
            Create a personalized learning path for a student with the following profile:
            
            Goal: {goal}
            Timeframe: {timeframe}
            Current Courses: {[course['title'] for course in enrolled_courses]}
            Department: {user.get('department', 'Not specified')}
            
            Provide a structured learning path with:
            1. Weekly milestones
            2. Recommended study hours per week
            3. Key topics to focus on
            4. Suggested resources or activities
            
            Format as a practical, actionable plan using markdown formatting.
            """
            
            try:
                model = genai.GenerativeModel('gemini-2.5-flash')
                response = model.generate_content(prompt)
                learning_path = response.text
            except Exception as e:
                print(f"Gemini API error in learning path: {str(e)}")
                learning_path = generate_fallback_learning_path(goal, timeframe, enrolled_courses, user)
        else:
            learning_path = generate_fallback_learning_path(goal, timeframe, enrolled_courses, user)
        
        # Save learning path
        path_data = {
            'user_id': user_id,
            'goal': goal,
            'timeframe': timeframe,
            'learning_path': learning_path,
            'created_at': datetime.utcnow(),
            'is_active': True
        }
        
        result = db.learning_paths.insert_one(path_data)
        path_data['_id'] = str(result.inserted_id)
        
        return jsonify({
            'message': 'Learning path generated successfully',
            'learning_path': path_data
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500