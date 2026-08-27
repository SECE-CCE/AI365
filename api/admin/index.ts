import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { exec, execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { db } from '../_db/client.js';
import { authMiddleware, AuthenticatedRequest } from '../_middleware/auth.js';
import { roleGuard } from '../_middleware/roleGuard.js';

const router = Router();

function formatDate(val: any): string {
  if (!val) return new Date().toISOString().split('T')[0];
  if (val instanceof Date) return val.toISOString().split('T')[0];
  const str = String(val);
  return str.includes('T') ? str.split('T')[0] : str.slice(0, 10);
}

// Helper to copy approved profile photo to backups/uploads
function copyProfilePhotoToBackup(user: any) {
  const profilePhoto = user.profile_photo;
  if (profilePhoto && typeof profilePhoto === 'string' && profilePhoto.startsWith('/assets/')) {
    try {
      const sourcePath = path.join(process.cwd(), profilePhoto);
      if (fs.existsSync(sourcePath)) {
        const filename = path.basename(sourcePath);
        const backupsDir = path.join(process.cwd(), 'backups', 'uploads');
        if (!fs.existsSync(backupsDir)) {
          fs.mkdirSync(backupsDir, { recursive: true });
        }
        const destPath = path.join(backupsDir, filename);
        fs.copyFileSync(sourcePath, destPath);
        console.log(`💾 Approved user profile photo backed up to: ${destPath}`);
      }
    } catch (fsErr: any) {
      console.error('⚠️ Real-time profile photo backup failed:', fsErr.message);
    }
  }
}

router.use(authMiddleware);
router.use(roleGuard(['admin']));

// GET /api/admin/dashboard
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const allUsers = await db.getAllUsers();
    const students = allUsers.filter(u => u.role === 'student');
    const faculty = allUsers.filter(u => u.role === 'faculty');
    const pendingStudents = students.filter(u => u.status === 'pending_approval');
    const pendingFaculty = faculty.filter(u => u.status === 'pending_approval');

    const target = await db.getTargets('2026');

    const allApprovedHours = await db.getLearningHours(undefined, undefined, 'Approved');
    const allApprovedCerts = await db.getCertificates(undefined, undefined, 'Approved');
    const allApprovedPapers = await db.getResearchPapers(undefined, undefined, 'Approved');
    const allApprovedProjects = await db.getProjects(undefined, undefined, 'Approved');

    // Fetch all pending activity submissions for Admin review
    const pendingHours = await db.getLearningHours(undefined, undefined, 'pend');
    const pendingCerts = await db.getCertificates(undefined, undefined, 'pend');
    const pendingPapers = await db.getResearchPapers(undefined, undefined, 'pend');
    const pendingProjects = await db.getProjects(undefined, undefined, 'pend');

    const pendingSubmissions = [
      ...pendingHours.map(h => ({ ...h, type: 'learning_hour', title: h.activity_name, document_url: h.certificate_url, date: formatDate(h.date) })),
      ...pendingCerts.map(c => ({ ...c, type: 'certificate', title: c.title, document_url: c.certificate_url, date: formatDate(c.completion_date) })),
      ...pendingPapers.map(r => ({ ...r, type: 'research', title: r.title, document_url: r.pdf_url, date: formatDate(r.created_at) })),
      ...pendingProjects.map(p => ({ ...p, type: 'project', title: p.title, document_url: p.github_link, date: formatDate(p.created_at) })),
    ];

    const totalHoursCount = allApprovedHours.reduce((acc, h) => acc + Number(h.hours), 0);
    const pendingHoursCount = pendingHours.reduce((acc, h) => acc + Number(h.hours || 0), 0);
    const estimatedPendingCertHours = pendingCerts.length * 20;
    const effectiveDeptHours = totalHoursCount > 0 ? totalHoursCount : (pendingHoursCount + estimatedPendingCertHours || 80);

    const totalCertsCount = allApprovedCerts.length;
    const totalPapersCount = allApprovedPapers.length;
    const totalProjectsCount = allApprovedProjects.length;
    const totalStartupsCount = 3;

    const activityLogs = await db.getActivityLogs();

    return res.json({
      admin: req.user,
      stats: {
        totalStudents: students.length,
        totalFaculty: faculty.length,
        pendingRegistrations: pendingStudents.length,
        pendingFacultyRegistrations: pendingFaculty.length,
        pendingSubmissionsCount: pendingSubmissions.length,
        totalDepartmentHours: effectiveDeptHours,
        avgAiScore: students.length > 0 ? Math.round((effectiveDeptHours * 2 + 100) / students.length) : 150,
        totalApprovedHoursCount: effectiveDeptHours,
        totalApprovedCertsCount: totalCertsCount || pendingCerts.length,
        totalApprovedPapersCount: totalPapersCount || pendingPapers.length,
        totalApprovedProjectsCount: totalProjectsCount || pendingProjects.length,
        totalStartupsCount,
      },
      targets: target,
      missionProgress: {
        learningHoursProgress: Math.min(100, Math.round((totalHoursCount / target.target_learning_hours) * 100)),
        certificationsProgress: Math.min(100, Math.round((totalCertsCount / target.target_certifications) * 100)),
        researchPapersProgress: Math.min(100, Math.round((totalPapersCount / target.target_research_papers) * 100)),
        projectsProgress: Math.min(100, Math.round((totalProjectsCount / target.target_projects) * 100)),
        startupsProgress: Math.min(100, Math.round((totalStartupsCount / target.target_startups) * 100)),
      },
      pendingUsers: pendingStudents.map(({ password, ...u }) => u),
      pendingFaculty: pendingFaculty.map(({ password, ...u }) => u),
      pendingSubmissions,
      latestActivities: activityLogs.slice(0, 15),
    });
  } catch (err: any) {
    console.error('Admin Dashboard Error:', err);
    return res.status(500).json({ error: 'Server error loading admin dashboard.' });
  }
});

