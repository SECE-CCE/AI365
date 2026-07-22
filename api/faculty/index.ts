import { Router, Response } from 'express';
import { db } from '../_db/client';
import { authMiddleware, AuthenticatedRequest } from '../_middleware/auth';
import { roleGuard } from '../_middleware/roleGuard';
import { deleteFromDrive } from '../_services/drive';

const router = Router();

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

    const totalApprovedHoursCount = approvedHours.reduce((acc, h) => acc + Number(h.hours), 0);

    return res.json({
      faculty: req.user,
      stats: {
        pendingApprovalsCount: totalPendingCount,
        approvedHoursTotal: totalApprovedHoursCount,
        approvedCertsTotal: approvedCerts.length,
        approvedPapersTotal: approvedPapers.length,
        approvedProjectsTotal: approvedProjects.length,
      },
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

    return res.json({
      hours,
      certificates,
      research,
      projects,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error loading faculty approval queue.' });
  }
});

// POST /api/faculty/approve-reject
router.post('/approve-reject', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const facultyId = req.user!.id;
    const { item_type, item_id, action, remarks } = req.body; // action = 'Approved' | 'Rejected'

    if (!item_type || !item_id || !action) {
      return res.status(400).json({ error: 'item_type, item_id, and action are required.' });
    }

    if (!['Approved', 'Rejected'].includes(action)) {
      return res.status(400).json({ error: 'Action must be "Approved" or "Rejected".' });
    }

    let updatedItem: any = null;
    let studentId: number = 0;
    let title: string = '';

    if (item_type === 'learning_hour') {
      updatedItem = await db.updateLearningHourStatus(Number(item_id), action, facultyId, remarks || '');
      if (updatedItem) {
        studentId = updatedItem.student_id;
        title = updatedItem.activity_name;
      }
    } else if (item_type === 'certificate') {
      updatedItem = await db.updateCertificateStatus(Number(item_id), action, facultyId, remarks || '');
      if (updatedItem) {
        studentId = updatedItem.student_id;
        title = updatedItem.title;
      }
    } else if (item_type === 'research') {
      updatedItem = await db.updateResearchPaperStatus(Number(item_id), action, facultyId, remarks || '');
      if (updatedItem) {
        studentId = updatedItem.student_id;
        title = updatedItem.title;
      }
    } else if (item_type === 'project') {
      updatedItem = await db.updateProjectStatus(Number(item_id), action, facultyId, remarks || '');
      if (updatedItem) {
        studentId = updatedItem.student_id;
        title = updatedItem.title;
      }
    } else {
      return res.status(400).json({ error: 'Invalid item_type provided.' });
    }

    if (!updatedItem) {
      return res.status(404).json({ error: 'Submission record not found.' });
    }

    // 1. Notify Student
    await db.createNotification({
      user_id: studentId,
      title: `Submission ${action}`,
      message: `Your ${item_type.replace('_', ' ')} "${title}" was ${action.toLowerCase()} by ${req.user!.full_name}. Remarks: ${remarks || 'None'}`,
      type: 'approval',
      link: `/student/${item_type === 'learning_hour' ? 'learning-hours' : item_type === 'certificate' ? 'certificates' : item_type === 'research' ? 'research' : 'projects'}`,
    });

    // 2. Log Activity
    await db.logActivity(
      facultyId,
      `${action} ${item_type.replace('_', ' ')}`,
      `${req.user!.full_name} ${action.toLowerCase()} "${title}" for student ID #${studentId}. Remarks: ${remarks || 'N/A'}`,
      studentId
    );

    // 3. Post-approval file payload cleanup to conserve storage
    if (action === 'Approved') {
      if (item_type === 'certificate' && updatedItem.certificate_url) {
        await deleteFromDrive(updatedItem.certificate_url);
      } else if (item_type === 'research' && updatedItem.pdf_url) {
        await deleteFromDrive(updatedItem.pdf_url);
      }
    }

    return res.json({
      message: `Submission successfully ${action.toLowerCase()}.`,
      item: updatedItem,
    });
  } catch (err) {
    console.error('Approve/Reject Error:', err);
    return res.status(500).json({ error: 'Failed to process approval action.' });
  }
});

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
