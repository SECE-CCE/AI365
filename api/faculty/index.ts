import { Router, Response } from 'express';
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

router.use(authMiddleware);
router.use(roleGuard(['faculty', 'admin'])); // Admins can also access faculty endpoints if needed

// GET /api/faculty/dashboard
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const facultyId = req.user!.id;

    // Get pending submissions
    const pendingHours = await db.getLearningHours(undefined, facultyId, 'Pending');
    const pendingCerts = await db.getCertificates(undefined, facultyId, 'Pending');
    const pendingPapers = await db.getResearchPapers(undefined, facultyId, 'Pending');
    const pendingProjects = await db.getProjects(undefined, facultyId, 'Pending');

    const totalPendingCount = pendingHours.length + pendingCerts.length + pendingPapers.length + pendingProjects.length;

    // Approved totals
    const approvedHours = await db.getLearningHours(undefined, facultyId, 'Approved');
    const approvedCerts = await db.getCertificates(undefined, facultyId, 'Approved');
    const approvedPapers = await db.getResearchPapers(undefined, facultyId, 'Approved');
    const approvedProjects = await db.getProjects(undefined, facultyId, 'Approved');
    const rejectedHours = await db.getLearningHours(undefined, facultyId, 'Rejected');
    const rejectedCerts = await db.getCertificates(undefined, facultyId, 'Rejected');
    const rejectedPapers = await db.getResearchPapers(undefined, facultyId, 'Rejected');
    const rejectedProjects = await db.getProjects(undefined, facultyId, 'Rejected');

    const totalApprovedHoursCount = approvedHours.reduce((acc, h) => acc + Number(h.hours), 0);
    const totalRejectedCount = rejectedHours.length + rejectedCerts.length + rejectedPapers.length + rejectedProjects.length;

    // Assigned mentees count
    const allUsers = await db.getAllUsers({ role: 'student' });
    const facultyUser = await db.findUserById(facultyId);
    const assignedMentees = allUsers.filter((u: any) => u.mentor_id === facultyId || facultyUser?.is_department_wide).length;

    // Flat pending queue for the frontend table
    const pendingQueue = [
      ...pendingHours.map(h => ({ ...h, type: 'learning_hour', title: h.activity_name, document_url: h.certificate_url, date: formatDate(h.date) })),
      ...pendingCerts.map(c => ({ ...c, type: 'certificate', title: c.title, document_url: c.certificate_url, date: formatDate(c.completion_date) })),
      ...pendingPapers.map(r => ({ ...r, type: 'research', title: r.title, document_url: r.pdf_url, date: formatDate(r.created_at) })),
      ...pendingProjects.map(p => ({ ...p, type: 'project', title: p.title, document_url: p.github_link, date: formatDate(p.created_at) })),
    ];

    return res.json({
      faculty: req.user,
      stats: {
        pendingCount: totalPendingCount,
        pendingApprovalsCount: totalPendingCount,
        assignedMentees: allUsers.filter((u: any) => u.mentor_id === facultyId).length,
        approvedToday: approvedCerts.length + approvedHours.length + approvedPapers.length + approvedProjects.length,
        rejectedCount: totalRejectedCount,
        approvedHoursTotal: totalApprovedHoursCount,
        approvedCertsTotal: approvedCerts.length,
        approvedPapersTotal: approvedPapers.length,
        approvedProjectsTotal: approvedProjects.length,
      },
      pendingQueue,
      pendingItems: {
        hours: pendingHours,
        certificates: pendingCerts,
        research: pendingPapers,
        projects: pendingProjects,
      },
    });
  } catch (err: any) {
    console.error('Faculty Dashboard Error:', err);
    return res.status(500).json({ error: 'Server error loading faculty dashboard.' });
  }
});

// GET /api/faculty/approvals (All pending/reviewed items scoped to faculty)
router.get('/approvals', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const facultyId = req.user!.id;
    const { status } = req.query;
    const statusFilter = status ? String(status) : undefined;

    const hours = await db.getLearningHours(undefined, facultyId, statusFilter);
    const certificates = await db.getCertificates(undefined, facultyId, statusFilter);
    const research = await db.getResearchPapers(undefined, facultyId, statusFilter);
    const projects = await db.getProjects(undefined, facultyId, statusFilter);

    const submissions = [
      ...hours.map(h => ({ ...h, type: 'learning_hours', title: h.activity_name, document_url: h.certificate_url, date: formatDate(h.date) })),
      ...certificates.map(c => ({ ...c, type: 'certificate', title: c.title, document_url: c.certificate_url, date: formatDate(c.completion_date) })),
      ...research.map(r => ({ ...r, type: 'research', title: r.title, document_url: r.pdf_url, date: formatDate(r.created_at) })),
      ...projects.map(p => ({ ...p, type: 'project', title: p.title, document_url: p.github_link || p.github_repo, date: formatDate(p.created_at) })),
    ];

    return res.json({
      submissions,
      hours,
      certificates,
      research,
      projects,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error loading faculty approval queue.' });
  }
});