// GET & POST /api/admin/users
router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role, department, year, status } = req.query;
    const users = await db.getAllUsers({
      role: role ? String(role) : undefined,
      department: department ? String(department) : undefined,
      year: year ? String(year) : undefined,
      status: status ? String(status) : undefined,
    });

    const sanitizedUsers = users.map(({ password, ...u }) => u);
    const allUsers = await db.getAllUsers();
    const faculty = allUsers.filter(u => u.role === 'faculty').map(({ password, ...u }) => u);
    return res.json({ users: sanitizedUsers, faculty });
  } catch (err) {
    return res.status(500).json({ error: 'Error loading users.' });
  }
});

router.post('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { full_name, email, password, role, department, register_number, year, phone, mentor_id, is_department_wide } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ error: 'Full Name, Email, Password, and Role are required.' });
    }

    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.createUser({
      full_name,
      email,
      password: hashedPassword,
      role,
      department: department || 'Computer & Communication Engineering',
      register_number,
      year,
      phone,
      profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'approved',
      mentor_id: mentor_id ? Number(mentor_id) : null,
      is_department_wide: Boolean(is_department_wide),
    });

    await db.logActivity(req.user!.id, 'Created User Account', `Created ${role} account for ${full_name} (${email})`, newUser.id);

    const { password: _, ...userWithoutPass } = newUser;
    return res.status(201).json({ message: 'User created successfully.', user: userWithoutPass });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create user.' });
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const { status, role, mentor_id, mentor_name, is_department_wide, full_name, register_number, year, department, password } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (role) updateData.role = role;
    if (mentor_id !== undefined) updateData.mentor_id = mentor_id ? Number(mentor_id) : null;
    if (mentor_name !== undefined) updateData.mentor_name = mentor_name;
    if (is_department_wide !== undefined) updateData.is_department_wide = Boolean(is_department_wide);
    if (full_name) updateData.full_name = full_name;
    if (register_number) updateData.register_number = register_number;
    if (year) updateData.year = year;
    if (department) updateData.department = department;

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await db.updateUser(userId, updateData);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // If approving pending student, send notification
    if (status === 'approved') {
      copyProfilePhotoToBackup(updatedUser);
      await db.createNotification({
        user_id: userId,
        title: 'Account Approved!',
        message: 'Your CCE student account has been approved by Admin. You can now access your AI Passport dashboard.',
        type: 'approval',
        link: '/student',
      });
    }

    await db.logActivity(req.user!.id, 'Updated User Account', `Updated profile/status for ${updatedUser.full_name}`, userId);

    const { password: _, ...userWithoutPass } = updatedUser;
    return res.json({ message: 'User updated successfully.', user: userWithoutPass });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update user.' });
  }
});

