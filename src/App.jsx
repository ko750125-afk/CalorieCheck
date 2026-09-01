import React, { useState, useEffect, useCallback } from "react";
import {
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";

// ---------- Design tokens ----------
const COLOR = {
  paper: "#F7F5EF",
  paperDim: "#EFEBE0",
  ink: "#22281F",
  inkDim: "#6B7264",
  line: "#D8D2C0",
  turmeric: "#C9891F",
  brick: "#A6462F",
  olive: "#4F6B3A",
};

// 폰트(Oswald, Source Serif 4)는 index.html에서 <link>로 로드한다.

// ---------- Local food DB (hybrid: tier 1) ----------
const FOOD_DB = [
  { kw: ["공기밥", "밥 한공기", "쌀밥", "흰밥"], name: "공기밥", cal: 310 },
  { kw: ["현미밥"], name: "현미밥", cal: 300 },
  { kw: ["김치찌개"], name: "김치찌개 1인분", cal: 380 },
  { kw: ["된장찌개"], name: "된장찌개 1인분", cal: 300 },
  { kw: ["순두부찌개"], name: "순두부찌개 1인분", cal: 320 },
  { kw: ["부대찌개"], name: "부대찌개 1인분", cal: 550 },
  { kw: ["삼겹살"], name: "삼겹살 200g", cal: 700 },
  { kw: ["갈비탕"], name: "갈비탕 1그릇", cal: 480 },
  { kw: ["설렁탕"], name: "설렁탕 1그릇", cal: 470 },
  { kw: ["김치찜"], name: "김치찜", cal: 420 },
  { kw: ["비빔밥"], name: "비빔밥 1그릇", cal: 560 },
  { kw: ["불고기"], name: "불고기 1인분", cal: 480 },
  { kw: ["제육볶음"], name: "제육볶음 1인분", cal: 520 },
  { kw: ["떡볶이"], name: "떡볶이 1인분", cal: 480 },
  { kw: ["김밥"], name: "김밥 1줄", cal: 350 },
  { kw: ["라면"], name: "라면 1개", cal: 500 },
  { kw: ["짜장면"], name: "짜장면 1그릇", cal: 700 },
  { kw: ["짬뽕"], name: "짬뽕 1그릇", cal: 650 },
  { kw: ["탕수육"], name: "탕수육 1인분", cal: 600 },
  { kw: ["초밥", "스시"], name: "초밥 10피스", cal: 450 },
  { kw: ["돈까스"], name: "돈까스 1인분", cal: 650 },
  { kw: ["치킨"], name: "후라이드 치킨 3조각", cal: 700 },
  { kw: ["피자"], name: "피자 2조각", cal: 560 },
  { kw: ["햄버거"], name: "햄버거 1개", cal: 500 },
  { kw: ["샐러드"], name: "샐러드 1접시", cal: 200 },
  { kw: ["계란", "달걀"], name: "계란 1개(삶은/후라이)", cal: 80 },
  { kw: ["두부"], name: "두부 반모", cal: 100 },
  { kw: ["요거트"], name: "요거트 1개", cal: 120 },
  { kw: ["바나나"], name: "바나나 1개", cal: 100 },
  { kw: ["사과"], name: "사과 1개", cal: 95 },
  { kw: ["우유"], name: "우유 200ml", cal: 130 },
  { kw: ["아메리카노"], name: "아메리카노", cal: 10 },
  { kw: ["라떼"], name: "카페라떼", cal: 180 },
  { kw: ["빵", "식빵"], name: "식빵 2쪽", cal: 200 },
  { kw: ["샌드위치"], name: "샌드위치 1개", cal: 400 },
  { kw: ["과자"], name: "과자 한봉지", cal: 350 },
  { kw: ["초콜릿"], name: "초콜릿 1개", cal: 220 },
  { kw: ["맥주"], name: "맥주 500ml", cal: 220 },
  { kw: ["소주"], name: "소주 1병", cal: 400 },
  { kw: ["막걸리"], name: "막걸리 1병", cal: 350 },
  { kw: ["아이스크림"], name: "아이스크림 1개", cal: 220 },
];

function matchLocalFood(text) {
  const t = text.trim();
  for (const item of FOOD_DB) {
    if (item.kw.some((k) => t.includes(k))) {
      return { name: item.name, calories: item.cal, source: "db" };
    }
  }
  return null;
}

// 입력 중 DB와 매칭되는 음식 자동완성 후보
function getSuggestions(text) {
  const t = text.trim();
  if (!t) return [];
  const seen = new Set();
  const results = [];
  for (const item of FOOD_DB) {
    const hit = item.kw.some((k) => k.includes(t) || t.includes(k)) || item.name.includes(t);
    if (hit && !seen.has(item.name)) {
      seen.add(item.name);
      results.push(item);
      if (results.length >= 6) break;
    }
  }
  return results;
}

// 로컬 DB에 없는 음식은 백엔드(/api/estimate, Gemini API)에 칼로리 추정을 요청한다.
async function estimateWithAI(text) {
  try {
    const response = await fetch("/api/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    return {
      name: data.name || text,
      calories: Math.round(Number(data.calories)) || 300,
      source: "ai",
    };
  } catch (e) {
    return { name: text, calories: 300, source: "fallback" };
  }
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function dateStrOffset(offset) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

const MEAL_TIME_RANGES = [
  { label: "아침", start: 5, end: 10 },
  { label: "간식", start: 10, end: 11 },
  { label: "점심", start: 11, end: 14 },
  { label: "간식", start: 14, end: 17 },
  { label: "저녁", start: 17, end: 20 },
  { label: "간식", start: 20, end: 21 },
];

// 시각 기준 자동 끼니 분류 (21시~04시59분은 야식)
function getAutoMeal(date = new Date()) {
  const h = date.getHours();
  if (h >= 21 || h < 5) return "야식";
  const hit = MEAL_TIME_RANGES.find((r) => h >= r.start && h < r.end);
  return hit ? hit.label : "간식";
}

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "거의 안함", mult: 1.2 },
  { value: "light", label: "가벼운 활동", mult: 1.375 },
  { value: "moderate", label: "보통 활동", mult: 1.55 },
  { value: "active", label: "활발한 활동", mult: 1.725 },
];

