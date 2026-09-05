import { Router, Response } from 'express';
import { db } from '../_db/client.js';
import { authMiddleware, AuthenticatedRequest } from '../_middleware/auth.js';
import { roleGuard } from '../_middleware/roleGuard.js';

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
    const usageStats = await db.getStudentUsageStats(studentId);

    // Collect all recent activities from own submissions
function formatDate(val: any): string {
  if (!val) return new Date().toISOString().split('T')[0];
  if (val instanceof Date) return val.toISOString().split('T')[0];
  const str = String(val);
  return str.includes('T') ? str.split('T')[0] : str.slice(0, 10);
}

    const parseAdminMarks = (val: any) => (val !== undefined && val !== null && val !== '' && !isNaN(Number(val)) ? Number(val) : null);

    const recentActivities = [
      ...learningHours
        .map(lh => ({
          id: `lh-${lh.id}`,
          type: 'Learning Hours',
          activity: lh.activity_name,
          hours: `${lh.hours} hrs`,
          date: formatDate(lh.date),
          status: lh.status,
          admin_marks: parseAdminMarks(lh.admin_marks),
          remarks: lh.faculty_remarks || 'Pending Review',
          created_at: lh.created_at,
        })),
      ...certificates.map(c => ({
        id: `cert-${c.id}`,
        type: 'Certificate',
        activity: `${c.title} (${c.issuer})`,
        hours: 'N/A',
        date: formatDate(c.completion_date),
        status: c.status,
        admin_marks: parseAdminMarks(c.admin_marks),
        remarks: c.faculty_remarks || 'Pending Review',
        created_at: c.created_at,
      })),
      ...researchPapers.map(p => ({
        id: `paper-${p.id}`,
        type: 'Research Paper',
        activity: p.title,
        hours: 'N/A',
        date: formatDate(p.created_at),
        status: p.status,
        admin_marks: parseAdminMarks(p.admin_marks),
        remarks: p.faculty_remarks || 'Pending Review',
        created_at: p.created_at,
      })),
      ...projects.map(proj => ({
        id: `proj-${proj.id}`,
        type: 'AI Project',
        activity: proj.title,
        hours: 'N/A',
        date: formatDate(proj.created_at),
        status: proj.status,
        admin_marks: parseAdminMarks(proj.admin_marks),
        remarks: proj.faculty_remarks || 'Pending Review',
        created_at: proj.created_at,
      })),
    ];

    recentActivities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return res.json({
      student: req.user,
      stats: passportData?.stats,
      usageStats,
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
  const entries = items;
  const totalApproved = entries.filter((r: any) => r.status === 'Approved').reduce((acc: number, r: any) => acc + Number(r.hours), 0);
  const target = await db.getTargets('2026');
  return res.json({ entries, totalApproved, target: target.target_learning_hours });
});

// Validation Helpers
function isValidDateString(val: any): boolean {
  if (!val || typeof val !== 'string') return false;
  const d = new Date(val);
  return !isNaN(d.getTime());
}

function sanitizeString(val: any, maxLen: number = 255): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

