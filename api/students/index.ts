import { Router, Response } from 'express';
import { db } from '../_db/client';
import { authMiddleware, AuthenticatedRequest } from '../_middleware/auth';
import { roleGuard } from '../_middleware/roleGuard';

const router = Router();

// Apply Auth and Student Role Guard across all student endpoints
router.use(authMiddleware);
router.use(roleGuard(['student']));

// GET /api/students/dashboard
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.id;

    const passportData = await db.getStudentPassport(studentId);
    const learningHours = await db.getLearningHours(studentId);
    const certificates = await db.getCertificates(studentId);
    const researchPapers = await db.getResearchPapers(studentId);
    const projects = await db.getProjects(studentId);

    // Collect all recent activities from own submissions
    const recentActivities = [
      ...learningHours.map(lh => ({
        id: `lh-${lh.id}`,
        type: 'Learning Hour',
        activity: lh.activity_name,
        hours: `${lh.hours} hrs`,
        date: lh.date,
        status: lh.status,
        remarks: lh.faculty_remarks || 'Pending Review',
        created_at: lh.created_at,
      })),
      ...certificates.map(c => ({
        id: `cert-${c.id}`,
        type: 'Certificate',
        activity: `${c.title} (${c.issuer})`,
        hours: 'N/A',
        date: c.completion_date,
        status: c.status,
        remarks: c.faculty_remarks || 'Pending Review',
        created_at: c.created_at,
      })),
      ...researchPapers.map(p => ({
        id: `paper-${p.id}`,
        type: 'Research Paper',
        activity: p.title,
        hours: 'N/A',
        date: p.created_at.split('T')[0],
        status: p.status,
        remarks: p.faculty_remarks || 'Pending Review',
        created_at: p.created_at,
      })),
      ...projects.map(proj => ({
        id: `proj-${proj.id}`,
        type: 'AI Project',
        activity: proj.title,
        hours: 'N/A',
        date: proj.created_at.split('T')[0],
        status: proj.status,
        remarks: proj.faculty_remarks || 'Pending Review',
        created_at: proj.created_at,
      })),
    ];

    recentActivities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return res.json({
      student: req.user,
      stats: passportData?.stats,
      recentActivities: recentActivities.slice(0, 10),
      badges: passportData?.badges,
    });
  } catch (err: any) {
    console.error('Student Dashboard Error:', err);
    return res.status(500).json({ error: 'Server error loading student dashboard.' });
  }
});

// GET & POST /api/students/learning-hours
router.get('/learning-hours', async (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user!.id;
  const items = await db.getLearningHours(studentId);
  const totalApproved = items.filter((r: any) => r.status === 'Approved').reduce((acc: number, r: any) => acc + Number(r.hours), 0);
  const target = await db.getTargets('2026');
  return res.json({ entries: items, totalApproved, target: target.target_learning_hours });
});

router.post('/learning-hours', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { activity_name, platform, date, hours, description, certificate_url } = req.body;

    if (!activity_name || !platform || !date || !hours) {
      return res.status(400).json({ error: 'Activity Name, Platform, Date, and Hours are required.' });
    }

    const newRecord = await db.createLearningHour({
      student_id: studentId,
      activity_name,
      platform,
      date,
      hours: Number(hours),
      description: description || '',
      certificate_url: certificate_url || '',
      status: 'Pending',
    });

    // Notify Faculty Mentor if assigned
    if (req.user!.mentor_id) {
      await db.createNotification({
        user_id: req.user!.mentor_id,
        title: 'New Learning Hour Submission',
        message: `${req.user!.full_name} logged ${hours} hours for "${activity_name}".`,
        type: 'approval',
        link: '/faculty/approvals',
      });
    }

    await db.logActivity(studentId, 'Submitted Learning Hour', `Logged ${hours} hrs for ${activity_name}`, studentId);

    return res.status(201).json({ message: 'Learning hour submitted for approval.', item: newRecord });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to submit learning hour.' });
  }
});