const DEFAULT_PROFILE = {
  gender: "female",
  age: "30",
  height: "165",
  currentWeight: "60",
  targetWeight: "58",
  activity: "light",
};

function calcBMI(heightCm, weightKg) {
  const h = Number(heightCm) / 100;
  const w = Number(weightKg);
  if (!h || !w) return null;
  return w / (h * h);
}

function bmiCategory(bmi) {
  if (bmi == null) return { label: "-", color: COLOR.inkDim };
  if (bmi < 18.5) return { label: "저체중", color: COLOR.turmeric };
  if (bmi < 23) return { label: "정상", color: COLOR.olive };
  if (bmi < 25) return { label: "과체중", color: COLOR.turmeric };
  return { label: "비만", color: COLOR.brick };
}

// Mifflin-St Jeor 공식 기반 목표 칼로리 계산
function calcGoalCalories(profile) {
  const { gender, age, height, currentWeight, targetWeight, activity } = profile;
  const a = Number(age),
    h = Number(height),
    w = Number(currentWeight),
    tw = Number(targetWeight);
  if (!a || !h || !w || !tw) return null;

  const bmr =
    gender === "male" ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
  const activityMult =
    ACTIVITY_LEVELS.find((l) => l.value === activity)?.mult || 1.375;
  const tdee = bmr * activityMult;

  const diff = tw - w; // 목표체중 - 현재체중
  let goalCal;
  let mode;
  if (diff <= -0.5) {
    goalCal = tdee - 500; // 감량
    mode = "감량";
  } else if (diff >= 0.5) {
    goalCal = tdee + 300; // 증량
    mode = "증량";
  } else {
    goalCal = tdee; // 유지
    mode = "유지";
  }

  const minCal = gender === "male" ? 1500 : 1200;
  goalCal = Math.max(minCal, Math.round(goalCal));

  const weeks = Math.abs(diff) >= 0.5 ? Math.ceil(Math.abs(diff) / 0.45) : 0;

  return { goalCal, mode, tdee: Math.round(tdee), diff, weeks };
}

