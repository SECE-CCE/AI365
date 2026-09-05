import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, ShieldCheck, Mail, Key, CheckCircle, ArrowRight } from 'lucide-react';

export const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8 font-['Poppins',sans-serif] flex items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-[24px] shadow-xl border border-slate-200 p-8 sm:p-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-[#004990] hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Portal Login
        </Link>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Student Account Onboarding <Sparkles className="w-5 h-5 text-[#F3B631]" />
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Department of Computer & Communication Engineering</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#F3B631] text-[#002B5C] font-extrabold flex items-center justify-center text-xl shadow">365</div>
        </div>

        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs text-slate-700">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-blue-100 text-[#004990] rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Admin-Provisioned Credentials</h4>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                In accordance with CCE Department policy, public student self-registration has been replaced with centralized administrator account provisioning.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200/80 pt-4 space-y-3">
            <h5 className="font-bold text-slate-900">How to access your Student Account:</h5>

            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Step 1: Official Email & Assigned Password</span>
                <p className="text-slate-500">Your account is pre-created by CCE Administration using your official college email ID (<code className="bg-slate-200/60 px-1 py-0.5 rounded font-mono text-[11px]">@sece.ac.in</code>) and an initial assigned password.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Step 2: First-Login Password Update</span>
                <p className="text-slate-500">Upon signing in for the first time, you will be prompted to update your password to a private password of your choice.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Step 3: Access AI Passport Dashboard</span>
                <p className="text-slate-500">Once your password is set, you will immediately gain full access to log learning hours, certificates, and research projects.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">Already received your credentials?</span>
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#004990] hover:bg-[#002B5C] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            Go to Student Sign In <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