router.post('/learning-hours', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { activity_name, platform, date, hours, description, certificate_url } = req.body;

    const cleanActivity = sanitizeString(activity_name, 255);
    const cleanPlatform = sanitizeString(platform, 255);
    const cleanDesc = sanitizeString(description, 2000);
    const cleanCertUrl = sanitizeString(certificate_url, 2048);

    if (!cleanActivity || !cleanPlatform || !date || hours === undefined || hours === null) {
      return res.status(400).json({ error: 'Activity Name, Platform, Date, and Hours are required.' });
    }

    const numHours = Number(hours);
    if (isNaN(numHours) || numHours <= 0 || numHours > 24) {
      return res.status(400).json({ error: 'Hours must be a valid positive number between 0.1 and 24.' });
    }

    if (!isValidDateString(date)) {
      return res.status(400).json({ error: 'Date must be a valid date format (YYYY-MM-DD).' });
    }

    // Check duplicate submission
    const existing = await db.getLearningHours(studentId);
    const isDuplicate = existing.some(
      (lh) => lh.activity_name.toLowerCase() === cleanActivity.toLowerCase() && lh.date.slice(0, 10) === String(date).slice(0, 10)
    );
    if (isDuplicate) {
      return res.status(400).json({ error: 'A learning hour submission for this activity and date already exists.' });
    }

    const newRecord = await db.createLearningHour({
      student_id: studentId,
      activity_name: cleanActivity,
      platform: cleanPlatform,
      date: String(date).slice(0, 10),
      hours: numHours,
      description: cleanDesc,
      certificate_url: cleanCertUrl,
      status: 'Pending',
    });

    // Notify Faculty Mentor if assigned
    if (req.user!.mentor_id) {
      await db.createNotification({
        user_id: req.user!.mentor_id,
        title: 'New Learning Hour Submission',
        message: `${req.user!.full_name} logged ${numHours} hours for "${cleanActivity}".`,
        type: 'approval',
        link: '/faculty/approvals',
      });
    }

    await db.logActivity(studentId, 'Submitted Learning Hour', `Logged ${numHours} hrs for ${cleanActivity}`, studentId);

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

    const cleanTitle = sanitizeString(title, 255);
    const cleanIssuer = sanitizeString(issuer, 255);
    const cleanCertUrl = sanitizeString(certificate_url, 2048);
    const cleanSkills = sanitizeString(skills_learned, 1000);

    if (!cleanTitle || !cleanIssuer || !completion_date || !cleanCertUrl) {
      return res.status(400).json({ error: 'Title, Issuer, Completion Date, and Certificate Document/URL are required.' });
    }

    if (!isValidDateString(completion_date)) {
      return res.status(400).json({ error: 'Completion date must be a valid date format (YYYY-MM-DD).' });
    }

    // Check duplicate submission
    const existing = await db.getCertificates(studentId);
    const isDuplicate = existing.some(
      (c) => c.title.toLowerCase() === cleanTitle.toLowerCase() && c.issuer.toLowerCase() === cleanIssuer.toLowerCase()
    );
    if (isDuplicate) {
      return res.status(400).json({ error: 'A certificate submission with this title and issuer already exists.' });
    }

    const newCert = await db.createCertificate({
      student_id: studentId,
      title: cleanTitle,
      issuer: cleanIssuer,
      completion_date: String(completion_date).slice(0, 10),
      certificate_url: cleanCertUrl,
      skills_learned: cleanSkills,
      status: 'Pending',
    });

    if (req.user!.mentor_id) {
      await db.createNotification({
        user_id: req.user!.mentor_id,
        title: 'New Certificate Submission',
        message: `${req.user!.full_name} submitted certificate "${cleanTitle}".`,
        type: 'approval',
        link: '/faculty/approvals',
      });
    }

    await db.logActivity(studentId, 'Submitted Certificate', `Submitted certificate ${cleanTitle}`, studentId);

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
    const { title, conference_journal, authors, total_hours, abstract, pdf_url } = req.body;

    const cleanTitle = sanitizeString(title, 255);
    const cleanConf = sanitizeString(conference_journal, 255);
    const cleanAuthors = sanitizeString(authors, 255);
    const cleanPdfUrl = sanitizeString(pdf_url, 2048);
    const cleanAbstract = sanitizeString(abstract, 5000);

    if (!cleanTitle || !cleanConf || !cleanAuthors || !cleanPdfUrl) {
      return res.status(400).json({ error: 'Title, Conference/Journal, Authors, and PDF Document/URL are required.' });
    }

    let parsedHours = 80;
    if (total_hours !== undefined && total_hours !== null && total_hours !== '') {
      parsedHours = Number(total_hours);
      if (isNaN(parsedHours) || parsedHours <= 0 || parsedHours > 1000) {
        return res.status(400).json({ error: 'Total hours must be a valid positive number up to 1000.' });
      }
    }

    // Check duplicate submission
    const existing = await db.getResearchPapers(studentId);
    const isDuplicate = existing.some((p) => p.title.toLowerCase() === cleanTitle.toLowerCase());
    if (isDuplicate) {
      return res.status(400).json({ error: 'A research paper submission with this title already exists.' });
    }

    const newPaper = await db.createResearchPaper({
      student_id: studentId,
      title: cleanTitle,
      conference_journal: cleanConf,
      authors: cleanAuthors,
      total_hours: parsedHours,
      abstract: cleanAbstract,
      pdf_url: cleanPdfUrl,
      status: 'Pending',
    });

    if (req.user!.mentor_id) {
      await db.createNotification({
        user_id: req.user!.mentor_id,
        title: 'New Research Paper Submission',
        message: `${req.user!.full_name} submitted research paper "${cleanTitle}".`,
        type: 'approval',
        link: '/faculty/approvals',
      });
    }

    await db.logActivity(studentId, 'Submitted Research Paper', `Submitted research paper ${cleanTitle}`, studentId);

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

    const cleanTitle = sanitizeString(title, 255);
    const cleanDesc = sanitizeString(description, 5000);
    const cleanTech = sanitizeString(tech_stack, 255);
    const cleanGithub = sanitizeString(github_link, 2048);
    const cleanDemo = sanitizeString(demo_link, 2048);
    const cleanAiContrib = sanitizeString(ai_contribution, 2000);
    const cleanImgUrl = sanitizeString(image_url, 2048);

    if (!cleanTitle || !cleanDesc || !cleanTech) {
      return res.status(400).json({ error: 'Project Title, Description, and Tech Stack are required.' });
    }

    // Check duplicate submission
    const existing = await db.getProjects(studentId);
    const isDuplicate = existing.some((p) => p.title.toLowerCase() === cleanTitle.toLowerCase());
    if (isDuplicate) {
      return res.status(400).json({ error: 'A project submission with this title already exists.' });
    }

    const newProject = await db.createProject({
      student_id: studentId,
      title: cleanTitle,
      description: cleanDesc,
      github_link: cleanGithub,
      demo_link: cleanDemo,
      tech_stack: cleanTech,
      ai_contribution: cleanAiContrib,
      image_url: cleanImgUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600',
      status: 'Pending',
    });

    if (req.user!.mentor_id) {
      await db.createNotification({
        user_id: req.user!.mentor_id,
        title: 'New AI Project Submission',
        message: `${req.user!.full_name} submitted project "${cleanTitle}".`,
        type: 'approval',
        link: '/faculty/approvals',
      });
    }

    await db.logActivity(studentId, 'Submitted AI Project', `Submitted project ${cleanTitle}`, studentId);

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