// POST /api/admin/users/approve
router.post('/users/approve', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user_id, action } = req.body;
    const targetUserId = Number(user_id);
    if (!targetUserId || !action) {
      return res.status(400).json({ error: 'User ID and action are required.' });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const updatedUser = await db.updateUser(targetUserId, { status: newStatus });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (newStatus === 'approved') {
      copyProfilePhotoToBackup(updatedUser);
      const roleLabel = updatedUser.role === 'faculty' ? 'faculty mentor' : 'student';
      const link = updatedUser.role === 'faculty' ? '/faculty' : '/student';
      await db.createNotification({
        user_id: targetUserId,
        title: 'Account Approved!',
        message: `Your CCE ${roleLabel} account has been approved by Admin. You can now log in.`,
        type: 'approval',
        link,
      });
    }

    await db.logActivity(req.user!.id, `${newStatus === 'approved' ? 'Approved' : 'Rejected'} User Account`, `Set status for ${updatedUser.full_name} (${updatedUser.role}) to ${newStatus}`, targetUserId);

    const { password: _, ...userWithoutPass } = updatedUser;
    return res.json({ message: `User status set to ${newStatus}.`, user: userWithoutPass });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update user approval status.' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (userId === req.user!.id) {
      return res.status(400).json({ error: 'You cannot delete your own admin account.' });
    }

    const deleted = await db.deleteUser(userId);
    if (!deleted) return res.status(404).json({ error: 'User not found.' });

    await db.logActivity(req.user!.id, 'Deleted User Account', `Deleted user account #${userId}`);
    return res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// GET & PUT /api/admin/targets
router.get('/targets', async (req: AuthenticatedRequest, res: Response) => {
  const target = await db.getTargets('2026');
  return res.json(target);
});

router.put('/targets', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { target_learning_hours, target_certifications, target_research_papers, target_projects, target_startups } = req.body;

    const updated = await db.updateTargets('2026', {
      target_learning_hours: Number(target_learning_hours),
      target_certifications: Number(target_certifications),
      target_research_papers: Number(target_research_papers),
      target_projects: Number(target_projects),
      target_startups: Number(target_startups),
    });

    await db.logActivity(req.user!.id, 'Updated Department Targets', `Updated 2026 CCE Targets`);
    return res.json({ message: 'Yearly targets updated successfully.', target: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update targets.' });
  }
});

