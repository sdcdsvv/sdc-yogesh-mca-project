# 🎯 Super Admin Guide - EduNexa LMS

## Super Admin Credentials

**Email:** admin@datams.edu  
**Password:** Yogi@#2025  
**Role:** Super Administrator  
**Employee ID:** SUPERADMIN001

---

## Quick Access

1. **Login URL:** `http://localhost:5173/login`
2. Enter super admin credentials above
3. You'll be redirected to the Admin Dashboard with full system access

---

## Super Admin Features

### 1. Dashboard Overview
- Complete system statistics (users, courses, enrollments)
- Real-time activity monitoring
- System health and performance metrics
- Quick action shortcuts

### 2. User Management (Full Control)
- View, create, edit, and delete all users
- Manage students, teachers, and their permissions
- Reset passwords for any user
- Bulk user operations
- User activity tracking

### 3. Course Management (Full Control)
- View and manage all courses
- Approve/reject course submissions
- Edit course content and settings
- Monitor enrollments and progress
- Archive or delete courses

### 4. Analytics & Reports
- Comprehensive user engagement metrics
- Course performance analytics
- System usage reports and trends
- Export data in multiple formats
- Custom report generation

### 5. System Administration
- Configure global system settings
- Manage platform notifications
- Database backup and restore
- System logs and audit trails
- Security settings

---

## Important Security Notes

⚠️ **This is the ONLY admin account with full system access**
- Keep credentials highly secure
- Never share admin password
- All administrative actions are logged and auditable
- Regular password changes recommended
- Enable 2FA if available

---

## Database Information

The super admin is created during database seeding:
- Located in: `backend/scripts/seeders/comprehensive_seed_data.py`
- To reseed database: `python backend/scripts/seeders/comprehensive_seed_data.py`
- This will reset all data including the super admin

---

## Troubleshooting

**Cannot login?**
1. Verify credentials are correct (case-sensitive)
2. Check if backend server is running
3. Review backend logs: `backend/logs/`
4. Reseed database if needed

**Need to reset admin password?**
1. Access MongoDB directly
2. Or reseed the entire database
3. Contact system developer for manual reset

---

## Support & Maintenance

For technical issues:
- Check system logs: `/backend/logs`
- Review browser console for errors
- Verify MongoDB connection
- Contact development team

---

**System Version:** 1.0  
**Last Updated:** January 2025  
**Admin Type:** Super Administrator (Full Access)
