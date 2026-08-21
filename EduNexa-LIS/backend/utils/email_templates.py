"""
Professional Email Templates for EduNexa LMS
"""

def get_base_template(content: str) -> str:
    """Base HTML template for all emails"""
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EduNexa LMS</title>
</head>
<body>
    <div class="email-wrapper">
        <div class="header">
            <div class="logo">🎓 EduNexa</div>
            <div class="tagline">SMART LEARNING MANAGEMENT SYSTEM</div>
        </div>
        <div class="content">
            {content}
        </div>
    </div>
</body>
</html>
"""