// Helper handler for approval processing
const handleApproveReject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const facultyId = req.user!.id;
    const rawType = req.body.submission_type || req.body.item_type || req.body.type;
    const rawId = req.body.submission_id || req.body.item_id || req.body.id;
    const rawStatus = req.body.status || req.body.action; // 'Approved' | 'Rejected' | 'approve' | 'reject'
    const remarks = req.body.faculty_remarks || req.body.remarks || '';
    const adminMarks = req.body.admin_marks !== undefined ? Number(req.body.admin_marks) : undefined;

    if (!rawType || !rawId || !rawStatus) {
      return res.status(400).json({ error: 'Submission type, ID, and status are required.' });
    }

    let normType = String(rawType).toLowerCase();
    if (normType === 'learning_hours') normType = 'learning_hour';

    let action: 'Approved' | 'Rejected' = 'Approved';
    if (String(rawStatus).toLowerCase().includes('reject')) {
      action = 'Rejected';
    }

    // Fetch item first to check student mentee authorization
    let existingItem: any = null;
    if (normType === 'learning_hour') {
      const items = await db.getLearningHours();
      existingItem = items.find((i: any) => i.id === Number(rawId));
    } else if (normType === 'certificate') {
      const items = await db.getCertificates();
      existingItem = items.find((i: any) => i.id === Number(rawId));
    } else if (normType === 'research') {
      const items = await db.getResearchPapers();
      existingItem = items.find((i: any) => i.id === Number(rawId));
    } else if (normType === 'project') {
      const items = await db.getProjects();
      existingItem = items.find((i: any) => i.id === Number(rawId));
    } else {
      return res.status(400).json({ error: 'Invalid submission type provided.' });
    }

    if (!existingItem) {
      return res.status(404).json({ error: 'Submission record not found.' });
    }

    // Authorization check for faculty: must be assigned mentor or have is_department_wide = true
    if (req.user!.role === 'faculty' && !req.user!.is_department_wide) {
      const targetStudent = await db.findUserById(existingItem.student_id);
      if (!targetStudent || targetStudent.mentor_id !== facultyId) {
        return res.status(403).json({
          error: 'Forbidden: You are only authorized to review submissions for your assigned mentees.',
          code: 'MENTEE_SCOPE_RESTRICTED',
        });
      }
    }

    let updatedItem: any = null;
    let studentId: number = 0;
    let title: string = '';

    if (normType === 'learning_hour') {
      updatedItem = await db.updateLearningHourStatus(Number(rawId), action, facultyId, remarks, adminMarks);
      if (updatedItem) {
        studentId = updatedItem.student_id;
        title = updatedItem.activity_name;
      }
    } else if (normType === 'certificate') {
      updatedItem = await db.updateCertificateStatus(Number(rawId), action, facultyId, remarks, adminMarks);
      if (updatedItem) {
        studentId = updatedItem.student_id;
        title = updatedItem.title;
      }
    } else if (normType === 'research') {
      updatedItem = await db.updateResearchPaperStatus(Number(rawId), action, facultyId, remarks, adminMarks);
      if (updatedItem) {
        studentId = updatedItem.student_id;
        title = updatedItem.title;
      }
    } else if (normType === 'project') {
      updatedItem = await db.updateProjectStatus(Number(rawId), action, facultyId, remarks, adminMarks);
      if (updatedItem) {
        studentId = updatedItem.student_id;
        title = updatedItem.title;
      }
    }

    // NOTE: Learning hours are credited only by Admin on approval — not faculty.

    // 1. Notify Student
    await db.createNotification({
      user_id: studentId,
      title: `Submission ${action}`,
      message: `Your ${normType.replace('_', ' ')} "${title}" was ${action.toLowerCase()} by ${req.user!.full_name}. Remarks: ${remarks || 'None'}`,
      type: 'approval',
      link: `/student/${normType === 'learning_hour' ? 'learning-hours' : normType === 'certificate' ? 'certificates' : normType === 'research' ? 'research' : 'projects'}`,
    });

    // 2. Log Activity
    await db.logActivity(
      facultyId,
      `${action} ${normType.replace('_', ' ')}`,
      `${req.user!.full_name} ${action.toLowerCase()} "${title}" for student ID #${studentId}. Remarks: ${remarks || 'N/A'}`,
      studentId
    );

    return res.json({
      message: `Submission successfully ${action.toLowerCase()}.`,
      item: updatedItem,
    });
  } catch (err) {
    console.error('Approve/Reject Error:', err);
    return res.status(500).json({ error: 'Failed to process approval action.' });
  }
};

// Handle POST for both /approvals and /approve-reject
router.post('/approvals', handleApproveReject);
router.post('/approve-reject', handleApproveReject);

// GET /api/faculty/reports (Faculty scoped reports)
router.get('/reports', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const facultyId = req.user!.id;

    const hours = await db.getLearningHours(undefined, facultyId, 'Approved');
    const certs = await db.getCertificates(undefined, facultyId, 'Approved');
    const papers = await db.getResearchPapers(undefined, facultyId, 'Approved');
    const projects = await db.getProjects(undefined, facultyId, 'Approved');

    return res.json({
      scope: 'Faculty Mentees Report',
      totalLearningHours: hours.reduce((acc, h) => acc + Number(h.hours), 0),
      totalCertificates: certs.length,
      totalResearchPapers: papers.length,
      totalProjects: projects.length,
      detail: {
        hours,
        certs,
        papers,
        projects,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error generating faculty report.' });
  }
});

export default router;
