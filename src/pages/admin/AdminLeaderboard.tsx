import React, { useState, useEffect, useCallback } from "react";
import { Trophy, Medal, Download, RefreshCw } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Table, Column } from "../../components/common/Table";
import { apiFetch } from "../../services/api";
import { LeaderboardItem, getDocumentUrl } from "../../types";

const YEARS = ["All", "1st Year", "2nd Year", "3rd Year", "4th Year"] as const;

export const AdminLeaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const url =
        selectedYear === "All"
          ? "/api/leaderboard"
          : `/api/leaderboard?year=${encodeURIComponent(selectedYear)}`;
      const data = await apiFetch<{ leaderboard: LeaderboardItem[] }>(url);
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard();
    const interval = setInterval(() => fetchLeaderboard(), 30000);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchLeaderboard();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchLeaderboard]);

  const handleExportCSV = () => {
    if (leaderboard.length === 0) return;
    const headers = ["Rank","Student Name","Register Number","Year","Learning Hours","Certificates","Research Papers","Projects","AI Score"];
    const rows = leaderboard.map((r) => [
      r.rank,
      `"${r.student_name}"`,
      r.register_number || "",
      `"${r.year || ""}"`,
      r.learning_hours,
      r.certificates,
      r.research_papers,
      r.projects,
      r.ai_score,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const yearTag = selectedYear === "All" ? "All" : selectedYear.replace(" ", "");
    a.download = `AI365_Leaderboard_${yearTag}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const topThree = leaderboard.slice(0, 3);

  const columns: Column<LeaderboardItem>[] = [
    {
      header: "Rank",
      cell: (row) => {
        if (row.rank === 1)
          return (
            <span className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center text-xs shadow-sm">1</span>
          );
        if (row.rank === 2)
          return (
            <span className="w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-black flex items-center justify-center text-xs shadow-sm">2</span>
          );
        if (row.rank === 3)
          return (
            <span className="w-7 h-7 rounded-full bg-amber-700 text-amber-100 font-black flex items-center justify-center text-xs shadow-sm">3</span>
          );
        return <span className="font-bold text-slate-500 pl-2">#{row.rank}</span>;
      },
    },
    {
      header: "Student",
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <img
            src={getDocumentUrl(row.profile_photo) || "/boy-avatar.svg"}
            alt={row.student_name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200"
          />
          <div>
            <p className="font-bold text-slate-900">{row.student_name}</p>
            <p className="text-[11px] text-slate-500">{row.register_number} {row.year ? "• " + row.year : ""}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Learning Hrs",
      cell: (row) => <span className="font-semibold text-slate-700">{row.learning_hours} hrs</span>,
    },
    { header: "Certs", accessorKey: "certificates" },
    { header: "Papers", accessorKey: "research_papers" },
    { header: "Projects", accessorKey: "projects" },
    {
      header: "AI Score",
      cell: (row) => (
        <span className="font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 text-xs">
          {row.ai_score} pts
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-[#001E42] via-[#002B5C] to-[#004990] text-white rounded-[24px] p-6 lg:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#F3B631] text-[#002B5C] text-[11px] font-extrabold uppercase tracking-wider mb-2">
            Admin View — All Students
          </span>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-2">
            Department Leaderboard <Trophy className="w-7 h-7 text-[#F3B631]" />
          </h2>
          <p className="text-xs text-slate-200 mt-1 max-w-xl">
            Real-time AI score rankings for all CCE students. Filter by year/batch and export data for reporting.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          {/* Year Filter */}
          <div className="flex items-center space-x-1 bg-white/10 p-1.5 rounded-2xl border border-white/20">
            {YEARS.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedYear === yr
                    ? "bg-[#F3B631] text-[#002B5C] shadow-sm"
                    : "text-slate-200 hover:bg-white/10"
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchLeaderboard(true)}
              disabled={refreshing}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs border border-white/20 flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              disabled={leaderboard.length === 0}
              className="px-4 py-2.5 bg-[#F3B631] hover:bg-amber-400 text-[#002B5C] rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-[18px] border border-slate-200 shadow-sm text-center">
          <p className="text-2xl font-black text-[#004990]">{leaderboard.length}</p>
          <p className="text-xs font-bold text-slate-500 mt-0.5">Ranked Students</p>
        </div>
        <div className="bg-white p-4 rounded-[18px] border border-slate-200 shadow-sm text-center">
          <p className="text-2xl font-black text-amber-600">{leaderboard[0]?.ai_score ?? "—"}</p>
          <p className="text-xs font-bold text-slate-500 mt-0.5">Top AI Score</p>
        </div>
        <div className="bg-white p-4 rounded-[18px] border border-slate-200 shadow-sm text-center">
          <p className="text-2xl font-black text-emerald-600">
            {leaderboard.reduce((s, r) => s + (r.learning_hours || 0), 0)}
          </p>
          <p className="text-xs font-bold text-slate-500 mt-0.5">Total Dept Hrs</p>
        </div>
        <div className="bg-white p-4 rounded-[18px] border border-slate-200 shadow-sm text-center">
          <p className="text-2xl font-black text-indigo-600">
            {leaderboard.reduce((s, r) => s + (r.certificates || 0), 0)}
          </p>
          <p className="text-xs font-bold text-slate-500 mt-0.5">Total Certs</p>
        </div>
      </div>

      {/* Podium Top 3 */}
      {!loading && topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* 2nd Place Silver */}
          <div className="bg-white rounded-[24px] border-2 border-slate-300 p-6 shadow-md text-center flex flex-col items-center relative order-2 md:order-1 mt-0 md:mt-8">
            <div className="absolute -top-4 w-8 h-8 rounded-full bg-slate-300 text-slate-900 font-extrabold flex items-center justify-center text-sm shadow">2</div>
            <img src={getDocumentUrl(topThree[1].profile_photo) || "/boy-avatar.svg"} alt={topThree[1].student_name} className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-300 shadow-md mb-3 mt-2" />
            <h3 className="font-extrabold text-slate-900 text-base">{topThree[1].student_name}</h3>
            <p className="text-xs text-slate-500 font-semibold">{topThree[1].register_number} • {topThree[1].year}</p>
            <div className="mt-4 px-4 py-2 bg-slate-100 rounded-xl font-black text-slate-800 text-lg">{topThree[1].ai_score} <span className="text-xs font-semibold text-slate-500">pts</span></div>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500"><Medal className="w-3.5 h-3.5 text-slate-400" />{topThree[1].learning_hours} hrs · {topThree[1].certificates} certs</div>
          </div>

          {/* 1st Place Gold */}
          <div className="bg-gradient-to-b from-amber-50 to-white rounded-[28px] border-4 border-[#F3B631] p-6 shadow-xl text-center flex flex-col items-center relative order-1 md:order-2 ring-4 ring-amber-200/50">
            <div className="absolute -top-5 px-3 py-1 rounded-full bg-[#F3B631] text-[#002B5C] font-black flex items-center gap-1 text-xs shadow-md"><Trophy className="w-3.5 h-3.5" /> 1st Place Gold</div>
            <img src={getDocumentUrl(topThree[0].profile_photo) || "/boy-avatar.svg"} alt={topThree[0].student_name} className="w-24 h-24 rounded-full object-cover ring-4 ring-[#F3B631] shadow-lg mb-3 mt-2" />
            <h3 className="font-black text-slate-900 text-lg">{topThree[0].student_name}</h3>
            <p className="text-xs text-amber-800 font-bold">{topThree[0].register_number} • {topThree[0].year}</p>
            <div className="mt-4 px-6 py-2.5 bg-[#002B5C] text-[#F3B631] rounded-2xl font-black text-2xl shadow-md">{topThree[0].ai_score} <span className="text-xs text-white font-medium">pts</span></div>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-800"><Trophy className="w-3.5 h-3.5 text-amber-500" />{topThree[0].learning_hours} hrs · {topThree[0].certificates} certs · {topThree[0].research_papers} papers</div>
          </div>

          {/* 3rd Place Bronze */}
          <div className="bg-white rounded-[24px] border-2 border-amber-700/40 p-6 shadow-md text-center flex flex-col items-center relative order-3 mt-0 md:mt-12">
            <div className="absolute -top-4 w-8 h-8 rounded-full bg-amber-700 text-amber-100 font-extrabold flex items-center justify-center text-sm shadow">3</div>
            <img src={getDocumentUrl(topThree[2].profile_photo) || "/boy-avatar.svg"} alt={topThree[2].student_name} className="w-20 h-20 rounded-full object-cover ring-4 ring-amber-700/40 shadow-md mb-3 mt-2" />
            <h3 className="font-extrabold text-slate-900 text-base">{topThree[2].student_name}</h3>
            <p className="text-xs text-slate-500 font-semibold">{topThree[2].register_number} • {topThree[2].year}</p>
            <div className="mt-4 px-4 py-2 bg-amber-50 rounded-xl font-black text-amber-900 text-lg">{topThree[2].ai_score} <span className="text-xs font-semibold text-slate-500">pts</span></div>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500"><Medal className="w-3.5 h-3.5 text-amber-700" />{topThree[2].learning_hours} hrs · {topThree[2].certificates} certs</div>
          </div>
        </div>
      )}

      {/* Full Standings Table */}
      <Card
        title={`Full Department Standings — ${selectedYear}`}
        subtitle="Verified AI score rankings for all CCE students. Scores update in real-time as submissions are approved."
      >
        {loading ? (
          <div className="py-14 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#004990]" />
            <p className="text-sm font-semibold">Loading rankings...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-14 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Trophy className="w-12 h-12 opacity-30" />
            <p className="font-bold text-slate-500 text-sm">No ranked students for this filter</p>
            <p className="text-xs text-slate-400">Students appear here once their account is approved and activities are verified.</p>
          </div>
        ) : (
          <Table columns={columns} data={leaderboard} keyExtractor={(r) => String(r.student_id)} />
        )}
      </Card>
    </div>
  );
};