// GET & POST /api/students/certificates
router.get('/certificates', async (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user!.id;
  const items = await db.getCertificates(studentId);
  const totalApproved = items.filter((r: any) => r.status === 'Approved').length;
  const target = await db.getTargets('2026');
  return res.json({ entries: items, totalApproved, target: target.target_certifications });
});

router.post('/certificates', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { title, issuer, completion_date, certificate_url, skills_learned } = req.body;

    if (!title || !issuer || !completion_date || !certificate_url) {
      return res.status(400).json({ error: 'Title, Issuer, Completion Date, and Certificate Document/URL are required.' });
    }

    const newCert = await db.createCertificate({
      student_id: studentId,
      title,
      issuer,
      completion_date,
      certificate_url,
      skills_learned: skills_learned || '',
      status: 'Pending',
    });

    if (req.user!.mentor_id) {
      await db.createNotification({
        user_id: req.user!.mentor_id,
        title: 'New Certificate Submission',
        message: `${req.user!.full_name} submitted certificate "${title}".`,
        type: 'approval',
        link: '/faculty/approvals',
      });
    }

    await db.logActivity(studentId, 'Submitted Certificate', `Submitted certificate ${title}`, studentId);

    return res.status(201).json({ message: 'Certificate submitted for verification.', item: newCert });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to submit certificate.' });
  }
});

// GET & POST /api/students/research
router.get('/research', async (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user!.id;
  const items = await db.getResearchPapers(studentId);
  const totalApproved = items.filter((r: any) => r.status === 'Approved').length;
  const target = await db.getTargets('2026');
  return res.json({ entries: items, totalApproved, target: target.target_research_papers });
});

router.post('/research', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { title, conference_journal, authors, abstract, pdf_url } = req.body;

    if (!title || !conference_journal || !authors || !pdf_url) {
      return res.status(400).json({ error: 'Title, Conference/Journal, Authors, and PDF Document/URL are required.' });
    }

    const newPaper = await db.createResearchPaper({
      student_id: studentId,
      title,
      conference_journal,
      authors,
      abstract: abstract || '',
      pdf_url,
      status: 'Pending',
    });

    if (req.user!.mentor_id) {
      await db.createNotification({
        user_id: req.user!.mentor_id,
        title: 'New Research Paper Submission',
        message: `${req.user!.full_name} submitted research paper "${title}".`,
        type: 'approval',
        link: '/faculty/approvals',
      });
    }

    await db.logActivity(studentId, 'Submitted Research Paper', `Submitted research paper ${title}`, studentId);

    return res.status(201).json({ message: 'Research paper submitted for peer & faculty review.', item: newPaper });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to submit research paper.' });
  }
});

// GET & POST /api/students/projects
router.get('/projects', async (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user!.id;
  const items = await db.getProjects(studentId);
  const totalApproved = items.filter((r: any) => r.status === 'Approved').length;
  const target = await db.getTargets('2026');
  return res.json({ entries: items, totalApproved, target: target.target_projects });
});

router.post('/projects', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { title, description, github_link, demo_link, tech_stack, ai_contribution, image_url } = req.body;

    if (!title || !description || !tech_stack) {
      return res.status(400).json({ error: 'Project Title, Description, and Tech Stack are required.' });
    }

    const newProject = await db.createProject({
      student_id: studentId,
      title,
      description,
      github_link: github_link || '',
      demo_link: demo_link || '',
      tech_stack,
      ai_contribution: ai_contribution || '',
      image_url: image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600',
      status: 'Pending',
    });

    if (req.user!.mentor_id) {
      await db.createNotification({
        user_id: req.user!.mentor_id,
        title: 'New AI Project Submission',
        message: `${req.user!.full_name} submitted project "${title}".`,
        type: 'approval',
        link: '/faculty/approvals',
      });
    }

    await db.logActivity(studentId, 'Submitted AI Project', `Submitted project ${title}`, studentId);

    return res.status(201).json({ message: 'Project submitted for evaluation.', item: newProject });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to submit AI project.' });
  }
});

// GET /api/students/passport
router.get('/passport', async (req: AuthenticatedRequest, res: Response) => {
  const passport = await db.getStudentPassport(req.user!.id);
  return res.json(passport);
});

export default router;