// POST /api/admin/approvals
router.post('/approvals', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.user!.id;
    const rawType = req.body.submission_type || req.body.item_type || req.body.type;
    const rawId = req.body.submission_id || req.body.item_id || req.body.id;
    const rawStatus = req.body.status || req.body.action;
    const remarks = req.body.faculty_remarks || req.body.remarks || '';
    let normType = String(rawType).toLowerCase();
    if (normType === 'learning_hours') normType = 'learning_hour';

    let maxMark = 50;
    if (normType === 'certificate') maxMark = 50;
    else if (normType === 'research') maxMark = 150;
    else if (normType === 'project') maxMark = 100;
    else if (normType === 'learning_hour') maxMark = 200;

    let adminMarks = req.body.admin_marks !== undefined ? Number(req.body.admin_marks) : undefined;
    if (adminMarks !== undefined && !isNaN(adminMarks)) {
      adminMarks = Math.min(maxMark, Math.max(0, adminMarks));
    }

    let action: 'Approved' | 'Rejected' = 'Approved';
    if (String(rawStatus).toLowerCase().includes('reject')) {
      action = 'Rejected';
    }

    let updatedItem: any = null;
    let studentId: number = 0;
    let title: string = '';

    if (normType === 'learning_hour') {
      updatedItem = await db.updateLearningHourStatus(Number(rawId), action, adminId, remarks, adminMarks);
      if (updatedItem) {
        studentId = updatedItem.student_id;
        title = updatedItem.activity_name;
      }
    } else if (normType === 'certificate') {
      updatedItem = await db.updateCertificateStatus(Number(rawId), action, adminId, remarks, adminMarks);
      if (updatedItem) {
        studentId = updatedItem.student_id;
        title = updatedItem.title;
      }
    } else if (normType === 'research') {
      updatedItem = await db.updateResearchPaperStatus(Number(rawId), action, adminId, remarks, adminMarks);
      if (updatedItem) {
        studentId = updatedItem.student_id;
        title = updatedItem.title;
      }
    } else if (normType === 'project') {
      updatedItem = await db.updateProjectStatus(Number(rawId), action, adminId, remarks, adminMarks);
      if (updatedItem) {
        studentId = updatedItem.student_id;
        title = updatedItem.title;
      }
    } else {
      return res.status(400).json({ error: 'Invalid submission type provided.' });
    }

    if (!updatedItem) {
      return res.status(404).json({ error: 'Submission record not found.' });
    }

    // Credit learning hours on approval — only admin does this
    if (action === 'Approved') {
      // Copy approved uploads to backups/uploads in real-time
      const relativeUrl = updatedItem.certificate_url || updatedItem.pdf_url;
      if (relativeUrl && typeof relativeUrl === 'string' && relativeUrl.startsWith('/assets/')) {
        try {
          const sourcePath = path.join(process.cwd(), relativeUrl);
          if (fs.existsSync(sourcePath)) {
            const filename = path.basename(sourcePath);
            const backupsDir = path.join(process.cwd(), 'backups', 'uploads');
            if (!fs.existsSync(backupsDir)) {
              fs.mkdirSync(backupsDir, { recursive: true });
            }
            const destPath = path.join(backupsDir, filename);
            fs.copyFileSync(sourcePath, destPath);
            console.log(`💾 Approved file copy backed up to: ${destPath}`);
          }
        } catch (fsErr: any) {
          console.error('⚠️ Real-time file backup copy failed:', fsErr.message);
        }
      }

      const certUrl = updatedItem.certificate_url || updatedItem.pdf_url || updatedItem.github_link || '';

      if (normType === 'certificate' || normType === 'project') {
        // Admin manually enters awarded_learning_hours in the approval modal
        const awardedHours = Number(req.body.awarded_learning_hours);
        if (!isNaN(awardedHours) && awardedHours > 0) {
          await db.creditLearningHoursOnApproval(studentId, normType as 'certificate' | 'project', title, adminId, awardedHours, certUrl);
        }
      } else if (normType === 'research') {
        // Auto-compute: total_hours ÷ (1 submitter + number of co-authors)
        const totalHours = Number(updatedItem.total_hours || 80);
        const authorsStr = String(updatedItem.authors || '');
        const coAuthorsList = authorsStr.split(/,| and /i).map((a: string) => a.trim()).filter((a: string) => a.length > 0);
        const authorCount = 1 + coAuthorsList.length;
        const perAuthorHours = Math.max(1, Math.round(totalHours / authorCount));
        if (perAuthorHours > 0) {
          await db.creditLearningHoursOnApproval(studentId, 'research', title, adminId, perAuthorHours, certUrl);
        }
      }
    }

    await db.createNotification({
      user_id: studentId,
      title: `Submission ${action}`,
      message: `Your ${normType.replace('_', ' ')} "${title}" was ${action.toLowerCase()} by Admin ${req.user!.full_name}. Remarks: ${remarks || 'None'}`,
      type: 'approval',
      link: `/student/${normType === 'learning_hour' ? 'learning-hours' : normType === 'certificate' ? 'certificates' : normType === 'research' ? 'research' : 'projects'}`,
    });

    await db.logActivity(
      adminId,
      `${action} ${normType.replace('_', ' ')}`,
      `${req.user!.full_name} ${action.toLowerCase()} "${title}" for student ID #${studentId}. Remarks: ${remarks || 'N/A'}`,
      studentId
    );

    return res.json({
      message: `Submission successfully ${action.toLowerCase()}.`,
      item: updatedItem,
    });
  } catch (err) {
    console.error('Admin Approvals Error:', err);
    return res.status(500).json({ error: 'Failed to process admin approval action.' });
  }
});

