import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, Loader2, CheckCircle2, UserCheck } from 'lucide-react';
import { apiFetch } from '../../services/api';

const MENTORS_LIST = [
  'Dr. S. Dhamodharan',
  'Ms. R. Megala',
  'Ms. R. Preethi',
  'Ms. G. G. Sreeja',
  'Dr. C. Ganesh',
  'Dr. R. Babitha Lincy',
  'Dr. R. R. Thirrunavukkarasu',
  'Mr. R. Arun',
  'Ms. Dency Flora G',
  'Ms. N. Banupriya',
];

export const Register: React.FC = () => {
  // Student fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department] = useState('Computer & Communication Engineering');
  const [registerNumber, setRegisterNumber] = useState('');
  const [year, setYear] = useState('1st Year');
  const [gender, setGender] = useState<'boy' | 'girl'>('boy');
  const [mentorName, setMentorName] = useState(MENTORS_LIST[0]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !password) return setError('Please fill in all required fields.');
    if (!registerNumber.trim()) return setError('Register number is required for students.');
    if (!mentorName) return setError('Please select a faculty mentor.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setSubmitting(true);
    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          password,
          department,
          register_number: registerNumber,
          year,
          gender,
          mentor_name: mentorName,
        }),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8 font-['Poppins',sans-serif] flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-[24px] shadow-xl border border-slate-200 p-8 sm:p-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-[#004990] hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Portal Login
        </Link>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Student Registration <Sparkles className="w-5 h-5 text-[#F3B631]" />
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Department of Computer & Communication Engineering</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#F3B631] text-[#002B5C] font-extrabold flex items-center justify-center text-xl shadow">365</div>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Registration Submitted!</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Your student account for <span className="font-bold text-slate-800">{fullName}</span> with mentor <span className="font-bold text-[#004990]">{mentorName}</span> has been submitted to the CCE Department Administrator for approval.
            </p>
            <div className="pt-4">
              <button onClick={() => navigate('/login')}
                className="px-6 py-2.5 bg-[#004990] text-white rounded-xl font-bold text-xs hover:bg-[#002B5C] transition-all shadow-md">
                Return to Login
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 font-medium">{error}</div>}

            {/* Avatar / Gender Selection */}
            <div>
              <label className="block font-bold text-slate-700 mb-2">Select Profile Avatar *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGender('boy')}
                  className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                    gender === 'boy'
                      ? 'border-[#004990] bg-blue-50/60 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <img
                    src="/boy-avatar.svg"
                    alt="Boy Avatar"
                    className="w-10 h-10 rounded-xl object-contain bg-sky-50 ring-2 ring-blue-500/30 p-0.5"
                  />
                  <div className="text-left">
                    <span className="block font-extrabold text-slate-900 text-xs">Male Avatar</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Student Boy</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setGender('girl')}
                  className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                    gender === 'girl'
                      ? 'border-purple-600 bg-purple-50/60 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <img
                    src="/girl-avatar.svg"
                    alt="Girl Avatar"
                    className="w-10 h-10 rounded-xl object-contain bg-pink-50 ring-2 ring-purple-500/30 p-0.5"
                  />
                  <div className="text-left">
                    <span className="block font-extrabold text-slate-900 text-xs">Female Avatar</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Student Girl</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Register Number *</label>
                <input type="text" required value={registerNumber} onChange={(e) => setRegisterNumber(e.target.value)}
                  placeholder="e.g. 21CCE042"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
              </div>
            </div>

            {/* Mentor Selection Dropdown */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl">
              <label className="block font-bold text-[#004990] mb-1 flex items-center gap-1.5 text-xs">
                <UserCheck className="w-4 h-4 text-[#004990]" />
                Select Your Faculty Mentor *
              </label>
              <select
                value={mentorName}
                onChange={(e) => setMentorName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-blue-200 rounded-xl text-slate-900 font-bold focus:border-[#004990] outline-none transition-all shadow-xs"
              >
                {MENTORS_LIST.map((mentor) => (
                  <option key={mentor} value={mentor}>
                    {mentor}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Selected mentor will be visible to the CCE Department Admin.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <input type="text" readOnly value={department}
                  className="w-full px-3.5 py-2.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl font-medium" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Year *</label>
                <select value={year} onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-[#004990] outline-none transition-all">
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">College Email *</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="name.student@cce.edu"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Password *</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Confirm Password *</label>
                <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Student Registration
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