const DUMMY_PROFILE = {
  gender: "female",
  age: "29",
  height: "163",
  currentWeight: "58",
  targetWeight: "54",
  activity: "light",
};

// 하루치 더미 식사 생성: 아침/점심/저녁 + 가끔 간식·야식
function seededRand(seed, n) {
  const x = Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453;
  return Math.abs(x - Math.floor(x)); // 0~1
}

function generateDummyDayEntries(dateStr, seed) {
  const pick = (pool, n) => {
    const p = pool.length ? pool : FOOD_DB;
    return p[Math.floor(seededRand(seed, n) * p.length)];
  };

  const breakfastPool = FOOD_DB.filter((f) =>
    ["계란", "요거트", "빵", "우유", "바나나", "사과", "샌드위치"].some((k) => f.name.includes(k))
  );
  const lunchPool = FOOD_DB.filter((f) =>
    ["찌개", "밥", "비빔밥", "김밥", "돈까스", "제육", "불고기", "초밥"].some((k) => f.name.includes(k))
  );
  const dinnerPool = FOOD_DB.filter((f) =>
    ["찌개", "탕", "삼겹살", "치킨", "볶음", "밥"].some((k) => f.name.includes(k))
  );
  const snackPool = FOOD_DB.filter((f) =>
    ["과자", "초콜릿", "아이스크림", "커피", "라떼", "아메리카노"].some((k) => f.name.includes(k))
  );

  const slots = [
    { hour: 8, m: 20, pool: breakfastPool },
    { hour: 12, m: 30, pool: lunchPool },
    { hour: 18, m: 40, pool: dinnerPool },
  ];
  if (seededRand(seed, 4) < 0.5) slots.push({ hour: 15, m: 0, pool: snackPool });
  if (seededRand(seed, 5) < 0.33) slots.push({ hour: 22, m: 30, pool: snackPool });

  return slots.map((slot, i) => {
    const item = pick(slot.pool, i + 1);
    const d = new Date(`${dateStr}T00:00:00`);
    d.setHours(slot.hour, slot.m, 0, 0);
    return {
      id: Date.now() + i + Math.floor(seededRand(seed, i + 10) * 1000),
      name: item.name,
      calories: item.cal,
      meal: getAutoMeal(d),
      source: "db",
      time: `${String(slot.hour).padStart(2, "0")}:${String(slot.m).padStart(2, "0")}`,
    };
  });
}