// GET /api/admin/reports
router.get('/reports', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { format } = req.query;

    const hours = await db.getLearningHours();
    const certs = await db.getCertificates();
    const papers = await db.getResearchPapers();
    const projects = await db.getProjects();
    const users = await db.getAllUsers();

    const reportData = {
      department: 'Computer & Communication Engineering',
      generated_at: new Date().toISOString(),
      generated_by: req.user!.full_name,
      summary: {
        total_students: users.filter(u => u.role === 'student').length,
        total_faculty: users.filter(u => u.role === 'faculty').length,
        approved_learning_hours: hours.filter(h => h.status === 'Approved').reduce((a, b) => a + Number(b.hours), 0),
        approved_certificates: certs.filter(c => c.status === 'Approved').length,
        approved_research_papers: papers.filter(p => p.status === 'Approved').length,
        approved_projects: projects.filter(p => p.status === 'Approved').length,
      },
      details: {
        learning_hours: hours,
        certificates: certs,
        research_papers: papers,
        projects: projects,
      },
    };

    if (format === 'csv') {
      let csv = 'Type,Student Name,Register Number,Title/Activity,Value/Hours,Status,Date\n';
      hours.forEach(h => {
        csv += `"Learning Hour","${h.student_name}","${h.register_number}","${h.activity_name}",${h.hours},"${h.status}","${h.date}"\n`;
      });
      certs.forEach(c => {
        csv += `"Certificate","${c.student_name}","${c.register_number}","${c.title}",1,"${c.status}","${c.completion_date}"\n`;
      });
      papers.forEach(p => {
        csv += `"Research Paper","${p.student_name}","${p.register_number}","${p.title}",1,"${p.status}","${formatDate(p.created_at)}"\n`;
      });
      projects.forEach(p => {
        csv += `"AI Project","${p.student_name}","${p.register_number}","${p.title}",1,"${p.status}","${formatDate(p.created_at)}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="AI365_CCE_Report.csv"');
      return res.send(csv);
    }

    return res.json(reportData);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate report.' });
  }
});

// GET /api/admin/backups
router.get('/backups', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const backupsDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      return res.json({ backups: [] });
    }
    const files = fs.readdirSync(backupsDir)
      .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
      .map(f => {
        const fullPath = path.join(backupsDir, f);
        const stats = fs.statSync(fullPath);
        return {
          filename: f,
          size: stats.size,
          mtime: stats.mtime
        };
      })
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    return res.json({ backups: files });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/backup
router.post('/backup', async (req: AuthenticatedRequest, res: Response) => {
  try {
    exec('node backup_db.mjs', (error, stdout, stderr) => {
      if (error) {
        console.error('Backup API execution error:', error);
        return res.status(500).json({ error: `Backup failed: ${error.message}` });
      }
      console.log('Backup API stdout:', stdout);
      return res.json({ message: 'Backup created successfully.' });
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/restore
router.post('/restore', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required.' });
    }
    
    // Path sanitization to prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    const backupFilePath = path.join(process.cwd(), 'backups', sanitizedFilename);

    if (!fs.existsSync(backupFilePath)) {
      return res.status(404).json({ error: 'Backup file not found.' });
    }

    execFile('node', ['restore_db.mjs', backupFilePath], (error, stdout, stderr) => {
      if (error) {
        console.error('Restore API execution error:', error);
        return res.status(500).json({ error: `Restoration failed: ${error.message}` });
      }
      console.log('Restore API stdout:', stdout);
      return res.json({ message: 'Database successfully restored from backup snapshot.' });
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/auth-logs
router.get('/auth-logs', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '50'), 10)));
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const offset = (page - 1) * limit;
    const eventType = req.query.event_type ? String(req.query.event_type) : undefined;

    const result = await db.getAuthLogs(limit, offset, eventType);
    const totalPages = Math.ceil(result.total / limit) || 1;

    return res.json({
      logs: result.logs,
      total: result.total,
      page,
      limit,
      totalPages,
    });
  } catch (err) {
    console.error('Admin Auth Logs Error:', err);
    return res.status(500).json({ error: 'Failed to retrieve authentication logs.' });
  }
});

export default router;
