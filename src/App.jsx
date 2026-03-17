import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query,
  writeBatch
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  Users, BookOpen, CheckCircle2, Circle, Clock, Plus, Trash2, BarChart3, 
  Beaker, Trophy, ClipboardCheck, Calculator, Calendar, 
  MessageSquare, Search, AlertCircle, X as LucideX, History, 
  Edit2, Layers, UserPlus, Info, ListChecks, 
  StickyNote, Bookmark, UserCheck, MinusCircle, 
  BrainCircuit, Zap, Activity, FileText, Save, CheckCircle,
  GraduationCap, UserCog, ChevronRight, LogOut, ShieldCheck,
  KeyRound, AlertTriangle, Fingerprint, School, UserCircle2, FileSearch, ClipboardList, Loader2,
  Tag, TrendingUp, Printer, Sparkles, Copy, ChevronDown, Bot, RefreshCw
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyBaWWriu3X7iVQnglR5XcA0Mqqc736VopM",
  authDomain: "science-academy-13dda.firebaseapp.com",
  projectId: "science-academy-13dda",
  storageBucket: "science-academy-13dda.firebasestorage.app",
  messagingSenderId: "449626746191",
  appId: "1:449626746191:web:73885c6bb862a07655293a",
  measurementId: "G-4W0B7CX2DX"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'science-academy-v16';

// --- Constants & Configuration ---
const SUBJECTS = ['물리', '화학', '생명과학', '지구과학', '통합과학'];
const DIFFICULTIES = ['하', '중하', '중', '중상', '상', '극상'];
const ASSIGNMENT_LEVELS = ['기초', '기본', '심화', '최고난도'];

const MEMO_STATUS_ORDER = ['not_started', 'round_1', 'round_2', 'round_3', 'round_4'];
const MEMO_STATUS_CONFIG = {
  not_started: { label: '시작 전', color: 'text-slate-300', bg: 'bg-slate-50', icon: Circle },
  round_1: { label: '1회독', color: 'text-cyan-500', bg: 'bg-cyan-50', icon: Zap },
  round_2: { label: '2회독', color: 'text-blue-500', bg: 'bg-blue-50', icon: Activity },
  round_3: { label: '3회독', color: 'text-purple-600', bg: 'bg-purple-50', icon: Layers },
  round_4: { label: '4회독', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
};

const ASSIGN_STATUS_ORDER = ['not_started', 'in_progress', 'incomplete_red', 'completed', 'exempt'];
const ASSIGN_LABELS = {
  in_progress: '진행 중',
  incomplete_red: '미완료',
  completed: '완료',
  exempt: '해당 없음'
};
const ASSIGN_STATUS_CONFIG = {
  not_started: { label: '시작 전', color: 'text-slate-300', bg: 'bg-slate-50', icon: Circle },
  in_progress: { label: '진행 중', color: 'text-slate-900', bg: 'bg-slate-100', icon: Clock },
  incomplete_red: { label: '미완료', color: 'text-red-500', bg: 'bg-red-50', icon: AlertCircle },
  completed: { label: '완료', color: 'text-blue-500', bg: 'bg-blue-50', icon: CheckCircle2 },
  exempt: { label: '해당 없음', color: 'text-slate-400', bg: 'bg-slate-100/50', icon: MinusCircle }
};

const STATUS_COLORS = {
  completed: 'text-blue-500 bg-blue-50',
  late_completed: 'text-orange-500 bg-orange-50',
  in_progress: 'text-slate-900 bg-slate-100',
  incomplete_red: 'text-red-500 bg-red-50',
  not_started: 'text-slate-300 bg-slate-50',
  exempt: 'text-slate-400 bg-slate-100/50 border border-dashed border-slate-200'
};

const DEFAULT_GRADE_SCALES = [
  { id: 'g1', label: '우수', min: 90, color: 'bg-indigo-500', icon: '🔥' },
  { id: 'g2', label: '보통', min: 70, color: 'bg-emerald-500', icon: '⭐' },
  { id: 'g3', label: '노력', min: 50, color: 'bg-yellow-500', icon: '📝' },
  { id: 'g4', label: '부진', min: 0, color: 'bg-red-500', icon: '⚠️' }
];

// --- CSS Color Variable Injector ---
function SiteColorStyle({ color }) {
  const hex = color || '#3730a3';
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  const lighten = (amt) => {
    const nr = Math.min(255, r + amt), ng = Math.min(255, g + amt), nb = Math.min(255, b + amt);
    return '#' + [nr,ng,nb].map(x=>x.toString(16).padStart(2,'0')).join('');
  };
  const darken = (amt) => {
    const nr = Math.max(0, r - amt), ng = Math.max(0, g - amt), nb = Math.max(0, b - amt);
    return '#' + [nr,ng,nb].map(x=>x.toString(16).padStart(2,'0')).join('');
  };
  const alpha = (a) => `rgba(${r},${g},${b},${a})`;
  return (
    <style>{`
      :root {
        --sc: ${hex};
        --sc-dark: ${darken(30)};
        --sc-darker: ${darken(55)};
        --sc-light: ${lighten(180)};
        --sc-faint: ${alpha(0.08)};
        --sc-faint2: ${alpha(0.15)};
        --sc-text: ${alpha(0.9)};
      }
    `}</style>
  );
}

// --- Error Boundary ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return <div className="p-10 text-center font-bold text-red-500 bg-white m-4 rounded-3xl shadow-sm border">시스템 로딩 중 오류가 발생했습니다. 페이지를 새로고침 해주세요.</div>;
    return this.props.children;
  }
}

// --- Helper Functions ---
const calculateRoundProgress = (students, items, submissionData, statusOrder, labels) => {
  return students.reduce((acc, s) => {
    const rel = items.filter(a => a.type === 'all' || (a.targetStudents && a.targetStudents.includes(s.id)));
    const initialCount = rel.length;
    if (initialCount === 0) { acc[s.id] = { label: "미부여", percent: "0.0" }; return acc; }

    const exemptCount = rel.filter(item => (submissionData[`${s.id}-${item.id}`]?.status === 'exempt')).length;
    const effectiveTotal = initialCount - exemptCount;
    if (effectiveTotal <= 0) { acc[s.id] = { label: "제외됨", percent: "100.0" }; return acc; }

    const actualStages = statusOrder.slice(1).filter(st => st !== 'exempt');
    let displayLabel = labels ? (labels[actualStages[0]] || "진행 중") : "1회독";
    let displayPercent = "0.0";

    for (let i = 0; i < actualStages.length; i++) {
      const currentStageKey = actualStages[i];
      const countReached = rel.filter(item => {
        const status = submissionData[`${s.id}-${item.id}`]?.status || 'not_started';
        if (status === 'exempt') return false;
        return statusOrder.indexOf(status) >= statusOrder.indexOf(currentStageKey);
      }).length;

      const percent = ((countReached / effectiveTotal) * 100).toFixed(1);
      displayLabel = labels ? (labels[currentStageKey] || "진행 중") : `${i + 1}회독`;
      displayPercent = percent;

      if (percent !== "100.0") break;
      if (i < actualStages.length - 1) continue;
    }
    acc[s.id] = { label: displayLabel, percent: displayPercent };
    return acc;
  }, {});
};

// --- [FIX 1] getTargetStudentNamesLocal 함수 추가 ---
// 원본 코드에서 호출은 하지만 정의가 없어 런타임 에러 발생하던 함수
const getTargetStudentNamesLocal = (students, ids) =>
  students.filter(s => ids?.includes(s.id)).map(s => s.name).join(', ') || '없음';

// --- Shared UI Components ---
const BufferedInput = ({ value, onSave, placeholder, className, type = "text", disabled = false }) => {
  const [temp, setTemp] = useState(value || '');
  useEffect(() => { setTemp(value || ''); }, [value]);
  const handleBlur = () => { if (!disabled && temp !== value) onSave(temp); };
  return (
    <input type={type} value={temp} onChange={(e) => setTemp(e.target.value)} onBlur={handleBlur} disabled={disabled}
      onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} placeholder={placeholder} className={`${className} select-text`} />
  );
};