export default function CalorieJournal() {
  const [profile, setProfile] = useState(null);
  const [profileDraft, setProfileDraft] = useState(DEFAULT_PROFILE);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [entries, setEntries] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [input, setInput] = useState("");
  // meal은 더 이상 수동 선택하지 않고 입력 시각 기준으로 자동 결정됨
  const [mode, setMode] = useState(null); // null | 'search' | 'log'
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [logSuggestions, setLogSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const loadToday = useCallback(async () => {
    try {
      const raw = localStorage.getItem(`foodlog:${todayStr()}`);
      setEntries(raw ? JSON.parse(raw) : []);
    } catch {
      setEntries([]);
    }
  }, []);

  const loadWeekly = useCallback(async () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const ds = dateStrOffset(i);
      let sum = 0;
      try {
        const raw = localStorage.getItem(`foodlog:${ds}`);
        if (raw) {
          const arr = JSON.parse(raw);
          sum = arr.reduce((s, e) => s + e.calories, 0);
        }
      } catch {
        sum = 0;
      }
      const d = new Date(ds);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      days.push({ date: ds, label, calories: sum });
    }
    setWeekly(days);
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const raw = localStorage.getItem("profile");
      if (raw) {
        const p = JSON.parse(raw);
        setProfile(p);
        setProfileDraft(p);
      } else {
        setShowProfileForm(true);
      }
    } catch {
      setShowProfileForm(true);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await Promise.all([loadToday(), loadWeekly(), loadProfile()]);
      setReady(true);
    })();
  }, [loadToday, loadWeekly, loadProfile]);

  async function saveProfile() {
    setProfile(profileDraft);
    setShowProfileForm(false);
    try {
      localStorage.setItem("profile", JSON.stringify(profileDraft));
    } catch {
      // ignore save failure, UI already updated
    }
  }

  async function fillDummyData() {
    setLoading(true);
    try {
      if (!profile) {
        localStorage.setItem("profile", JSON.stringify(DUMMY_PROFILE));
        setProfile(DUMMY_PROFILE);
        setProfileDraft(DUMMY_PROFILE);
        setShowProfileForm(false);
      }
      for (let i = 6; i >= 0; i--) {
        const ds = dateStrOffset(i);
        const dayEntries = generateDummyDayEntries(ds, i + 1);
        localStorage.setItem(`foodlog:${ds}`, JSON.stringify(dayEntries));
      }
      await Promise.all([loadToday(), loadWeekly()]);
    } catch {
      // dummy data generation best-effort only
    }
    setLoading(false);
  }

  async function doSearch() {
    if (!searchText.trim() || searchLoading) return;
    setSearchLoading(true);
    setSearchResult(null);
    let result = matchLocalFood(searchText);
    if (!result) {
      result = await estimateWithAI(searchText);
    }
    setSearchResult(result);
    setSearchLoading(false);
  }

  async function addEntry() {
    if (!input.trim() || loading) return;
    setLoading(true);
    let result = matchLocalFood(input);
    if (!result) {
      result = await estimateWithAI(input);
    }
    const now = new Date();
    const entry = {
      id: Date.now(),
      name: result.name,
      calories: result.calories,
      meal: getAutoMeal(now),
      source: result.source,
      time: now.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    const next = [...entries, entry];
    setEntries(next);
    setInput("");
    setLogSuggestions([]);
    setLoading(false);
    try {
      localStorage.setItem(`foodlog:${todayStr()}`, JSON.stringify(next));
    } catch {
      // storage failed, keep in-memory state
    }
    loadWeekly();
  }

  async function deleteEntry(id) {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    try {
      localStorage.setItem(`foodlog:${todayStr()}`, JSON.stringify(next));
    } catch {
      // storage failed, keep in-memory state
    }
    loadWeekly();
  }

  const goalInfo = profile ? calcGoalCalories(profile) : null;
  const goal = goalInfo ? goalInfo.goalCal : 2000;
  const bmi = profile ? calcBMI(profile.height, profile.currentWeight) : null;
  const bmiCat = bmiCategory(bmi);

  const total = entries.reduce((s, e) => s + e.calories, 0);
  const ratio = goal > 0 ? total / goal : 0;
  const statusColor =
    ratio > 1.05 ? COLOR.brick : ratio > 0.85 ? COLOR.turmeric : COLOR.olive;
  const statusLabel =
    ratio > 1.05 ? "목표 초과" : ratio > 0.85 ? "목표 근접" : "여유 있음";

  const gaugeData = [
    {
      name: "consumed",
      value: Math.min(ratio * 100, 100),
      fill: statusColor,
    },
  ];

  return (
    <div
      style={{
        background: COLOR.paper,
        color: COLOR.ink,
        minHeight: "100%",
        fontFamily: "'Source Serif 4', serif",
      }}
      className="w-full max-w-2xl mx-auto p-4 md:p-6"
    >
      {/* Header */}
      <div style={{ borderBottom: `3px solid ${COLOR.ink}` }} className="pb-2 mb-1">
        <h1
          style={{
            fontFamily: "'Oswald', sans-serif",
            letterSpacing: "0.02em",
          }}
          className="text-2xl font-semibold"
        >
          선우야 먹기전에 체크하자
        </h1>
        <div className="flex items-center justify-between mt-1">
          <span style={{ color: COLOR.inkDim, fontSize: "0.85rem" }}>{todayStr()}</span>
          <button
            onClick={fillDummyData}
            disabled={loading}
            style={{ color: COLOR.inkDim, fontSize: "0.75rem", textDecoration: "underline" }}
            className="py-1"
          >
            샘플 데이터 채우기
          </button>
        </div>
      </div>
      <div style={{ borderBottom: `1px solid ${COLOR.line}` }} className="mb-5" />

      {/* Profile & BMI card */}
      <div style={{ borderBottom: `1px solid ${COLOR.line}` }} className="pb-4 mb-5">
        {!showProfileForm ? (
          <div className="flex items-start justify-between gap-2 text-sm">
            {profile ? (
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-1">
                  <span>
                    <span style={{ color: COLOR.inkDim }}>키/체중 </span>
                    {profile.height}cm · {profile.currentWeight}kg
                  </span>
                  <span>
                    <span style={{ color: COLOR.inkDim }}>BMI </span>
                    <span style={{ color: bmiCat.color, fontWeight: 600 }}>
                      {bmi ? bmi.toFixed(1) : "-"} {bmiCat.label}
                    </span>
                  </span>
                </div>
                <div style={{ color: COLOR.inkDim, fontSize: "0.8rem" }}>
                  목표체중 {profile.targetWeight}kg
                  {goalInfo && goalInfo.weeks > 0 && (
                    <> · 약 {goalInfo.weeks}주 {goalInfo.mode} 계획</>
                  )}
                </div>
              </div>
            ) : (
              <span style={{ color: COLOR.inkDim }}>
                프로필을 입력하면 목표 칼로리가 자동 계산됩니다
              </span>
            )}
            <div className="text-right flex-shrink-0">
              <div
                style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700 }}
                className="text-lg"
              >
                {goal.toLocaleString()} kcal
              </div>
              <button
                onClick={() => setShowProfileForm(true)}
                style={{ color: COLOR.inkDim, fontSize: "0.75rem" }}
                className="py-1.5"
              >
                프로필 {profile ? "수정" : "입력하기"} ✎
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-xs" style={{ color: COLOR.ink }}>프로필 정보 설정</span>
              <button
                type="button"
                onClick={() => {
                  if (profile) setProfileDraft(profile);
                  setShowProfileForm(false);
                }}
                style={{ color: COLOR.inkDim, fontSize: "0.75rem" }}
                className="px-2 py-0.5 hover:opacity-80"
              >
                ✕ 닫기
              </button>
            </div>
            <div className="flex gap-2 mb-2">
              {[
                { value: "female", label: "여성" },
                { value: "male", label: "남성" },
              ].map((g) => (
                <button
                  key={g.value}
                  onClick={() => setProfileDraft({ ...profileDraft, gender: g.value })}
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: "0.75rem",
                    border: `1px solid ${
                      profileDraft.gender === g.value ? COLOR.ink : COLOR.line
                    }`,
                    background: profileDraft.gender === g.value ? COLOR.ink : "transparent",
                    color: profileDraft.gender === g.value ? COLOR.paper : COLOR.inkDim,
                  }}
                  className="px-3 py-1"
                >
                  {g.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              {[
                { key: "age", label: "나이" },
                { key: "height", label: "키(cm)" },
                { key: "currentWeight", label: "현재체중(kg)" },
                { key: "targetWeight", label: "목표체중(kg)" },
              ].map((f) => (
                <label key={f.key} className="block">
                  <span style={{ color: COLOR.inkDim, fontSize: "0.7rem" }}>{f.label}</span>
                  <input
                    type="number"
                    value={profileDraft[f.key]}
                    onChange={(e) =>
                      setProfileDraft({ ...profileDraft, [f.key]: e.target.value })
                    }
                    style={{ border: `1px solid ${COLOR.line}`, background: "white", fontSize: "16px" }}
                    className="w-full px-2 py-1.5 mt-0.5"
                  />
                </label>
              ))}
            </div>

            <span style={{ color: COLOR.inkDim, fontSize: "0.7rem" }}>활동량</span>
            <div className="flex flex-wrap gap-2 mt-1 mb-3">
              {ACTIVITY_LEVELS.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setProfileDraft({ ...profileDraft, activity: a.value })}
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: "0.7rem",
                    border: `1px solid ${
                      profileDraft.activity === a.value ? COLOR.ink : COLOR.line
                    }`,
                    background: profileDraft.activity === a.value ? COLOR.ink : "transparent",
                    color: profileDraft.activity === a.value ? COLOR.paper : COLOR.inkDim,
                  }}
                  className="px-2 py-1"
                >
                  {a.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={saveProfile}
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  background: COLOR.ink,
                  color: COLOR.paper,
                }}
                className="px-4 py-1.5 text-xs"
              >
                저장하고 목표 계산
              </button>
              <button
                type="button"
                onClick={() => {
                  if (profile) setProfileDraft(profile);
                  setShowProfileForm(false);
                }}
                style={{
                  color: COLOR.inkDim,
                  fontSize: "0.75rem",
                  border: `1px solid ${COLOR.line}`,
                  background: "white",
                }}
                className="px-3 py-1.5 text-xs hover:bg-gray-50"
              >
                닫기 / 취소
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hero gauge */}
      <div className="flex items-center gap-4 mb-2">
        <div style={{ width: 130, height: 130, position: "relative", flexShrink: 0 }}>
          <ResponsiveContainer>
            <RadialBarChart
              innerRadius="72%"
              outerRadius="100%"
              data={gaugeData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar dataKey="value" cornerRadius={0} background={{ fill: COLOR.paperDim }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>
              {total.toLocaleString()}
            </div>
            <div style={{ color: COLOR.inkDim, fontSize: "0.7rem" }}>
              / {goal.toLocaleString()} kcal
            </div>
            <div style={{ color: statusColor, fontSize: "0.8rem", fontWeight: 600, marginTop: "2px" }}>
              {Math.round(ratio * 100)}%
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div
            style={{ color: statusColor, fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}
            className="text-lg"
          >
            {statusLabel}
          </div>
          <div style={{ color: COLOR.inkDim, fontSize: "0.85rem" }}>
            {goal - total >= 0
              ? `${(goal - total).toLocaleString()} kcal 더 섭취 가능`
              : `${(total - goal).toLocaleString()} kcal 초과`}
          </div>
        </div>
      </div>
      <div style={{ color: COLOR.inkDim, fontSize: "0.7rem" }} className="mb-6">
        오늘 섭취 {total.toLocaleString()}kcal ÷ 목표 {goal.toLocaleString()}kcal 기준 · 85%
        미만 여유있음 · 85~105% 목표 근접 · 105% 초과 시 초과
      </div>

      {/* Input */}
      <div style={{ borderTop: `1px solid ${COLOR.line}`, borderBottom: `1px solid ${COLOR.line}` }} className="py-4 mb-6">
        {mode === null && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMode("search");
                setSearchText("");
                setSearchResult(null);
              }}
              style={{
                fontFamily: "'Oswald', sans-serif",
                border: `1px solid ${COLOR.line}`,
                background: "white",
              }}
              className="flex-1 py-3 text-sm"
            >
              뭘 먹을까? <span style={{ color: COLOR.inkDim, fontSize: "0.7rem" }}>(칼로리만 확인)</span>
            </button>
            <button
              onClick={() => setMode("log")}
              style={{
                fontFamily: "'Oswald', sans-serif",
                background: COLOR.ink,
                color: COLOR.paper,
              }}
              className="flex-1 py-3 text-sm"
            >
              뭘 먹었니? <span style={{ color: COLOR.paperDim, fontSize: "0.7rem" }}>(기록하기)</span>
            </button>
          </div>
        )}

        {mode === "search" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.8rem", color: COLOR.turmeric }}
              >
                칼로리 검색 · 기록되지 않음
              </span>
              <button
                onClick={() => setMode(null)}
                style={{ color: COLOR.inkDim, fontSize: "0.75rem" }}
                className="py-1.5 px-1"
              >
                ← 뒤로
              </button>
            </div>
            <div className="flex gap-2 relative">
              <div className="flex-1 relative">
                <input
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setSearchSuggestions(getSuggestions(e.target.value));
                  }}
                  onKeyDown={(e) => e.key === "Enter" && doSearch()}
                  placeholder="예: 삼겹살 200g"
                  style={{ border: `1px solid ${COLOR.line}`, background: "white", fontSize: "16px" }}
                  className="w-full px-3 py-2"
                />
                {searchSuggestions.length > 0 && (
                  <div
                    style={{
                      border: `1px solid ${COLOR.line}`,
                      background: "white",
                      top: "100%",
                    }}
                    className="absolute left-0 right-0 z-10 mt-0.5"
                  >
                    {searchSuggestions.map((s) => (
                      <button
                        key={s.name}
                        onClick={() => {
                          setSearchText(s.name);
                          setSearchSuggestions([]);
                          setSearchResult({ name: s.name, calories: s.cal, source: "db" });
                        }}
                        style={{ borderBottom: `1px solid ${COLOR.paperDim}` }}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-left hover:bg-gray-50"
                      >
                        <span>{s.name}</span>
                        <span style={{ color: COLOR.inkDim, fontSize: "0.75rem" }}>
                          {s.cal} kcal
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={doSearch}
                disabled={searchLoading}
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  border: `1px solid ${COLOR.ink}`,
                  color: COLOR.ink,
                }}
                className="px-4 py-2 text-sm"
              >
                {searchLoading ? "확인 중…" : "검색"}
              </button>
            </div>
            {searchResult && (
              <div
                style={{ border: `1px solid ${COLOR.line}`, background: COLOR.paperDim }}
                className="flex items-center justify-between px-3 py-2 mt-2 text-sm"
              >
                <span>
                  {searchResult.name}
                  {searchResult.source !== "db" && (
                    <span style={{ color: COLOR.turmeric, fontSize: "0.65rem" }} className="ml-2">
                      추정
                    </span>
                  )}
                </span>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
                  {searchResult.calories} kcal
                </span>
              </div>
            )}
          </div>
        )}

        {mode === "log" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.8rem", color: COLOR.inkDim }}>
                식사 기록하기
              </span>
              <button
                onClick={() => setMode(null)}
                style={{ color: COLOR.inkDim, fontSize: "0.75rem" }}
                className="py-1.5 px-1"
              >
                ← 뒤로
              </button>
            </div>
            <div
              style={{ color: COLOR.inkDim, fontSize: "0.75rem" }}
              className="mb-2"
            >
              지금은{" "}
              <span style={{ color: COLOR.ink, fontWeight: 600 }}>
                {getAutoMeal()}
              </span>{" "}
              시간대로 자동 기록됩니다
            </div>
            <div className="flex gap-2 relative">
              <div className="flex-1 relative">
                <input
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setLogSuggestions(getSuggestions(e.target.value));
                  }}
                  onKeyDown={(e) => e.key === "Enter" && addEntry()}
                  placeholder="예: 김치찌개 1인분, 계란 2개랑 사과"
                  style={{ border: `1px solid ${COLOR.line}`, background: "white", fontSize: "16px" }}
                  className="w-full px-3 py-2"
                />
                {logSuggestions.length > 0 && (
                  <div
                    style={{
                      border: `1px solid ${COLOR.line}`,
                      background: "white",
                      top: "100%",
                    }}
                    className="absolute left-0 right-0 z-10 mt-0.5"
                  >
                    {logSuggestions.map((s) => (
                      <button
                        key={s.name}
                        onClick={() => {
                          setInput(s.name);
                          setLogSuggestions([]);
                        }}
                        style={{ borderBottom: `1px solid ${COLOR.paperDim}` }}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-left hover:bg-gray-50"
                      >
                        <span>{s.name}</span>
                        <span style={{ color: COLOR.inkDim, fontSize: "0.75rem" }}>
                          {s.cal} kcal
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={addEntry}
                disabled={loading}
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  background: loading ? COLOR.inkDim : COLOR.ink,
                  color: COLOR.paper,
                }}
                className="px-4 py-2 text-sm"
              >
                {loading ? "계산 중…" : "추가"}
              </button>
            </div>
          </div>
        )}

        <div style={{ color: COLOR.inkDim, fontSize: "0.7rem" }} className="mt-2">
          DB에 없는 음식은 자동으로 추정 계산됩니다
        </div>
      </div>

      {/* Today's list */}
      <div className="mb-6">
        <div
          style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.8rem", color: COLOR.inkDim }}
          className="mb-2"
        >
          오늘 기록 ({entries.length})
        </div>
        {entries.length === 0 && !ready ? null : entries.length === 0 ? (
          <div style={{ color: COLOR.inkDim, fontSize: "0.85rem" }} className="py-4">
            아직 기록이 없습니다. 위에서 먹은 음식을 입력해보세요.
          </div>
        ) : (
          <div>
            {entries.map((e) => (
              <div
                key={e.id}
                style={{ borderBottom: `1px solid ${COLOR.line}` }}
                className="flex items-center justify-between py-2 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: "0.65rem",
                      color: COLOR.inkDim,
                      width: "34px",
                    }}
                  >
                    {e.meal}
                  </span>
                  <span>{e.name}</span>
                  {e.source !== "db" && (
                    <span style={{ color: COLOR.turmeric, fontSize: "0.65rem" }}>추정</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ fontFamily: "'Oswald', sans-serif" }}>{e.calories} kcal</span>
                  <button
                    onClick={() => deleteEntry(e.id)}
                    style={{ color: COLOR.inkDim }}
                    className="text-xs p-2 -m-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly chart */}
      {(() => {
        const maxCalorieInWeekly = Math.max(...weekly.map((d) => d.calories || 0), 0);
        const yMax = Math.ceil(Math.max(maxCalorieInWeekly, goal || 2000) * 1.15);
        return (
          <div>
            <div
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.8rem", color: COLOR.inkDim }}
              className="mb-2"
            >
              최근 7일 추이
            </div>
            <div style={{ width: "100%", height: 170 }}>
              <ResponsiveContainer>
                <BarChart data={weekly} margin={{ top: 16, right: 4, left: -15, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: COLOR.inkDim }}
                    axisLine={{ stroke: COLOR.line }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, yMax]}
                    tick={{ fontSize: 10, fill: COLOR.inkDim }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: COLOR.paper,
                      border: `1px solid ${COLOR.line}`,
                      fontSize: "0.8rem",
                    }}
                  />
                  {goal > 0 && (
                    <ReferenceLine
                      y={goal}
                      stroke={COLOR.brick}
                      strokeWidth={2}
                      label={{
                        value: `목표 ${goal.toLocaleString()}kcal`,
                        fill: COLOR.brick,
                        fontSize: 10,
                        position: "top",
                        fontWeight: 600,
                      }}
                    />
                  )}
                  <Bar dataKey="calories" radius={[2, 2, 0, 0]}>
                    {weekly.map((d, i) => (
                      <Cell
                        key={i}
                        fill={d.calories > goal ? COLOR.brick : COLOR.turmeric}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