const BufferedTextarea = ({ value, onSave, placeholder, className, disabled = false }) => {
  const [temp, setTemp] = useState(value || '');
  useEffect(() => { setTemp(value || ''); }, [value]);
  const handleBlur = () => { if (!disabled && temp !== value) onSave(temp); };
  return (
    <textarea value={temp} onChange={(e) => setTemp(e.target.value)} onBlur={handleBlur} disabled={disabled}
      placeholder={placeholder} className={`${className} select-text`} />
  );
};

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matrix');

  // RBAC State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [myStudentId, setMyStudentId] = useState(null);
  const [siteTitle, setSiteTitle] = useState('Science Academy');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [siteColor, setSiteColor] = useState('#3730a3');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [reportRange, setReportRange] = useState({ from: '', to: '' });
  const [reportText, setReportText] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  // Auth Overlay
  const [showPasswordInput, setShowPasswordInput] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [studentCodeInput, setStudentCodeInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Core Data
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [memoItems, setMemoItems] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [memoSubmissions, setMemoSubmissions] = useState({});
  const [tests, setTests] = useState([]);
  const [testScores, setTestScores] = useState({});
  const [attendance, setAttendance] = useState({});
  const [attendanceNotes, setAttendanceNotes] = useState({});
  const [makeupDates, setMakeupDates] = useState({});
  const [studentNotes, setStudentNotes] = useState({});
  const [progressPlans, setProgressPlans] = useState([]);
  const [progressCalMonth, setProgressCalMonth] = useState(() => {
    const k = new Date(Date.now() + 9*60*60*1000);
    return k.toISOString().slice(0, 7);
  });
  const [progressSelectedDate, setProgressSelectedDate] = useState(() => {
    return new Date(Date.now() + 9*60*60*1000).toISOString().split('T')[0];
  });
  const [newPlan, setNewPlan] = useState({ subject: '물리', unit: '', memo: '' });
  const [editPlanId, setEditPlanId] = useState(null);
  const [editPlanData, setEditPlanData] = useState(null);

  // UI Support
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().split('T')[0];
  });
  const [regCategory, setRegCategory] = useState('assignment');
  const [openBulkMenu, setOpenBulkMenu] = useState(null);
  const [bulkDatePopup, setBulkDatePopup] = useState(null);
  const [bulkSelectedStatus, setBulkSelectedStatus] = useState(null);
  const [bulkSelectedDate, setBulkSelectedDate] = useState(() => { const k = new Date(Date.now() + 9*60*60*1000); return k.toISOString().split('T')[0]; });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isTestEditMode, setIsTestEditMode] = useState(false);
  const [bulkStudentInput, setBulkStudentInput] = useState('');
  const [inlineDateEditKey, setInlineDateEditKey] = useState(null);
  const [statusMenu, setStatusMenu] = useState(null);

  const [editStudentId, setEditStudentId] = useState(null);
  const [editStudentData, setEditStudentData] = useState({ name: '', studentCode: '', homeroomTeacher: '', highSchool: '' });
  const [editItemId, setEditItemId] = useState(null);
  const [editItemData, setEditItemData] = useState(null);

  const [newAssignment, setNewAssignment] = useState({ title: '', subject: '물리', level: '기본', type: 'all', targetStudents: [], deadline: '' });
  const [newTest, setNewTest] = useState({ 
    title: '', source: '', difficulty: '중', description: '', 
    date: new Date(Date.now() + 9*60*60*1000).toISOString().split('T')[0], 
    scales: DEFAULT_GRADE_SCALES 
  });

  // --- Logic Hooks ---
  const visibleStudentsFiltered = useMemo(() => {
    if (userRole === 'student' && myStudentId) return students.filter(s => s.id === myStudentId);
    return students;
  }, [students, userRole, myStudentId]);

  const stats = useMemo(() => {
    if (!students || students.length === 0) return { assign: {}, memo: {}, studentTestAverages: {}, testAverages: {} };

    const assign = calculateRoundProgress(students, assignments, submissions, ASSIGN_STATUS_ORDER, ASSIGN_LABELS);
    const memo = calculateRoundProgress(students, memoItems, memoSubmissions, MEMO_STATUS_ORDER, null);

    return {
      assign, memo,
      studentTestAverages: students.reduce((acc, s) => {
        const scs = tests.map(t => testScores[`${s.id}-${t.id}`]?.score).filter(v => v !== null && v !== undefined);
        acc[s.id] = scs.length ? (scs.reduce((a, b) => a + b, 0) / scs.length).toFixed(1) : "0.0";
        return acc;
      }, {}),
      testAverages: tests.reduce((acc, t) => {
        const scs = students.map(s => testScores[`${s.id}-${t.id}`]?.score).filter(v => v !== null && v !== undefined);
        acc[t.id] = scs.length ? (scs.reduce((a, b) => a + b, 0) / scs.length).toFixed(1) : "0.0";
        return acc;
      }, {})
    };
  }, [students, assignments, memoItems, submissions, memoSubmissions, tests, testScores]);

  // --- Handlers ---
  const handleLogin = (role, sId = null) => {
    setUserRole(role);
    setMyStudentId(sId);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setMyStudentId(null);
    setActiveTab('matrix');
  };

  const handleLoginAttempt = (role) => {
    setShowPasswordInput(role);
    setPasswordInput('');
    setStudentCodeInput('');
    setLoginError(false);
  };

  const handleAuthSubmit = () => {
    const passwords = { master: '71207179', teacher: '26350' };
    if (showPasswordInput === 'student') {
      const found = students.find(s => s.studentCode && s.studentCode.trim() === studentCodeInput.trim());
      if (found) { handleLogin('student', found.id); setShowPasswordInput(null); }
      else { setLoginError(true); }
    } else if (passwordInput === passwords[showPasswordInput]) {
      handleLogin(showPasswordInput);
      setShowPasswordInput(null);
    } else {
      setLoginError(true);
    }
  };

  const saveSiteTitle = async (newTitle) => {
    if (userRole !== 'master') return;
    setSiteTitle(newTitle);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { siteTitle: newTitle }, { merge: true });
    setIsEditingTitle(false);
  };

  const saveStudentNote = async (studentId, note) => {
    if (userRole !== 'master') return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'notes', studentId), { note }, { merge: true });
  };

  // --- Report Generator ---
  const generateReport = () => {
    const { from, to } = reportRange;
    const fromDate = from || '0000-00-00';
    const toDate = to || '9999-99-99';
    const inRange = (date) => !date || (date >= fromDate && date <= toDate);

    const lines = [];
    const now = new Date(Date.now() + 9*60*60*1000).toISOString().split('T')[0];
    lines.push(`===== 학원 학습 종합 리포트 =====`);
    lines.push(`생성일: ${now}  |  기간: ${from || '전체'} ~ ${to || '전체'}`);
    lines.push(`학생 수: ${students.length}명\n`);

    // ── 과제 현황 ──
    lines.push(`[과제 현황]`);
    const rangedAssign = assignments.filter(a => inRange(a.deadline));
    rangedAssign.forEach(a => {
      lines.push(`\n• ${a.subject} / ${a.level} — ${a.title}${a.deadline ? ` (마감: ${a.deadline})` : ''}`);
      students.forEach(s => {
        if (!(a.type === 'all' || (a.targetStudents && a.targetStudents.includes(s.id)))) return;
        const sub = submissions[`${s.id}-${a.id}`] || {};
        const status = ASSIGN_STATUS_CONFIG[sub.status || 'not_started']?.label || '-';
        lines.push(`  ${s.name}: ${status}${sub.completionDate ? ` (완료일: ${sub.completionDate})` : ''}`);
      });
    });
    if (rangedAssign.length === 0) lines.push('  (해당 기간 과제 없음)');

    // ── 암기 현황 ──
    lines.push(`\n[암기 현황]`);
    const rangedMemo = memoItems;
    rangedMemo.forEach(m => {
      lines.push(`\n• ${m.subject} / ${m.level} — ${m.title}`);
      students.forEach(s => {
        if (!(m.type === 'all' || (m.targetStudents && m.targetStudents.includes(s.id)))) return;
        const sub = memoSubmissions[`${s.id}-${m.id}`] || {};
        const status = MEMO_STATUS_CONFIG[sub.status || 'not_started']?.label || '-';
        lines.push(`  ${s.name}: ${status}`);
      });
    });
    if (rangedMemo.length === 0) lines.push('  (암기 항목 없음)');

    // ── 성적표 ──
    lines.push(`\n[성적표]`);
    const rangedTests = tests.filter(t => inRange(t.date));
    if (rangedTests.length === 0) {
      lines.push('  (해당 기간 시험 없음)');
    } else {
      lines.push(`  시험 수: ${rangedTests.length}개`);
      rangedTests.forEach(t => {
        const avg = stats.testAverages[t.id] || '0.0';
        lines.push(`\n• [${t.date}] ${t.title}  난이도: ${t.difficulty || '-'}  출처: ${t.source || '-'}  반평균: ${avg}점`);
        students.forEach(s => {
          const sc = testScores[`${s.id}-${t.id}`];
          if (sc?.score !== null && sc?.score !== undefined) {
            lines.push(`  ${s.name}: ${sc.score}점${sc.plan ? `  (계획: ${sc.plan})` : ''}`);
          }
        });
      });
      lines.push(`\n  학생별 시험 평균:`);
      students.forEach(s => {
        lines.push(`  ${s.name}: ${stats.studentTestAverages[s.id] || '0.0'}점`);
      });
    }

    // ── 출결 ──
    lines.push(`\n[출결 현황]`);
    const attKeys = Object.keys(attendance).filter(k => {
      const d = k.split('-').slice(1).join('-');
      return inRange(d);
    });
    if (attKeys.length === 0) {
      lines.push('  (해당 기간 출결 기록 없음)');
    } else {
      students.forEach(s => {
        const myKeys = attKeys.filter(k => k.startsWith(`${s.id}-`));
        const present = myKeys.filter(k => attendance[k]?.status === 'present').length;
        const late = myKeys.filter(k => attendance[k]?.status === 'late').length;
        const absent = myKeys.filter(k => attendance[k]?.status === 'absent').length;
        const makeup = myKeys.filter(k => attendance[k]?.makeup).length;
        if (myKeys.length > 0) lines.push(`  ${s.name}: 출석 ${present}  지각 ${late}  결석 ${absent}  보충 ${makeup}`);
      });
    }

    // ── 진도 관리 ──
    lines.push(`\n[진도 관리]`);
    const rangedPlans = progressPlans.filter(p => inRange(p.date));
    if (rangedPlans.length === 0) {
      lines.push('  (해당 기간 진도 계획 없음)');
    } else {
      const totalP = rangedPlans.length;
      const doneP = rangedPlans.filter(p => p.done).length;
      lines.push(`  전체 진도율: ${totalP > 0 ? Math.round(doneP/totalP*100) : 0}%  (${doneP}/${totalP} 완료)`);
      SUBJECTS.forEach(sub => {
        const subPlans = rangedPlans.filter(p => p.subject === sub);
        if (subPlans.length === 0) return;
        const subDone = subPlans.filter(p => p.done).length;
        lines.push(`  ${sub}: ${Math.round(subDone/subPlans.length*100)}%  (${subDone}/${subPlans.length})`);
        subPlans.forEach(p => lines.push(`    [${p.date}${p.done ? ' ✓' : ''}] ${p.unit}${p.memo ? `  — ${p.memo}` : ''}`));
      });
    }

    lines.push(`\n================================`);
    const text = lines.join('\n');
    setReportText(text);
    setReportGenerated(true);
    setAiAnalysis('');
  };

  const requestAiAnalysis = async () => {
    if (!reportText || aiLoading) return;
    setAiLoading(true);
    setAiAnalysis('');
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `당신은 학원 학습 데이터 분석 전문가입니다. 아래 학습 리포트를 분석하고, 다음 항목에 대해 한국어로 구체적이고 실질적인 개선점을 제안해 주세요:\n\n1. 📚 과제 이행률 및 완료 패턴 분석\n2. 📖 암기 학습 진척도 분석\n3. 📊 성적 추이 및 개선 필요 학생\n4. 🗓️ 출결 패턴 분석\n5. 📈 진도 관리 현황 분석\n6. 💡 종합 개선 제언 (우선순위 3가지)\n\n리포트:\n${reportText}`
          }]
        })
      });
      const data = await res.json();
      const text = (data.content || []).map(b => b.text || '').join('');
      setAiAnalysis(text || '분석 결과를 받아오지 못했습니다.');
    } catch (e) {
      setAiAnalysis('AI 분석 중 오류가 발생했습니다: ' + e.message);
    }
    setAiLoading(false);
  };

    const saveSiteColor = async (color) => {
    if (userRole !== 'master') return;
    setSiteColor(color);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { siteColor: color }, { merge: true });
    setShowColorPicker(false);
  };

  const handleStatusSelect = async (sid, itemId, category, nextStatus) => {
    if (userRole !== 'master') return;
    const key = `${sid}-${itemId}`;
    const coll = category === 'assignment' ? 'submissions' : 'memoSubmissions';
    let date = null;
    if (nextStatus === 'completed' || nextStatus === 'round_4') date = new Date().toISOString().split('T')[0];
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', coll, key), { status: nextStatus, completionDate: date }, { merge: true });
    setStatusMenu(null);
  };

  const bulkUpdateStatus = async (item, nextStatus, category) => {
    if (userRole !== 'master') return;
    const batch = writeBatch(db);
    const coll = category === 'assignment' ? 'submissions' : 'memoSubmissions';
    const actualDate = (nextStatus === 'completed' || nextStatus === 'round_4') ? bulkSelectedDate : null;
    students.forEach(s => {
      if (item.type === 'all' || (item.targetStudents && item.targetStudents.includes(s.id))) {
        batch.set(doc(db, 'artifacts', appId, 'public', 'data', coll, `${s.id}-${item.id}`), { status: nextStatus, completionDate: actualDate }, { merge: true });
      }
    });
    await batch.commit();
    setOpenBulkMenu(null);
    setBulkDatePopup(null);
  };

  const addAssignment = async () => {
    if (userRole !== 'master' || !newAssignment.title.trim()) return;
    const coll = regCategory === 'assignment' ? 'assignments' : 'memoItems';
    const id = (regCategory === 'assignment' ? 'a' : 'm') + Date.now();
    const list = (regCategory === 'assignment' ? assignments : memoItems);
    const sortOrder = list.length > 0 ? Math.max(...list.map(x => x.sortOrder || 0)) + 1 : 0;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', coll, id), { ...newAssignment, sortOrder, category: regCategory });
    setNewAssignment(prev => ({ ...prev, title: '' }));
  };

  const addTest = async () => {
    if (userRole !== 'master' || !newTest.title.trim()) return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tests', 't' + Date.now()), { ...newTest });
    setNewTest(prev => ({ ...prev, title: '', description: '' }));
  };

  const updateTestDetails = async () => {
    if (userRole !== 'master' || !selectedTest) return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tests', selectedTest.id), selectedTest, { merge: true });
    setIsTestEditMode(false);
  };

  const saveEditItem = async () => {
    if (userRole !== 'master' || !editItemData?.title.trim()) return;
    const coll = editItemData.category === 'assignment' ? 'assignments' : 'memoItems';
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', coll, editItemId), editItemData, { merge: true });
    setEditItemId(null);
    setEditItemData(null);
  };

  const deleteItem = async (coll, id) => {
    if (userRole !== 'master') return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', coll, id));
  };

  const saveStudentDetails = async () => {
    if (userRole !== 'master') return;
    if (!editStudentId || !editStudentData.name.trim()) return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', editStudentId), editStudentData, { merge: true });
    setEditStudentId(null);
  };

  const updateAttendance = async (sid, type) => {
    if (userRole !== 'master') return;
    const key = `${sid}-${currentDate}`;
    const cur = attendance[key] || { status: 'none', makeup: false };
    const update = type === 'makeup' ? { ...cur, makeup: !cur.makeup } : { ...cur, status: cur.status === type ? 'none' : type };
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'attendance', key), update);
  };

  const updateMakeupDateValue = async (sid, attDate, mDate) => {
    if (userRole !== 'master') return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'makeupDates', `${sid}-${attDate}`), { date: mDate });
  };

  const handleBulkAttendanceToggle = async () => {
    if (userRole !== 'master' || students.length === 0) return;
    const areAllPresent = students.every(s => attendance[`${s.id}-${currentDate}`]?.status === 'present');
    const nextStatus = areAllPresent ? 'none' : 'present';
    const batch = writeBatch(db);
    students.forEach(s => {
      const key = `${s.id}-${currentDate}`;
      const cur = attendance[key] || { status: 'none', makeup: false };
      batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'attendance', key), { ...cur, status: nextStatus }, { merge: true });
    });
    await batch.commit();
  };

  const addPlan = async () => {
    if (userRole !== 'master' || !newPlan.unit.trim()) return;
    const id = 'p' + Date.now();
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'progressPlans', id), {
      ...newPlan, date: progressSelectedDate, done: false
    });
    setNewPlan(prev => ({ ...prev, unit: '', memo: '' }));
  };

  const togglePlanDone = async (plan) => {
    if (userRole !== 'master') return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'progressPlans', plan.id), { done: !plan.done }, { merge: true });
  };

  const saveEditPlan = async () => {
    if (userRole !== 'master' || !editPlanId || !editPlanData?.unit.trim()) return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'progressPlans', editPlanId), editPlanData, { merge: true });
    setEditPlanId(null);
    setEditPlanData(null);
  };

  const deletePlan = async (id) => {
    if (userRole !== 'master') return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'progressPlans', id));
  };

    const updateCompletionDate = async (sid, itemId, date, category) => {
    if (userRole !== 'master') return;
    const coll = category === 'assignment' ? 'submissions' : 'memoSubmissions';
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', coll, `${sid}-${itemId}`), { completionDate: date }, { merge: true });
    setInlineDateEditKey(null);
  };

  // --- Sync Effects ---
  useEffect(() => {
    let unsubscribers = [];
    // [FIX 3] setLoading(false)를 notes 콜백에만 의존하지 않도록
    // 모든 구독 등록 후 별도로 처리
    let loadingDone = false;

    const initApp = async () => {
      try {
        await signInAnonymously(auth);

        onAuthStateChanged(auth, (u) => {
          setUser(u);
          if (u) {
            const basePath = ['artifacts', appId, 'public', 'data'];
            unsubscribers.push(onSnapshot(doc(db, ...basePath, 'settings', 'config'), snap => { if (snap.exists()) { setSiteTitle(snap.data().siteTitle || 'Science Academy'); if (snap.data().siteColor) setSiteColor(snap.data().siteColor); } }));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'students')), s => setStudents(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.name.localeCompare(b.name, 'ko')))));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'assignments')), s => setAssignments(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)))));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'memoItems')), s => setMemoItems(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)))));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'submissions')), s => { const d = {}; s.docs.forEach(x => d[x.id] = x.data()); setSubmissions(d); }));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'memoSubmissions')), s => { const d = {}; s.docs.forEach(x => d[x.id] = x.data()); setMemoSubmissions(d); }));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'tests')), s => setTests(s.docs.map(d => ({ id: d.id, ...d.data() })))));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'testScores')), s => { const d = {}; s.docs.forEach(x => d[x.id] = x.data()); setTestScores(d); }));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'attendance')), s => { const d = {}; s.docs.forEach(x => d[x.id] = x.data()); setAttendance(d); }));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'attendanceNotes')), s => { const d = {}; s.docs.forEach(x => d[x.id] = x.data().note); setAttendanceNotes(d); }));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'makeupDates')), s => { const d = {}; s.docs.forEach(x => d[x.id] = x.data().date); setMakeupDates(d); }));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'notes')), s => { const d = {}; s.docs.forEach(x => d[x.id] = x.data().note); setStudentNotes(d); }));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'progressPlans')), s => setProgressPlans(s.docs.map(d => ({ id: d.id, ...d.data() })))));

            // [FIX 3] notes 콜백 의존 제거: 인증 완료 후 바로 로딩 해제
            if (!loadingDone) {
              loadingDone = true;
              setLoading(false);
            }
          }
        });
      } catch (e) {
        console.error(e);
        setLoading(false); // 에러 시에도 로딩 해제
      }
    };
    initApp();
    return () => unsubscribers.forEach(u => u());
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
    </div>
  );

  // --- Auth Render ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans text-slate-900 font-black">
        <div className="w-full max-w-lg bg-white rounded-[3.5rem] shadow-2xl p-12 border border-slate-200 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center mb-10 text-center font-black">
            <div className="rounded-[2.2rem] text-white mb-6 shadow-2xl p-6" style={{background:siteColor}}><Beaker size={48} /></div>
            <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none text-center">{siteTitle}</h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-3">시스템 접속 권한 인증</p>
          </div>
          <div className="space-y-4 max-w-sm mx-auto font-black">
            <button onClick={() => handleLoginAttempt('master')} className="w-full group flex items-center justify-between p-6 rounded-[1.8rem] text-white shadow-lg transition-all active:scale-95" style={{background:siteColor}}>
              <div className="flex items-center gap-4 text-left"><ShieldCheck size={24} /><div><p className="font-black text-lg leading-none">마스터 로그인</p><p className="text-xs text-indigo-100 font-medium mt-1">관리 및 모든 수정 권한</p></div></div>
              <ChevronRight size={20} className="opacity-40" />
            </button>
            <button onClick={() => handleLoginAttempt('teacher')} className="w-full group flex items-center justify-between p-6 bg-white border-2 rounded-[1.8rem] shadow-sm transition-all active:scale-95" style={{color:siteColor, borderColor:siteColor+'22'}}>
              <div className="flex items-center gap-4 text-left"><UserCog size={24} /><div><p className="font-black text-lg leading-none">선생님 / 실장님</p><p className="text-xs text-indigo-300 font-medium mt-1">전체 조회 전용 모드</p></div></div>
              <ChevronRight size={20} className="opacity-40" />
            </button>
            <div className="relative py-6"><div className="absolute inset-0 flex items-center px-4"><div className="w-full border-t border-slate-100"></div></div><div className="relative flex justify-center text-[10px] uppercase font-black text-slate-300 tracking-[0.3em]">Student Portal</div></div>
            <button onClick={() => handleLoginAttempt('student')} className="w-full group flex items-center justify-between p-6 bg-emerald-600 rounded-[1.8rem] text-white shadow-lg hover:bg-emerald-700 transition-all active:scale-95">
              <div className="flex items-center gap-4 text-left"><Fingerprint size={24} /><div><p className="font-black text-lg">학생 / 학부모 포털</p><p className="text-xs text-emerald-100 font-medium mt-1">학생 코드로 접속</p></div></div>
              <ChevronRight size={20} className="opacity-40" />
            </button>
          </div>
        </div>
        {showPasswordInput && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-white rounded-[2.8rem] p-10 shadow-2xl animate-in zoom-in-95">
              <div className="flex flex-col items-center text-center mb-8 font-black">
                <div className={`p-4 rounded-2xl mb-4 ${showPasswordInput === 'student' ? 'bg-emerald-100 text-emerald-600' : showPasswordInput === 'master' ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600'}`}>
                  {showPasswordInput === 'student' ? <Fingerprint size={32} /> : <KeyRound size={32} />}
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase">{showPasswordInput === 'student' ? 'Student' : showPasswordInput === 'master' ? 'Master' : 'Manager'} 인증</h3>
                <p className="text-sm text-slate-400 font-bold mt-1">정보를 입력하세요.</p>
              </div>
              <div className="space-y-4 font-black">
                <input
                  type={showPasswordInput === 'student' ? 'text' : 'password'} autoFocus placeholder={showPasswordInput === 'student' ? "학생 코드" : "Password"}
                  value={showPasswordInput === 'student' ? studentCodeInput : passwordInput}
                  onChange={(e) => { if (showPasswordInput === 'student') setStudentCodeInput(e.target.value); else setPasswordInput(e.target.value); setLoginError(false); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAuthSubmit()}
                  className={`w-full p-4 bg-slate-50 rounded-2xl border-2 text-center text-xl font-black tracking-widest outline-none transition-all ${loginError ? 'border-red-500 bg-red-50 animate-shake' : 'border-transparent focus:border-indigo-500'}`}
                />
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button onClick={() => setShowPasswordInput(null)} className="py-4 bg-slate-100 text-slate-400 rounded-2xl font-black transition">취소</button>
                  <button onClick={handleAuthSubmit} className="py-4 text-white rounded-2xl font-black shadow-lg" style={{background: showPasswordInput === 'student' ? '#059669' : siteColor}}>입장</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Main App UI ---
  return (
    <ErrorBoundary>
      <SiteColorStyle color={siteColor} />
      {/* [FIX 2] 최상위에만 font-black 유지, 하위 요소에서 중복 제거 */}
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 select-none overflow-x-hidden font-black">
        <header className="text-white shadow-lg sticky top-0 z-40" style={{background:'var(--sc-darker)'}}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg"><Beaker className="w-7 h-7" /></div>
              <div>
                <div className="flex items-center gap-2">
                  {isEditingTitle && userRole === 'master' ? (
                    <BufferedInput value={siteTitle} onSave={saveSiteTitle} className="bg-indigo-900/50 text-white border-none text-xl font-black uppercase tracking-tight px-2 rounded outline-none" autoFocus />
                  ) : (
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => userRole === 'master' && setIsEditingTitle(true)}>
                      <h1 className="text-xl font-black uppercase tracking-tight text-white leading-none">{siteTitle}</h1>
                      {userRole === 'master' && <Edit2 size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 leading-none text-[9px]">
                  <span className={`px-2 py-0.5 rounded font-black uppercase border ${userRole === 'master' ? 'bg-rose-500 border-rose-400' : userRole === 'teacher' ? 'bg-amber-500 border-amber-400' : 'bg-emerald-500 border-emerald-400'}`}>
                    {userRole}
                  </span>
                  <p className="text-white/50 tracking-widest uppercase ml-1">v17.49 master</p>
                  {userRole === 'master' && (
                    <div className="relative ml-2">
                      <button onClick={() => setShowColorPicker(v => !v)} className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-[9px] font-black text-white leading-none">
                        <span style={{background:siteColor}} className="w-3 h-3 rounded-full border border-white/40 inline-block" />
                        색상
                      </button>
                      {showColorPicker && (
                        <div className="absolute top-7 left-0 z-[300] bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-64 animate-in zoom-in-95" onClick={e=>e.stopPropagation()}>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">추천 색상</p>
                          <div className="grid grid-cols-5 gap-2 mb-3">
                            {[['#3730a3','인디고'],['#1d4ed8','블루'],['#0f766e','틸'],['#7c3aed','바이올렛'],['#b91c1c','레드'],['#c2410c','오렌지'],['#15803d','그린'],['#1e3a5f','네이비'],['#4a1d96','퍼플'],['#374151','그레이']].map(([c,n])=>(
                              <button key={c} onClick={()=>saveSiteColor(c)} title={n}
                                className="w-9 h-9 rounded-xl border-2 transition-all hover:scale-110 active:scale-95 shadow-sm"
                                style={{background:c, borderColor: siteColor===c ? '#fff' : 'transparent', outline: siteColor===c ? '2px solid '+c : 'none'}} />
                            ))}
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">직접 입력</p>
                          <div className="flex gap-2 items-center">
                            <input type="color" value={siteColor} onChange={e=>setSiteColor(e.target.value)} className="w-10 h-10 rounded-xl border-2 border-slate-100 cursor-pointer bg-white p-0.5" />
                            <input type="text" value={siteColor} onChange={e=>{ if(/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setSiteColor(e.target.value); }}
                              className="flex-1 px-3 py-2 border-2 border-slate-100 rounded-xl font-mono text-sm font-bold text-slate-700 outline-none focus:border-slate-400" placeholder="#3730a3" />
                            <button onClick={()=>saveSiteColor(siteColor)} className="px-3 py-2 bg-slate-800 text-white rounded-xl font-black text-xs hover:bg-slate-700 transition-all">적용</button>
                          </div>
                          <button onClick={()=>setShowColorPicker(false)} className="w-full mt-3 py-2 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all">닫기</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <nav className="flex bg-white/10 p-1 rounded-xl items-center overflow-x-auto max-w-full no-scrollbar">
              {[{ id: 'matrix', l: '과제 현황', i: BarChart3 }, { id: 'memorization', l: '암기 현황', i: BrainCircuit }, { id: 'tests', l: '성적표', i: Trophy }, { id: 'attendance', l: '출결 관리', i: Calendar }, { id: 'progress', l: '진도 관리', i: TrendingUp }, { id: 'students', l: '학생 관리', i: Users, h: userRole === 'student' }, { id: 'report', l: '리포트', i: Printer, h: userRole !== 'master' }, { id: 'assignments', l: '항목 등록', i: BookOpen, h: userRole === 'student' }].filter(t => !t.h).map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-bold whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-md font-black' : 'hover:bg-white/10 text-white'}`}><tab.i size={16} />{tab.l}</button>
              ))}
              <button onClick={handleLogout} className="ml-2 p-2 hover:bg-white/20 rounded-lg text-white transition"><LogOut size={18} /></button>
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 animate-in fade-in duration-500">
          {/* 현황 매트릭스 */}
          {(activeTab === 'matrix' || activeTab === 'memorization') && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 text-left">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 leading-none"><Info size={20} /> 상태 가이드</h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-slate-700">
                  {activeTab === 'matrix' ? (
                    [{ l: '시작 전', c: 'bg-slate-50 text-slate-300', i: Circle }, { l: '진행 중', c: 'bg-slate-100 text-slate-900', i: Clock }, { l: '미완료', c: 'bg-red-50 text-red-500', i: AlertCircle }, { l: '완료', c: 'bg-blue-50 text-blue-500', i: CheckCircle2 }, { l: '지각 완료', c: 'bg-orange-50 text-orange-500', i: History }, { l: '해당 없음', c: 'bg-slate-100 text-slate-400', i: MinusCircle }].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 text-center"><div className={`p-2 rounded-xl ${item.c}`}><item.i size={20} /></div><p className="text-[11px] font-black">{item.l}</p></div>
                    ))
                  ) : (
                    MEMO_STATUS_ORDER.map(k => (
                      <div key={k} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 text-center">
                        <div className={`p-2 rounded-xl ${MEMO_STATUS_CONFIG[k].bg} ${MEMO_STATUS_CONFIG[k].color}`}>{React.createElement(MEMO_STATUS_CONFIG[k].icon, { size: 20 })}</div>
                        <p className="text-[11px] font-black">{MEMO_STATUS_CONFIG[k].label}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                  <h2 className="text-xl font-bold flex items-center gap-2">{activeTab === 'matrix' ? <ClipboardCheck /> : <BrainCircuit />} {userRole === 'student' ? '나의 실시간 학습 현황' : '전체 학습 진척도'}</h2>
                </div>
                <div className="overflow-x-auto text-slate-700">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 text-slate-400">
                      <tr>
                        <th className="p-5 font-black text-[10px] uppercase sticky left-0 bg-slate-50 z-30 w-64 border-r text-center">학생 정보</th>
                        <th className="p-5 font-black text-[10px] uppercase border-r w-28 text-center">진척도</th>
                        {(activeTab === 'matrix' ? assignments : memoItems).map((as) => (
                          <th key={as.id} className="p-5 min-w-[150px] border-b relative group text-center">
                            <div className="flex flex-col relative text-center">
                              <div className="flex justify-between items-start mb-1 text-left leading-none">
                                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter leading-none">{as.subject} | {as.level}</span>
                                {userRole === 'master' && (
                                  <div className="flex gap-1 leading-none">
                                    <button onClick={(e) => { e.stopPropagation(); setBulkSelectedDate(new Date().toISOString().split('T')[0]); setBulkSelectedStatus(null); setBulkDatePopup({ item: as, category: activeTab === 'matrix' ? 'assignment' : 'memorization' }); }} className="px-1.5 py-0.5 bg-white border rounded text-[9px] font-black text-slate-600 hover:bg-slate-50 leading-none">일괄</button>
                                    <button onClick={() => { setEditItemId(as.id); setEditItemData({ ...as }); }} className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-[9px] font-black text-indigo-600 hover:bg-indigo-100 transition-all leading-none shadow-sm">인원</button>
                                  </div>
                                )}
                              </div>
                              <span className="text-xs font-bold text-slate-700 truncate block text-center leading-tight">{as.title}</span>
                              {activeTab === 'matrix' && as.deadline && (() => {
                                const today = new Date().toISOString().split('T')[0];
                                const diff = Math.ceil((new Date(as.deadline) - new Date(today)) / (1000 * 60 * 60 * 24));
                                const isOver = diff < 0;
                                const isToday = diff === 0;
                                const isClose = diff > 0 && diff <= 3;
                                return (
                                  <span className={`mt-1.5 mx-auto flex items-center justify-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black w-fit leading-none ${isOver ? 'bg-red-100 text-red-600 border border-red-200' : isToday ? 'bg-orange-100 text-orange-600 border border-orange-200' : isClose ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                    <Calendar size={9} />
                                    {isOver ? `D+${Math.abs(diff)}` : isToday ? 'D-Day' : `D-${diff}`}
                                  </span>
                                );
                              })()}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {visibleStudentsFiltered.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group text-center">
                          <td className="p-5 font-bold text-slate-700 sticky left-0 bg-white z-20 border-r flex flex-col items-start gap-1 justify-center text-left">
                            <div className="flex items-center justify-between w-full">
                              <span className="truncate text-base font-black">{s.name}</span>
                              <button onClick={() => setSelectedStudent(s)}><Search size={14} className="text-slate-300 hover:text-indigo-600 transition-colors" /></button>
                            </div>
                            {(userRole === 'master' || userRole === 'teacher') && (
                              <div className="flex flex-wrap gap-1 mt-1 leading-none">
                                {s.homeroomTeacher && <span className="flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-bold border border-indigo-100 leading-none"><UserCircle2 size={10} /> {s.homeroomTeacher}</span>}
                                {s.highSchool && <span className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded text-[9px] font-bold border border-slate-100 leading-none"><School size={10} /> {s.highSchool}</span>}
                              </div>
                            )}
                          </td>
                          <td className="p-5 border-r text-center">
                            <div className="flex flex-col text-center">
                              <span className={`${activeTab === 'matrix' ? 'text-indigo-700' : 'text-purple-700'} text-[11px] font-black`}>{(activeTab === 'matrix' ? (stats.assign[s.id]?.label || '-') : (stats.memo[s.id]?.label || '-'))}</span>
                              <span className={`${activeTab === 'matrix' ? 'text-indigo-400' : 'text-purple-400'} text-[10px] font-black`}>{(activeTab === 'matrix' ? (stats.assign[s.id]?.percent || '0.0') : (stats.memo[s.id]?.percent || '0.0'))}%</span>
                            </div>
                          </td>
                          {(activeTab === 'matrix' ? assignments : memoItems).map(as => {
                            const subKey = `${s.id}-${as.id}`;
                            const sub = (activeTab === 'matrix' ? submissions : memoSubmissions)[subKey];
                            const status = sub?.status || 'not_started';
                            if (!(as.type === 'all' || (as.targetStudents && as.targetStudents.includes(s.id)))) return <td key={as.id} className="p-4 bg-slate-50/30 text-center font-bold text-[9px] text-slate-300 whitespace-nowrap leading-none">대상이 아닙니다.</td>;
                            const cfg = activeTab === 'matrix' ? ASSIGN_STATUS_CONFIG[status] : MEMO_STATUS_CONFIG[status];
                            const isLate = status === 'completed' && as.deadline && sub.completionDate > as.deadline;

                            return (
                              <td key={as.id} className="p-4 text-center relative">
                                <div
                                  onClick={(e) => { if (userRole === 'master') setStatusMenu({ studentId: s.id, itemId: as.id, category: activeTab === 'matrix' ? 'assignment' : 'memorization', x: e.clientX, y: e.clientY }); }}
                                  className={`w-full py-2.5 rounded-xl transition-all flex flex-col items-center justify-center ${activeTab === 'matrix' ? (isLate ? STATUS_COLORS.late_completed : STATUS_COLORS[status]) : `${cfg?.bg} ${cfg?.color}`} ${userRole === 'master' ? 'cursor-pointer hover:brightness-95 shadow-sm' : 'cursor-default'}`}
                                >
                                  {activeTab === 'matrix' ? (
                                    status === 'completed' ? (isLate ? <History size={18} /> : <CheckCircle2 size={18} />) : status === 'in_progress' ? <Clock size={18} /> : status === 'incomplete_red' ? <AlertCircle size={18} /> : status === 'exempt' ? <MinusCircle size={18} /> : <Circle size={18} />
                                  ) : (
                                    <>{cfg?.icon && React.createElement(cfg.icon, { size: 18 })}{status !== 'not_started' && <span className="text-[8px] font-black mt-0.5">{cfg?.label}</span>}</>
                                  )}
                                </div>
                                {userRole === 'master' && ((status === 'completed' && activeTab === 'matrix') || (status === 'round_4' && activeTab === 'memorization')) && (
                                  <div className="mt-1 leading-none">
                                    {inlineDateEditKey === subKey ? (
                                      <input type="date" value={sub.completionDate || ''} onChange={(e) => updateCompletionDate(s.id, as.id, e.target.value, activeTab === 'matrix' ? 'assignment' : 'memorization')} onBlur={() => setInlineDateEditKey(null)} className="text-[8px] border-none bg-indigo-50 rounded px-1 outline-none font-bold shadow-inner" autoFocus />
                                    ) : (
                                      <span onClick={(e) => { e.stopPropagation(); setInlineDateEditKey(subKey); }} className="text-[8px] font-bold text-slate-400 hover:text-indigo-600 cursor-pointer">{sub.completionDate?.split('-').slice(1).join('/') || '날짜'}</span>
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 종합 성적표 탭 */}
          {activeTab === 'tests' && (
            <div className="space-y-6">
              {userRole === 'master' && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-left text-slate-800">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-orange-600 leading-none"><Trophy size={20} /> 신규 시험 등록</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-1"><p className="text-[10px] uppercase font-black ml-1">실시 일자</p><input type="date" value={newTest.date} onChange={(e) => setNewTest({ ...newTest, date: e.target.value })} className="w-full px-4 py-3 rounded-2xl border bg-slate-50 font-bold outline-none focus:border-orange-500 transition-all text-slate-800 shadow-sm" /></div>
                    <div className="space-y-1"><p className="text-[10px] uppercase font-black ml-1 text-left">시험 명칭</p><BufferedInput value={newTest.title} onSave={(v) => setNewTest({ ...newTest, title: v })} placeholder="제목..." className="w-full px-4 py-3 rounded-2xl border bg-slate-50 font-bold outline-none shadow-sm" /></div>
                    <div className="space-y-1 text-left"><p className="text-[10px] uppercase font-black ml-1 text-left">출처</p><BufferedInput value={newTest.source} onSave={(v) => setNewTest({ ...newTest, source: v })} placeholder="출처..." className="w-full px-4 py-3 rounded-2xl border bg-slate-50 font-bold outline-none shadow-sm" /></div>
                    <div className="space-y-1"><p className="text-[10px] uppercase font-black ml-1 text-left">난이도 및 등록</p><div className="flex gap-2"><select value={newTest.difficulty} onChange={(e) => setNewTest({ ...newTest, difficulty: e.target.value })} className="flex-1 px-4 py-3 rounded-2xl border bg-slate-50 font-bold outline-none shadow-sm">{DIFFICULTIES.map(d => <option key={d}>{d}</option>)}</select><button onClick={addTest} className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-black shadow-lg hover:bg-orange-600 transition-all">등록</button></div></div>
                  </div>
                  <BufferedTextarea value={newTest.description} onSave={(v) => setNewTest({ ...newTest, description: v })} placeholder="상세 범위 및 설명..." className="w-full h-24 p-4 border rounded-2xl font-medium text-sm outline-none bg-slate-50 focus:bg-white transition-all text-slate-700 shadow-inner" />
                </div>
              )}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b font-bold text-slate-800 flex items-center gap-2 justify-center"><Calculator className="text-orange-500" /> 종합 성적표 분석</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-center border-collapse">
                    <thead className="bg-slate-50/50 text-slate-400">
                      <tr>
                        <th className="p-5 font-black text-[10px] sticky left-0 bg-slate-50 z-20 w-40 border-r text-center leading-none">이름</th>
                        <th className="p-5 font-black text-orange-600 text-[10px] border-r w-24 text-center bg-orange-50/30 leading-none">평균</th>
                        {tests.map(t => (
                          <th key={t.id} className="p-5 min-w-[200px] border-b text-left">
                            <div className="flex flex-col relative group/th text-left">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-[9px] font-black text-orange-500 uppercase">{t.date}</span>
                                <div className="flex gap-1">
                                  <button onClick={() => setSelectedTest(t)} className="p-1 hover:bg-orange-100 rounded text-orange-400 transition-colors"><Search size={14} /></button>
                                  {userRole === 'master' && <button onClick={() => deleteItem('tests', t.id)} className="p-1 hover:bg-red-50 rounded text-red-200 transition-colors"><Trash2 size={14} /></button>}
                                </div>
                              </div>
                              <span className="text-xs font-bold text-slate-700 truncate block w-40 text-left leading-tight">{t.title}</span>
                              {t.source && <div className="mt-1 flex items-center gap-1 text-indigo-400 bg-white border border-indigo-50 px-1.5 py-0.5 rounded w-fit text-[9px] font-black leading-none shadow-sm"><Bookmark size={10} />{t.source}</div>}
                              <span className="mt-1 text-[10px] font-black text-indigo-500 uppercase bg-indigo-50 px-1.5 py-0.5 rounded w-fit leading-none">AVG: {stats.testAverages[t.id]}점</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-center">
                      {visibleStudentsFiltered.map(s => (
                        <tr key={s.id} className="text-center">
                          <td className="p-5 font-bold sticky left-0 bg-white z-10 border-r text-center">{s.name}</td>
                          <td className="p-5 text-center border-r font-black text-orange-600 bg-orange-50/10 leading-none">{stats.studentTestAverages[s.id]}</td>
                          {tests.map(t => {
                            const res = testScores[`${s.id}-${t.id}`] || { score: '', plan: '' };
                            return (
                              <td key={t.id} className="p-4 text-center">
                                {userRole === 'master' ? (
                                  <div className="flex flex-col gap-2">
                                    <BufferedInput type="number" value={res.score ?? ''} onSave={(v) => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'testScores', `${s.id}-${t.id}`), { score: v === '' ? null : parseFloat(v) }, { merge: true })} className="w-full px-3 py-1.5 rounded-xl bg-slate-50 font-bold text-center text-sm focus:border-orange-500 shadow-sm transition-all" />
                                    <BufferedTextarea value={res.plan} onSave={(v) => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'testScores', `${s.id}-${t.id}`), { plan: v }, { merge: true })} className="w-full px-3 py-2 rounded-xl bg-slate-50 border-none text-[10px] h-12 resize-none font-medium shadow-inner text-center" />
                                  </div>
                                ) : (
                                  <div className="space-y-1 text-center">
                                    <div className="w-full py-1.5 bg-slate-50 rounded-xl font-black text-slate-700 text-sm text-center shadow-sm">{res.score ?? '-'}점</div>
                                    {res.plan && <div className="text-[10px] bg-indigo-50/50 p-2 rounded-xl text-indigo-700 font-medium whitespace-pre-wrap text-center leading-tight shadow-inner">{res.plan}</div>}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 출결 관리 탭 */}
          {activeTab === 'attendance' && userRole !== 'student' && (
            <div className="space-y-6 text-left">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm text-slate-800">
                <div className="flex items-center gap-2 text-emerald-600"><Calendar size={20} /> 출결 및 보충 현황 관리</div>
                <div className="flex items-center gap-3 w-full md:w-auto leading-none">
                  <input type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} className="flex-1 md:flex-none px-6 py-3 rounded-2xl border font-bold outline-none shadow-sm focus:border-indigo-500 transition-all text-slate-700" />
                  {userRole === 'master' && <button onClick={handleBulkAttendanceToggle} className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-3 rounded-2xl font-black shadow-lg hover:bg-emerald-600 transition active:scale-95 whitespace-nowrap shadow-md leading-none"><CheckCircle size={18} /> 일괄 출석</button>}
                </div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-left shadow-sm">
                {students.map(s => {
                  const att = attendance[`${s.id}-${currentDate}`] || { status: 'none', makeup: false };
                  const note = attendanceNotes[`${s.id}-${currentDate}`] || '';
                  const mDateValue = makeupDates[`${s.id}-${currentDate}`] || '';
                  return (
                    <div key={s.id} className="p-5 flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-slate-50 transition-all group">
                      <div className="flex items-center gap-4 min-w-[150px] font-bold text-lg text-slate-700 leading-none">{s.name}</div>
                      <div className="flex-1 flex flex-col md:flex-row items-center gap-4 w-full">
                        {userRole === 'master' ? (
                          <div className="relative flex-1 w-full text-left text-slate-700 shadow-sm">
                            <StickyNote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                            <BufferedInput value={note} onSave={(v) => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'attendanceNotes', `${s.id}-${currentDate}`), { note: v })} placeholder="메모 입력..." className="w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm font-medium outline-none focus:bg-white text-left" />
                          </div>
                        ) : (
                          <div className="flex-1 px-4 text-slate-400 font-medium text-sm text-left italic leading-none">{note || "특이사항 없음"}</div>
                        )}
                        <div className="flex flex-wrap items-center gap-2 leading-none">
                          {att.makeup && (
                            <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100 shadow-sm animate-in zoom-in-95">
                              <span className="text-[10px] font-black text-purple-600 uppercase tracking-tighter">보충일</span>
                              {userRole === 'master' ? (
                                <input type="date" value={mDateValue} onChange={(e) => updateMakeupDateValue(s.id, currentDate, e.target.value)} className="text-xs bg-white border-none rounded px-2 py-0.5 outline-none font-bold text-purple-700 select-text shadow-inner" />
                              ) : (
                                <span className="text-xs font-bold text-purple-700">{mDateValue || "-"}</span>
                              )}
                            </div>
                          )}
                          <div className="flex gap-1.5 leading-none">
                            {/* [FIX 4] absent 버튼 라벨 오타 수정: l 값을 '결석'으로 통일 */}
                            {[{ id: 'present', l: '출석', c: 'emerald' }, { id: 'late', l: '지각', c: 'amber' }, { id: 'absent', l: '결석', c: 'rose' }].map(opt => (
                              <button key={opt.id} onClick={() => updateAttendance(s.id, opt.id)} disabled={userRole !== 'master'} className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all shadow-sm leading-none ${att.status === opt.id ? `bg-${opt.c}-500 border-${opt.c}-500 text-white shadow-lg` : 'bg-white border-slate-100 text-slate-400'}`}>{opt.l}</button>
                            ))}
                            <button onClick={() => updateAttendance(s.id, 'makeup')} disabled={userRole !== 'master'} className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all shadow-sm leading-none ${att.makeup ? 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-100' : 'bg-white border-slate-100 text-slate-400'} ${userRole === 'master' ? 'hover:border-slate-300' : 'cursor-default'}`}>보충</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 출결 관리 탭 - student 전용 */}
          {activeTab === 'attendance' && userRole === 'student' && (() => {
            const s = students.find(st => st.id === myStudentId);
            if (!s) return null;
            const allDates = Object.keys(attendance)
              .filter(k => k.startsWith(`${s.id}-`))
              .map(k => k.replace(`${s.id}-`, ''))
              .sort((a, b) => b.localeCompare(a));
            const STATUS_LABEL = {
              present: { l: '출석', c: 'emerald' },
              late:    { l: '지각', c: 'amber' },
              absent:  { l: '결석', c: 'rose' },
              none:    { l: '-',    c: 'slate' }
            };
            return (
              <div className="space-y-6 text-left max-w-lg mx-auto">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-slate-800 flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600"><Calendar size={22} /></div>
                  <div>
                    <p className="font-black text-slate-800 text-base leading-none">{s.name}의 출결 기록</p>
                    <p className="text-xs text-slate-400 font-medium mt-1.5 leading-none">총 {allDates.length}건</p>
                  </div>
                </div>
                {allDates.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 font-bold shadow-sm">출결 기록이 없습니다.</div>
                ) : (
                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-sm">
                    {allDates.map(date => {
                      const att = attendance[`${s.id}-${date}`] || { status: 'none', makeup: false };
                      const note = attendanceNotes[`${s.id}-${date}`] || '';
                      const mDateValue = makeupDates[`${s.id}-${date}`] || '';
                      const cfg = STATUS_LABEL[att.status] || STATUS_LABEL.none;
                      return (
                        <div key={date} className="p-5 flex items-center gap-4">
                          <span className="font-black text-slate-700 text-sm w-28 shrink-0">{date}</span>
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-black bg-${cfg.c}-50 text-${cfg.c}-600 border border-${cfg.c}-100 leading-none`}>{cfg.l}</span>
                          {att.makeup && (
                            <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100 leading-none">
                              <span className="text-[10px] font-black text-purple-600 leading-none">보충</span>
                              {mDateValue && <span className="text-xs font-bold text-purple-700 leading-none">{mDateValue}</span>}
                            </div>
                          )}
                          {note && <span className="flex-1 text-xs text-slate-400 font-medium italic text-right truncate">{note}</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* 진도 관리 탭 - student 전용 */}
          {activeTab === 'progress' && userRole === 'student' && (() => {
            const totalPlans = progressPlans.length;
            const donePlans = progressPlans.filter(p => p.done).length;
            const overallPct = totalPlans > 0 ? Math.round((donePlans / totalPlans) * 100) : 0;
            const subjectStats = SUBJECTS.reduce((acc, sub) => {
              const all = progressPlans.filter(p => p.subject === sub);
              const done = all.filter(p => p.done).length;
              if (all.length > 0) acc[sub] = { total: all.length, done };
              return acc;
            }, {});
            const plansByDate = progressPlans.reduce((acc, p) => {
              if (!acc[p.date]) acc[p.date] = [];
              acc[p.date].push(p);
              return acc;
            }, {});
            const sortedDates = Object.keys(plansByDate).sort((a,b) => b.localeCompare(a));
            return (
              <div className="max-w-2xl mx-auto space-y-6 text-left">
                {/* 진도율 요약 */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 leading-none"><TrendingUp size={18} className="text-teal-600" /> 전체 진도율</h3>
                    <span className="text-2xl font-black text-teal-600 leading-none">{overallPct}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: overallPct + '%' }} />
                  </div>
                  {Object.keys(subjectStats).length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(subjectStats).map(([sub, st]) => {
                        const pct = Math.round((st.done / st.total) * 100);
                        return (
                          <div key={sub} className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[11px] font-black text-slate-600">{sub}</span>
                              <span className="text-[11px] font-black text-teal-600">{pct}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-teal-400 rounded-full transition-all" style={{ width: pct + '%' }} />
                            </div>
                            <p className="text-[9px] text-slate-400 font-bold mt-1 leading-none">{st.done}/{st.total} 완료</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {/* 날짜별 리스트 (읽기 전용) */}
                {sortedDates.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 font-bold shadow-sm">등록된 진도 계획이 없습니다.</div>
                ) : sortedDates.map(date => (
                  <div key={date} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-3 bg-teal-50 border-b border-teal-100 flex items-center gap-2">
                      <Calendar size={14} className="text-teal-500" />
                      <span className="text-sm font-black text-teal-700">{date}</span>
                      <span className="ml-auto text-[10px] font-black text-teal-400">
                        {plansByDate[date].filter(p=>p.done).length}/{plansByDate[date].length} 완료
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {plansByDate[date].map(plan => (
                        <div key={plan.id} className="px-6 py-3 flex items-center gap-3">
                          <div className={`shrink-0 w-5 h-5 rounded-lg border-2 flex items-center justify-center ${plan.done ? 'bg-teal-500 border-teal-500' : 'border-slate-300 bg-white'}`}>
                            {plan.done && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <span className={`px-2 py-0.5 rounded-lg text-[11px] font-black border shrink-0 leading-none ${plan.done ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-teal-50 text-teal-700 border-teal-100'}`}>{plan.subject}</span>
                          <div className="flex-1 min-w-0">
                            <span className={`font-black text-sm leading-none ${plan.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{plan.unit}</span>
                            {plan.memo && <p className="text-xs text-slate-400 font-medium italic mt-0.5 leading-none">{plan.memo}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* 학생 관리 탭 */}
          {activeTab === 'students' && userRole !== 'student' && (
            <div className="max-w-4xl mx-auto space-y-6 text-left">
              {userRole === 'master' && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-left text-slate-800">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-600 tracking-tight leading-none"><UserPlus size={22} /> 학생 일괄 등록</h2>
                  <BufferedTextarea value={bulkStudentInput} onSave={setBulkStudentInput} placeholder="이름을 입력하세요..." className="w-full h-32 px-4 py-4 rounded-2xl border bg-slate-50 font-bold resize-none mb-4 outline-none transition-all focus:bg-white text-slate-800 shadow-inner" />
                  <button onClick={() => {
                    if (!bulkStudentInput.trim()) return;
                    const names = bulkStudentInput.split(/[,\n]/).map(n => n.trim()).filter(Boolean);
                    const batch = writeBatch(db);
                    names.forEach(name => {
                      // [FIX 6] ID 충돌 가능성 개선: crypto.randomUUID() 사용
                      const id = 's' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : Date.now() + Math.random().toString(36).substr(2, 9));
                      batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'students', id), { name, studentCode: '', homeroomTeacher: '', highSchool: '' });
                    });
                    batch.commit().then(() => setBulkStudentInput(''));
                  }} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all leading-none">등록하기</button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {students.map(s => (
                  <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group transition-all text-left leading-none">
                    {editStudentId === s.id ? (
                      <div className="space-y-4 animate-in slide-in-from-top-2 text-left leading-none">
                        <div className="grid grid-cols-2 gap-3 text-left leading-none">
                          <div className="space-y-1 text-left leading-none"><label className="text-[10px] text-slate-400 font-black leading-none">이름</label><input value={editStudentData.name} onChange={(e) => setEditStudentData({ ...editStudentData, name: e.target.value })} className="w-full px-3 py-2 border rounded-xl font-bold text-sm bg-slate-50 text-slate-800 outline-none shadow-sm focus:border-indigo-500 leading-none" /></div>
                          <div className="space-y-1 text-left leading-none"><label className="text-[10px] text-slate-400 font-black leading-none">코드</label><input value={editStudentData.studentCode} onChange={(e) => setEditStudentData({ ...editStudentData, studentCode: e.target.value })} className="w-full px-3 py-2 border rounded-xl font-bold text-sm bg-slate-50 text-slate-800 outline-none shadow-sm focus:border-indigo-500 leading-none" /></div>
                          <div className="space-y-1 text-left leading-none"><label className="text-[10px] text-slate-400 font-black leading-none">담임</label><input value={editStudentData.homeroomTeacher} onChange={(e) => setEditStudentData({ ...editStudentData, homeroomTeacher: e.target.value })} className="w-full px-3 py-2 border rounded-xl font-bold text-sm bg-slate-50 text-slate-800 outline-none shadow-sm focus:border-indigo-500 leading-none" /></div>
                          <div className="space-y-1 text-left leading-none"><label className="text-[10px] text-slate-400 font-black leading-none">고교</label><input value={editStudentData.highSchool} onChange={(e) => setEditStudentData({ ...editStudentData, highSchool: e.target.value })} className="w-full px-3 py-2 border rounded-xl font-bold text-sm bg-slate-50 text-slate-800 outline-none shadow-sm focus:border-indigo-500 leading-none" /></div>
                        </div>
                        <div className="flex gap-2 pt-2 leading-none"><button onClick={saveStudentDetails} className="flex-1 py-2 bg-green-600 text-white rounded-xl font-black text-xs shadow-md transition-all hover:bg-green-700 leading-none">저장</button><button onClick={() => setEditStudentId(null)} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs transition-all leading-none">취소</button></div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start text-left text-slate-700 font-bold">
                        <div className="space-y-3 flex-1 text-left leading-none">
                          <div className="flex items-center gap-2 text-left leading-none"><span className="font-bold text-xl text-slate-800 leading-none">#{s.studentCode || '000'} {s.name}</span></div>
                          <div className="grid grid-cols-2 gap-2 text-slate-500 text-left font-bold leading-none">
                            <div className="flex items-center gap-1.5 text-left leading-none"><UserCog size={14} /><span className="text-xs leading-none">{s.homeroomTeacher || "-"}</span></div>
                            <div className="flex items-center gap-1.5 text-left leading-none"><GraduationCap size={14} /><span className="text-xs leading-none">{s.highSchool || "-"}</span></div>
                          </div>
                        </div>
                        {userRole === 'master' && (
                          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 leading-none">
                            <button onClick={() => { setEditStudentId(s.id); setEditStudentData({ name: s.name, studentCode: s.studentCode || '', homeroomTeacher: s.homeroomTeacher || '', highSchool: s.highSchool || '' }); }} className="p-2 text-indigo-500 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all shadow-sm leading-none"><Edit2 size={18} /></button>
                            <button onClick={() => deleteItem('students', s.id)} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all shadow-sm leading-none"><Trash2 size={18} /></button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 진도 관리 탭 */}
          {/* 진도 관리 탭 */}
          {activeTab === 'progress' && userRole !== 'student' && (() => {  /* master/teacher */
            const kstToday = new Date(Date.now() + 9*60*60*1000).toISOString().split('T')[0];
            const [calYear, calMonthIdx] = progressCalMonth.split('-').map(Number);
            const firstDay = new Date(calYear, calMonthIdx - 1, 1).getDay();
            const daysInMonth = new Date(calYear, calMonthIdx, 0).getDate();

            const plansByDate = progressPlans.reduce((acc, p) => {
              if (!acc[p.date]) acc[p.date] = [];
              acc[p.date].push(p);
              return acc;
            }, {});

            const totalPlans = progressPlans.length;
            const donePlans = progressPlans.filter(p => p.done).length;
            const overallPct = totalPlans > 0 ? Math.round((donePlans / totalPlans) * 100) : 0;

            const subjectStats = SUBJECTS.reduce((acc, sub) => {
              const all = progressPlans.filter(p => p.subject === sub);
              const done = all.filter(p => p.done).length;
              if (all.length > 0) acc[sub] = { total: all.length, done };
              return acc;
            }, {});

            const prevMonth = () => {
              const d = new Date(calYear, calMonthIdx - 2, 1);
              setProgressCalMonth(d.toISOString().slice(0, 7));
            };
            const nextMonth = () => {
              const d = new Date(calYear, calMonthIdx, 1);
              setProgressCalMonth(d.toISOString().slice(0, 7));
            };

            const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];

            return (
              <div className="max-w-4xl mx-auto space-y-6 text-left">

                {/* 진도율 요약 */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 leading-none"><TrendingUp size={18} className="text-teal-600" /> 전체 진도율</h3>
                    <span className="text-2xl font-black text-teal-600 leading-none">{overallPct}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: overallPct + '%' }} />
                  </div>
                  {Object.keys(subjectStats).length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(subjectStats).map(([sub, st]) => {
                        const pct = Math.round((st.done / st.total) * 100);
                        return (
                          <div key={sub} className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[11px] font-black text-slate-600">{sub}</span>
                              <span className="text-[11px] font-black text-teal-600">{pct}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-teal-400 rounded-full transition-all" style={{ width: pct + '%' }} />
                            </div>
                            <p className="text-[9px] text-slate-400 font-bold mt-1 leading-none">{st.done}/{st.total} 완료</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 달력 */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500 font-black">&#8249;</button>
                    <span className="font-black text-slate-800 text-base">{calYear}년 {calMonthIdx}월</span>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500 font-black">&#8250;</button>
                  </div>
                  <div className="grid grid-cols-7 border-b border-slate-100">
                    {dayLabels.map((d, i) => (
                      <div key={d} className={`py-2 text-center text-[11px] font-black ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'}`}>{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={'e' + i} className="border-b border-r border-slate-50 min-h-[64px]" />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = `${calYear}-${String(calMonthIdx).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                      const dayPlans = plansByDate[dateStr] || [];
                      const isSelected = progressSelectedDate === dateStr;
                      const isToday = kstToday === dateStr;
                      const colIdx = (firstDay + i) % 7;
                      return (
                        <div
                          key={dateStr}
                          onClick={() => setProgressSelectedDate(dateStr)}
                          className={`border-b border-r border-slate-50 min-h-[64px] p-1.5 cursor-pointer transition-all hover:bg-teal-50/50 ${isSelected ? 'bg-teal-50 border-teal-200' : ''}`}
                        >
                          <div className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-teal-600 text-white' : isSelected ? 'text-teal-600' : colIdx === 0 ? 'text-red-400' : colIdx === 6 ? 'text-blue-400' : 'text-slate-600'}`}>{day}</div>
                          {dayPlans.length > 0 && (
                            <div className="space-y-0.5">
                              {dayPlans.slice(0, 2).map(p => (
                                <div key={p.id} className={`text-[9px] font-black px-1 py-0.5 rounded leading-none truncate ${p.done ? 'bg-teal-100 text-teal-700 line-through opacity-60' : 'bg-indigo-50 text-indigo-600'}`}>{p.subject} {p.unit}</div>
                              ))}
                              {dayPlans.length > 2 && <div className="text-[9px] text-slate-400 font-bold px-1">+{dayPlans.length - 2}</div>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 선택된 날짜 패널 */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-teal-500" />
                      <span className="font-black text-slate-800">{progressSelectedDate}</span>
                      {(plansByDate[progressSelectedDate] || []).length > 0 && (
                        <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100 leading-none">
                          {(plansByDate[progressSelectedDate] || []).filter(p=>p.done).length}/{(plansByDate[progressSelectedDate] || []).length} 완료
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 계획 등록 폼 (master only) */}
                  {userRole === 'master' && (
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">새 계획 추가</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {SUBJECTS.map(sub => (
                          <button key={sub} onClick={() => setNewPlan({ ...newPlan, subject: sub })}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border-2 transition-all ${newPlan.subject === sub ? 'bg-teal-600 border-teal-600 text-white shadow-sm' : 'border-slate-200 text-slate-400 bg-white hover:border-slate-300'}`}>{sub}</button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <BufferedInput value={newPlan.unit} onSave={(v) => setNewPlan({ ...newPlan, unit: v })}
                          placeholder="단원 / 내용 입력..." className="flex-1 px-4 py-2.5 rounded-2xl border bg-white font-bold text-sm outline-none focus:border-teal-400 transition-all text-slate-800 shadow-sm" />
                        <BufferedInput value={newPlan.memo} onSave={(v) => setNewPlan({ ...newPlan, memo: v })}
                          placeholder="메모 (선택)" className="flex-1 px-4 py-2.5 rounded-2xl border bg-white font-medium text-sm outline-none focus:border-teal-400 transition-all text-slate-700 shadow-sm" />
                        <button onClick={addPlan} className="px-5 py-2.5 bg-teal-600 text-white rounded-2xl font-black text-sm shadow-md hover:bg-teal-700 transition-all active:scale-95 whitespace-nowrap leading-none">추가</button>
                      </div>
                    </div>
                  )}

                  {/* 해당 날짜 계획 리스트 */}
                  <div className="divide-y divide-slate-100">
                    {(plansByDate[progressSelectedDate] || []).length === 0 ? (
                      <div className="p-8 text-center text-slate-400 font-bold text-sm">이 날의 수업 계획이 없습니다.</div>
                    ) : (
                      (plansByDate[progressSelectedDate] || []).map(plan => (
                        <div key={plan.id} className="px-6 py-4 group hover:bg-slate-50 transition-all">
                          {editPlanId === plan.id ? (
                            <div className="space-y-3 animate-in slide-in-from-top-2">
                              <div className="flex flex-wrap gap-1.5">
                                {SUBJECTS.map(sub => (
                                  <button key={sub} onClick={() => setEditPlanData({ ...editPlanData, subject: sub })}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border-2 transition-all ${editPlanData.subject === sub ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-200 text-slate-400 bg-white hover:border-slate-300'}`}>{sub}</button>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <BufferedInput value={editPlanData.unit} onSave={(v) => setEditPlanData({ ...editPlanData, unit: v })}
                                  placeholder="단원 / 내용" className="flex-1 px-3 py-2 border rounded-xl font-bold text-sm bg-slate-50 outline-none focus:border-teal-400 text-slate-800 shadow-sm" />
                                <BufferedInput value={editPlanData.memo} onSave={(v) => setEditPlanData({ ...editPlanData, memo: v })}
                                  placeholder="메모" className="flex-1 px-3 py-2 border rounded-xl font-medium text-sm bg-slate-50 outline-none focus:border-teal-400 text-slate-700 shadow-sm" />
                              </div>
                              <div className="flex gap-2">
                                <button onClick={saveEditPlan} className="flex-1 py-2 bg-green-600 text-white rounded-xl font-black text-sm flex items-center justify-center gap-1.5 shadow-md hover:bg-green-700 transition-all"><Save size={13} /> 저장</button>
                                <button onClick={() => { setEditPlanId(null); setEditPlanData(null); }} className="px-5 py-2 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm">취소</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              {/* 체크박스 */}
                              <button onClick={() => togglePlanDone(plan)}
                                disabled={userRole !== 'master'}
                                className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${plan.done ? 'bg-teal-500 border-teal-500' : 'border-slate-300 hover:border-teal-400 bg-white'} ${userRole !== 'master' ? 'cursor-default' : 'cursor-pointer'}`}>
                                {plan.done && <CheckCircle2 size={14} className="text-white" />}
                              </button>
                              <span className={`px-2 py-0.5 rounded-lg text-[11px] font-black border shrink-0 leading-none ${plan.done ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-teal-50 text-teal-700 border-teal-100'}`}>{plan.subject}</span>
                              <div className="flex-1 min-w-0">
                                <span className={`font-black text-sm leading-none ${plan.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{plan.unit}</span>
                                {plan.memo && <p className="text-xs text-slate-400 font-medium italic mt-0.5 leading-none">{plan.memo}</p>}
                              </div>
                              {userRole === 'master' && (
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                  <button onClick={() => { setEditPlanId(plan.id); setEditPlanData({ ...plan }); }} className="p-1.5 text-indigo-500 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"><Edit2 size={13} /></button>
                                  <button onClick={() => deletePlan(plan.id)} className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all"><Trash2 size={13} /></button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            );
          })()}

          
                    {/* 항목 등록 탭 */}
          {/* 리포트 탭 */}
          {activeTab === 'report' && userRole === 'master' && (
            <div className="max-w-4xl mx-auto space-y-6 text-left">

              {/* 날짜 범위 + 생성 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2 leading-none" style={{color:'var(--sc)'}}>
                  <Printer size={20} /> 학습 종합 리포트 생성
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">시작 날짜</p>
                    <input type="date" value={reportRange.from} onChange={e => setReportRange(r => ({...r, from: e.target.value}))}
                      className="w-full px-4 py-3 rounded-2xl border bg-slate-50 font-bold outline-none focus:border-slate-400 transition-all text-slate-800 shadow-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">종료 날짜</p>
                    <input type="date" value={reportRange.to} onChange={e => setReportRange(r => ({...r, to: e.target.value}))}
                      className="w-full px-4 py-3 rounded-2xl border bg-slate-50 font-bold outline-none focus:border-slate-400 transition-all text-slate-800 shadow-sm" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mb-4 leading-none">※ 날짜를 비워두면 전체 기간 데이터를 포함합니다</p>
                <button onClick={generateReport}
                  className="w-full py-4 text-white rounded-2xl font-black text-base shadow-lg transition-all active:scale-95 leading-none flex items-center justify-center gap-2"
                  style={{background:'var(--sc)'}}>
                  <Printer size={18} /> 리포트 생성
                </button>
              </div>

              {/* 생성된 리포트 */}
              {reportGenerated && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <p className="font-black text-slate-800 flex items-center gap-2 leading-none"><FileText size={16} /> 리포트 출력</p>
                    <button onClick={() => { navigator.clipboard?.writeText(reportText); }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all">
                      <Copy size={13} /> 복사
                    </button>
                  </div>
                  <pre className="p-6 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed bg-slate-50 max-h-96 overflow-y-auto select-text">{reportText}</pre>
                </div>
              )}

              {/* AI 분석 */}
              {reportGenerated && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <p className="font-black text-slate-800 flex items-center gap-2 leading-none"><Bot size={16} className="text-violet-500" /> AI 학습 분석</p>
                    {aiAnalysis && (
                      <button onClick={requestAiAnalysis} disabled={aiLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl font-bold text-xs transition-all">
                        <RefreshCw size={12} className={aiLoading ? 'animate-spin' : ''} /> 재분석
                      </button>
                    )}
                  </div>
                  {!aiAnalysis && !aiLoading && (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4" style={{background:'var(--sc-faint)'}}>
                        <Sparkles size={28} style={{color:'var(--sc)'}} />
                      </div>
                      <p className="text-slate-600 font-bold mb-2">AI가 리포트를 분석하고 개선점을 제안합니다</p>
                      <p className="text-slate-400 text-sm font-medium mb-6">과제·암기·성적·출결·진도 데이터를 종합적으로 분석합니다</p>
                      <button onClick={requestAiAnalysis}
                        className="px-8 py-4 text-white rounded-2xl font-black shadow-lg transition-all active:scale-95 flex items-center gap-2 mx-auto"
                        style={{background:'var(--sc)'}}>
                        <Sparkles size={18} /> AI 분석 요청
                      </button>
                    </div>
                  )}
                  {aiLoading && (
                    <div className="p-12 text-center">
                      <div className="flex items-center justify-center gap-3 text-slate-500 font-bold">
                        <Loader2 size={22} className="animate-spin" style={{color:'var(--sc)'}} />
                        <span>AI가 데이터를 분석하고 있습니다...</span>
                      </div>
                    </div>
                  )}
                  {aiAnalysis && !aiLoading && (
                    <div className="p-6">
                      <div className="prose prose-sm max-w-none text-slate-700 font-medium leading-relaxed whitespace-pre-wrap text-sm select-text">{aiAnalysis}</div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

                    {activeTab === 'assignments' && userRole !== 'student' && (
            <div className="max-w-4xl mx-auto space-y-6 text-left">
              {userRole === 'master' && (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-left leading-none">
                  <div className="flex justify-between items-center mb-8 text-left leading-none">
                    <h2 className="text-xl font-bold text-slate-800 leading-none">신규 항목 발행</h2>
                    <div className="flex bg-slate-100 p-1 rounded-xl leading-none">
                      <button onClick={() => setRegCategory('assignment')} className={`px-4 py-2 rounded-lg text-xs font-bold transition leading-none ${regCategory === 'assignment' ? 'bg-white text-indigo-800 shadow-sm font-black' : 'text-slate-400'}`}>과제(숙제)</button>
                      <button onClick={() => setRegCategory('memorization')} className={`px-4 py-2 rounded-lg text-xs font-bold transition leading-none ${regCategory === 'memorization' ? 'bg-white text-purple-800 shadow-sm font-black' : 'text-slate-400'}`}>암기(테스트)</button>
                    </div>
                  </div>
                  <div className="space-y-8 text-left text-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                      <div className="text-left leading-none"><p className="text-[10px] font-black text-slate-400 mb-3 uppercase flex items-center gap-1 text-left leading-none"><Tag size={12} /> 1. 과목</p><div className="flex flex-wrap gap-2">{SUBJECTS.map(sub => (<button key={sub} onClick={() => setNewAssignment({ ...newAssignment, subject: sub })} className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition leading-none ${newAssignment.subject === sub ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>{sub}</button>))}</div></div>
                      <div className="text-left leading-none"><p className="text-[10px] font-black text-slate-400 mb-3 uppercase flex items-center gap-1 text-left leading-none"><TrendingUp size={12} /> 2. 수준</p><div className="flex flex-wrap gap-2">{ASSIGNMENT_LEVELS.map(lvl => (<button key={lvl} onClick={() => setNewAssignment({ ...newAssignment, level: lvl })} className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition leading-none ${newAssignment.level === lvl ? 'bg-indigo-700 border-indigo-700 text-white shadow-md' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>{lvl}</button>))}</div></div>
                      <div className="text-left leading-none">
                        <p className="text-[10px] font-black text-slate-400 mb-3 uppercase flex items-center gap-1 text-left leading-none"><UserCheck size={12} /> 3. 대상</p>
                        <div className="flex gap-2 mb-3 leading-none">
                          <button onClick={() => setNewAssignment({ ...newAssignment, type: 'all', targetStudents: [] })} className={`flex-1 py-1.5 rounded-xl text-xs font-bold border-2 leading-none ${newAssignment.type === 'all' ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-100 text-slate-400'}`}>전체</button>
                          <button onClick={() => setNewAssignment({ ...newAssignment, type: 'individual' })} className={`flex-1 py-1.5 rounded-xl text-xs font-black border-2 leading-none ${newAssignment.type === 'individual' ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-100 text-slate-400'}`}>개별</button>
                        </div>
                        {newAssignment.type === 'individual' && (
                          <div className="p-3 bg-slate-50 rounded-2xl border max-h-[100px] overflow-y-auto text-left no-scrollbar shadow-inner leading-none">
                            {students.map(s => (
                              <label key={s.id} className="flex items-center gap-1 text-[11px] font-bold text-slate-500 cursor-pointer hover:text-indigo-600 text-left leading-none">
                                <input type="checkbox" checked={newAssignment.targetStudents.includes(s.id)} onChange={(e) => { const cur = [...newAssignment.targetStudents]; if (e.target.checked) cur.push(s.id); else cur.splice(cur.indexOf(s.id), 1); setNewAssignment({ ...newAssignment, targetStudents: cur }); }} />{s.name}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                      <div className="text-left leading-none"><p className="text-[10px] font-black text-slate-400 mb-3 uppercase flex items-center gap-1 text-left leading-none"><FileText size={12} /> 4. 명칭</p><BufferedInput value={newAssignment.title} onSave={(v) => setNewAssignment({ ...newAssignment, title: v })} placeholder="제목..." className="w-full px-4 py-3 rounded-2xl border bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-indigo-100 text-slate-800 shadow-sm transition-all leading-none" /></div>
                      <div className="text-left leading-none"><p className="text-[10px] font-black text-slate-400 mb-3 uppercase flex items-center gap-1 text-left leading-none"><Calendar size={12} /> 5. 마감기한</p><input type="date" value={newAssignment.deadline} onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })} className="w-full px-4 py-3 rounded-2xl border bg-slate-50 font-bold outline-none focus:border-indigo-500 text-slate-800 shadow-sm transition-all leading-none" /></div>
                    </div>
                    <button onClick={addAssignment} className={`w-full ${regCategory === 'assignment' ? 'bg-indigo-600 shadow-indigo-100' : 'bg-purple-600 shadow-purple-100'} text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.01] transition-all shadow-md leading-none`}>발행하기</button>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {(regCategory === 'assignment' ? assignments : memoItems).map(a => (
                  <div key={a.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm group transition-all text-left hover:shadow-md">
                    {editItemId === a.id ? (
                      <div className="space-y-5 animate-in slide-in-from-top-2 text-left">
                        {/* 1행: 과목 / 수준 / 정보 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left text-slate-700">
                          <div className="space-y-2 text-left">
                            <p className="text-[10px] uppercase font-black tracking-tighter text-slate-400">과목 수정</p>
                            <div className="flex flex-wrap gap-1">
                              {SUBJECTS.map(s => (
                                <button key={s} onClick={() => setEditItemData({ ...editItemData, subject: s })} className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-all ${editItemData.subject === s ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-slate-50 text-slate-400 hover:border-slate-300'}`}>{s}</button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2 text-left">
                            <p className="text-[10px] uppercase font-black tracking-tighter text-slate-400">수준 수정</p>
                            <div className="flex flex-wrap gap-1">
                              {ASSIGNMENT_LEVELS.map(lvl => (
                                <button key={lvl} onClick={() => setEditItemData({ ...editItemData, level: lvl })} className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-all ${editItemData.level === lvl ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-slate-50 text-slate-400 hover:border-slate-300'}`}>{lvl}</button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2 text-left">
                            <p className="text-[10px] uppercase tracking-tighter font-black text-slate-400">정보 수정</p>
                            <BufferedInput value={editItemData.title} onSave={(v) => setEditItemData({ ...editItemData, title: v })} className="w-full px-2 py-1.5 border rounded-lg text-xs font-bold mb-2 focus:border-indigo-500 text-slate-800 shadow-sm" />
                            <input type="date" value={editItemData.deadline || ''} onChange={(e) => setEditItemData({ ...editItemData, deadline: e.target.value })} className="w-full px-2 py-1.5 border rounded-lg text-xs font-bold text-slate-800 shadow-sm" />
                          </div>
                        </div>
                        {/* 2행: 대상 수정 (전체/개별 + 개별일 때 학생 목록) */}
                        <div className="space-y-2 text-left">
                          <p className="text-[10px] uppercase font-black tracking-tighter text-slate-400 flex items-center gap-1"><UserCheck size={11} /> 대상 수정</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditItemData({ ...editItemData, type: 'all', targetStudents: [] })}
                              className={`px-4 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${editItemData.type === 'all' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300'}`}
                            >
                              전체 학생
                            </button>
                            <button
                              onClick={() => setEditItemData({ ...editItemData, type: 'individual', targetStudents: editItemData.targetStudents || [] })}
                              className={`px-4 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${editItemData.type === 'individual' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300'}`}
                            >
                              개별 지정
                            </button>
                            {editItemData.type === 'individual' && (
                              <span className="ml-auto text-[11px] font-black text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 flex items-center gap-1">
                                <Users size={12} /> {(editItemData.targetStudents || []).length}명 선택됨
                              </span>
                            )}
                          </div>
                          {editItemData.type === 'individual' && (
                            <div className="mt-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">학생 선택</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditItemData({ ...editItemData, targetStudents: students.map(s => s.id) })}
                                    className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-[9px] font-black hover:bg-indigo-200 transition-all"
                                  >
                                    전체 선택
                                  </button>
                                  <button
                                    onClick={() => setEditItemData({ ...editItemData, targetStudents: [] })}
                                    className="px-2 py-1 bg-slate-200 text-slate-500 rounded-lg text-[9px] font-black hover:bg-slate-300 transition-all"
                                  >
                                    전체 해제
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {students.map(s => {
                                  const isChecked = (editItemData.targetStudents || []).includes(s.id);
                                  return (
                                    <label
                                      key={s.id}
                                      className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer border-2 transition-all text-xs font-bold select-none ${isChecked ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}
                                    >
                                      <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          const cur = [...(editItemData.targetStudents || [])];
                                          if (e.target.checked) cur.push(s.id);
                                          else cur.splice(cur.indexOf(s.id), 1);
                                          setEditItemData({ ...editItemData, targetStudents: cur });
                                        }}
                                      />
                                      <UserCheck size={11} className={isChecked ? 'text-white' : 'text-slate-300'} />
                                      {s.name}
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={saveEditItem} className="flex-1 py-2 bg-green-600 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-green-700 transition-all"><Save size={16} /> 저장</button>
                          <button onClick={() => { setEditItemId(null); setEditItemData(null); }} className="px-6 py-2 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm transition-all">취소</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-left text-slate-700 shadow-sm p-1 rounded-xl">
                        <div className="flex flex-col gap-1 text-left">
                          <div className="flex items-center gap-2 text-left leading-none">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${regCategory === 'assignment' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>{a.subject}</span>
                            <span className="text-[9px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 leading-none">{a.level}</span>
                            {a.type === 'individual' && (
                              <div className="relative group/individual">
                                <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[9px] font-black cursor-help flex items-center gap-1 shadow-sm leading-none"><UserCheck size={10} /> 개별 ({a.targetStudents?.length || 0}명)</span>
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover/individual:block z-50 animate-in fade-in zoom-in-95 pointer-events-none shadow-2xl">
                                  <div className="bg-slate-900 text-white text-[10px] px-3 py-2 rounded-xl shadow-2xl min-w-[120px]">
                                    <p className="text-amber-400 border-b border-white/10 pb-1 mb-1 text-[8px] uppercase font-black tracking-widest leading-none">대상 명단</p>
                                    {/* [FIX 1] getTargetStudentNamesLocal에 students 인수 전달 */}
                                    {getTargetStudentNamesLocal(students, a.targetStudents)}
                                  </div>
                                  <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 ml-3" />
                                </div>
                              </div>
                            )}
                          </div>
                          <span className="font-black text-slate-800 text-lg leading-tight text-left mt-0.5 leading-none">{a.title}</span>
                          {a.deadline && <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 tracking-tighter italic text-left leading-none">{a.deadline} 마감</span>}
                        </div>
                        {userRole === 'master' && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <button onClick={() => { setEditItemId(a.id); setEditItemData({ ...a }); }} className="p-2.5 text-indigo-500 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all shadow-sm"><Edit2 size={18} /></button>
                            <button onClick={() => deleteItem(regCategory === 'assignment' ? 'assignments' : 'memoItems', a.id)} className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all shadow-sm"><Trash2 size={18} /></button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* --- Detail Modals --- */}
        {selectedTest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in shadow-2xl">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="bg-orange-600 p-8 text-white flex justify-between items-start shadow-inner leading-none">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-14 h-14 bg-white/20 rounded-3xl flex items-center justify-center shadow-inner">{isTestEditMode ? <Edit2 size={32} /> : <FileSearch size={32} />}</div>
                  <div className="text-left">
                    <h2 className="text-2xl font-black text-white leading-none">{isTestEditMode ? "시험 정보 수정" : `${selectedTest.title} 상세`}</h2>
                    <p className="text-orange-100 text-xs font-medium uppercase tracking-widest leading-none mt-2">{selectedTest.date} | {selectedTest.source}</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedTest(null); setIsTestEditMode(false); }} className="p-1 hover:bg-white/10 rounded-full transition-all text-white"><LucideX size={24} /></button>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto text-left shadow-inner">
                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 shadow-inner text-left font-bold">
                  {isTestEditMode ? (
                    <div className="space-y-4">
                      <input type="date" value={selectedTest.date} onChange={(e) => setSelectedTest({ ...selectedTest, date: e.target.value })} className="w-full px-4 py-3 border-2 border-slate-100 rounded-2xl font-bold bg-white focus:border-indigo-500 outline-none" />
                      <BufferedInput value={selectedTest.title} onSave={(v) => setSelectedTest({ ...selectedTest, title: v })} className="w-full px-4 py-3 border-2 border-slate-100 rounded-2xl font-bold bg-white" />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">출처</p>
                        <BufferedInput value={selectedTest.source} onSave={(v) => setSelectedTest({ ...selectedTest, source: v })} placeholder="출처 입력..." className="w-full px-4 py-3 border-2 border-slate-100 rounded-2xl font-bold bg-white focus:border-indigo-500 outline-none" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">난이도</p>
                        <div className="flex flex-wrap gap-2">
                          {DIFFICULTIES.map(d => (
                            <button key={d} onClick={() => setSelectedTest({ ...selectedTest, difficulty: d })} className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all ${selectedTest.difficulty === d ? 'bg-orange-500 border-orange-500 text-white shadow-md' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>{d}</button>
                          ))}
                        </div>
                      </div>
                      <BufferedTextarea value={selectedTest.description} onSave={(v) => setSelectedTest({ ...selectedTest, description: v })} className="w-full h-40 p-5 border-2 border-slate-100 rounded-3xl font-medium text-sm bg-white" />
                      <button onClick={updateTestDetails} className="w-full py-4 bg-green-600 text-white rounded-xl font-black shadow-lg">저장하기</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* 날짜 / 난이도 / 출처 정보 카드 */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col items-center gap-1.5 bg-white border border-slate-100 rounded-2xl py-4 px-2 shadow-sm">
                          <Calendar size={16} className="text-orange-400" />
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">시험 날짜</p>
                          <p className="text-sm font-black text-slate-800 leading-none">{selectedTest.date || '-'}</p>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 bg-white border border-slate-100 rounded-2xl py-4 px-2 shadow-sm">
                          <Tag size={16} className="text-orange-400" />
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">난이도</p>
                          <p className="text-sm font-black text-slate-800 leading-none">{selectedTest.difficulty || '-'}</p>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 bg-white border border-slate-100 rounded-2xl py-4 px-2 shadow-sm">
                          <Bookmark size={16} className="text-orange-400" />
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">출처</p>
                          <p className="text-sm font-black text-slate-800 leading-none text-center break-all">{selectedTest.source || '-'}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 leading-none"><ClipboardList size={14} /> 시험 상세 범위 및 참고사항</p>
                        {userRole === 'master' && <button onClick={() => setIsTestEditMode(true)} className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-white px-3 py-1.5 rounded-xl border border-indigo-100 hover:bg-indigo-50 shadow-sm"><Edit2 size={12} /> 수정</button>}
                      </div>
                      <p className="text-slate-700 font-black whitespace-pre-wrap leading-relaxed">{selectedTest.description || "등록된 상세 정보가 없습니다."}</p>
                      <button onClick={() => { setSelectedTest(null); setIsTestEditMode(false); }} className="w-full py-5 bg-orange-600 text-white rounded-3xl font-black shadow-lg shadow-orange-100 transition-all active:scale-95 leading-none">확인 완료</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in shadow-2xl">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 text-white flex justify-between items-start shadow-inner leading-none" style={{background:'var(--sc-darker)'}}>
                <div>
                  <h2 className="text-xl font-bold text-white text-left leading-none">{selectedStudent.name} 학습 현황</h2>
                  <p className="text-white/60 text-xs font-medium uppercase tracking-widest leading-none mt-2">{selectedStudent.highSchool} | {selectedStudent.homeroomTeacher}</p>
                </div>
                <button onClick={() => setSelectedStudent(null)} className="p-1 hover:bg-white/10 rounded-full transition-all text-white"><LucideX size={24} /></button>
              </div>
              <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">과제 진척도</p>
                    <p className="text-2xl font-black text-indigo-700">{stats.assign[selectedStudent.id]?.percent || '0.0'}%</p>
                    <p className="text-xs text-indigo-500 font-bold">{stats.assign[selectedStudent.id]?.label || '-'}</p>
                  </div>
                  <div className="bg-purple-50 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">암기 진척도</p>
                    <p className="text-2xl font-black text-purple-700">{stats.memo[selectedStudent.id]?.percent || '0.0'}%</p>
                    <p className="text-xs text-purple-500 font-bold">{stats.memo[selectedStudent.id]?.label || '-'}</p>
                  </div>
                  <div className="bg-orange-50 rounded-2xl p-4 text-center col-span-2">
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">시험 평균</p>
                    <p className="text-2xl font-black text-orange-700">{stats.studentTestAverages[selectedStudent.id] || '0.0'}점</p>
                  </div>
                </div>
                {userRole === 'master' && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><StickyNote size={12} /> 학생 메모</p>
                    <BufferedTextarea
                      value={studentNotes[selectedStudent.id] || ''}
                      onSave={(v) => saveStudentNote(selectedStudent.id, v)}
                      placeholder="이 학생에 대한 메모를 입력하세요..."
                      className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:border-slate-400 transition-all resize-none select-text shadow-inner"
                    />
                  </div>
                )}
                {userRole !== 'master' && studentNotes[selectedStudent.id] && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><StickyNote size={12} /> 메모</p>
                    <p className="text-sm text-slate-600 font-medium whitespace-pre-wrap leading-relaxed">{studentNotes[selectedStudent.id]}</p>
                  </div>
                )}
                <button onClick={() => setSelectedStudent(null)} className="w-full py-4 text-white rounded-2xl font-black shadow-lg transition-all active:scale-95 leading-none" style={{background:'var(--sc-darker)'}}>닫기</button>
              </div>
            </div>
          </div>
        )}

        {/* Status Menu Portal */}
        {statusMenu && (
          <div className="fixed inset-0 z-[150]" onClick={() => setStatusMenu(null)}>
            <div
              className="absolute bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 min-w-[140px] animate-in zoom-in-95"
              style={{ left: Math.min(statusMenu.x, window.innerWidth - 160), top: Math.min(statusMenu.y, window.innerHeight - 200) }}
              onClick={e => e.stopPropagation()}
            >
              <p className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-1">상태 변경</p>
              {(statusMenu.category === 'assignment' ? ASSIGN_STATUS_ORDER : MEMO_STATUS_ORDER).map(st => {
                const cfg = statusMenu.category === 'assignment' ? ASSIGN_STATUS_CONFIG[st] : MEMO_STATUS_CONFIG[st];
                return (
                  <button
                    key={st}
                    onClick={() => handleStatusSelect(statusMenu.studentId, statusMenu.itemId, statusMenu.category, st)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-black hover:bg-slate-50 transition-colors ${cfg?.color}`}
                  >
                    {cfg?.icon && React.createElement(cfg.icon, { size: 14 })}
                    {cfg?.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {/* 일괄 처리 날짜 선택 팝업 */}
        {bulkDatePopup && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => { setBulkDatePopup(null); setBulkSelectedStatus(null); }}>
            <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-xs animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600"><Calendar size={22} /></div>
                <div>
                  <p className="font-black text-slate-800 text-base leading-none">일괄 처리 날짜 선택</p>
                  <p className="text-[11px] text-slate-400 font-medium mt-1.5 leading-none truncate max-w-[180px]">{bulkDatePopup.item.title}</p>
                </div>
              </div>
              <input
                type="date"
                value={bulkSelectedDate}
                onChange={e => setBulkSelectedDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-400 transition-all mb-6 text-center"
                autoFocus
              />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">적용할 상태 선택</p>
              <div className="space-y-1.5 max-h-52 overflow-y-auto mb-4">
                {(bulkDatePopup.category === 'assignment' ? ASSIGN_STATUS_ORDER : MEMO_STATUS_ORDER).map(st => {
                  const cfg = bulkDatePopup.category === 'assignment' ? ASSIGN_STATUS_CONFIG[st] : MEMO_STATUS_CONFIG[st];
                  const isSelected = bulkSelectedStatus === st;
                  return (
                    <button
                      key={st}
                      onClick={() => setBulkSelectedStatus(st)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm border-2 ${
                        isSelected
                          ? `${cfg?.bg} ${cfg?.color} border-current ring-2 ring-offset-1 ring-current scale-[1.02]`
                          : `${cfg?.bg} ${cfg?.color} border-transparent opacity-60 hover:opacity-100 hover:brightness-95`
                      }`}
                    >
                      {cfg?.icon && React.createElement(cfg.icon, { size: 14 })}
                      {cfg?.label}
                      {isSelected && <CheckCircle2 size={14} className="ml-auto" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => { setBulkDatePopup(null); setBulkSelectedStatus(null); }} className="flex-1 py-3 bg-slate-100 text-slate-400 rounded-2xl font-black text-sm transition hover:bg-slate-200">취소</button>
                <button
                  onClick={() => { if (bulkSelectedStatus) { bulkUpdateStatus(bulkDatePopup.item, bulkSelectedStatus, bulkDatePopup.category); setBulkSelectedStatus(null); } }}
                  disabled={!bulkSelectedStatus}
                  className={`flex-1 py-3 rounded-2xl font-black text-sm transition flex items-center justify-center gap-2 ${
                    bulkSelectedStatus
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95'
                      : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle size={16} />
                  완료
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}