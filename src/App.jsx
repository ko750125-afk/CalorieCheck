import React, { useState, useEffect, useCallback } from "react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
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
  paper: "#FFFDF9",
  paperDim: "#FFF6ED",
  ink: "#3A3535",
  inkDim: "#8C827A",
  line: "#F2E8DF",
  turmeric: "#FF922B",
  brick: "#FF6B6B",
  olive: "#51CF66",
  brand: "#FF8E53",
};

// 폰트(Oswald, Source Serif 4)는 index.html에서 <link>로 로드한다.

// ---------- Local food DB (hybrid: tier 1) ----------
const FOOD_DB = [
  // 1. 밥 / 죽류
  { kw: ["공기밥", "밥", "쌀밥", "흰밥"], name: "공기밥", cal: 310 },
  { kw: ["현미밥"], name: "현미밥", cal: 300 },
  { kw: ["비빔밥"], name: "비빔밥", cal: 560 },
  { kw: ["죽", "전복죽", "야채죽", "소고기죽"], name: "죽", cal: 300 },

  // 2. 찌개 / 탕 / 찜 / 국류
  { kw: ["김치찌개"], name: "김치찌개", cal: 380 },
  { kw: ["된장찌개"], name: "된장찌개", cal: 300 },
  { kw: ["순두부찌개"], name: "순두부찌개", cal: 320 },
  { kw: ["부대찌개"], name: "부대찌개", cal: 550 },
  { kw: ["갈비탕"], name: "갈비탕", cal: 480 },
  { kw: ["설렁탕"], name: "설렁탕", cal: 470 },
  { kw: ["김치찜"], name: "김치찜", cal: 420 },
  { kw: ["감자탕"], name: "감자탕", cal: 900 },
  { kw: ["찜닭"], name: "찜닭", cal: 800 },
  { kw: ["아구찜"], name: "아구찜", cal: 500 },
  { kw: ["삼계탕"], name: "삼계탕", cal: 950 },
  { kw: ["갈비찜"], name: "갈비찜", cal: 750 },
  { kw: ["닭볶음탕", "닭도리탕"], name: "닭볶음탕", cal: 750 },
  { kw: ["곱창전골"], name: "곱창전골", cal: 800 },
  { kw: ["해물찜"], name: "해물찜", cal: 550 },
  { kw: ["샤브샤브"], name: "샤브샤브", cal: 500 },
  { kw: ["쭈꾸미", "쭈꾸미볶음"], name: "쭈꾸미", cal: 400 },
  { kw: ["국밥", "돼지국밥", "순대국밥"], name: "국밥", cal: 650 },
  { kw: ["해물탕"], name: "해물탕", cal: 450 },
  { kw: ["마라탕"], name: "마라탕", cal: 850 },

  // 3. 고기 / 구이류
  { kw: ["삼겹살"], name: "삼겹살", cal: 700 },
  { kw: ["불고기", "소불고기", "돼지불고기"], name: "불고기", cal: 480 },
  { kw: ["제육볶음", "제육"], name: "제육볶음", cal: 520 },
  { kw: ["탕수육"], name: "탕수육", cal: 600 },
  { kw: ["치킨", "후라이드", "양념치킨"], name: "치킨", cal: 700 },
  { kw: ["보쌈"], name: "보쌈", cal: 650 },
  { kw: ["족발"], name: "족발", cal: 750 },
  { kw: ["곱창볶음", "야채곱창"], name: "곱창볶음", cal: 600 },
  { kw: ["갈비", "돼지갈비", "소갈비"], name: "갈비", cal: 600 },
  { kw: ["오겹살"], name: "오겹살", cal: 700 },
  { kw: ["우삼겹살", "우삼겹"], name: "우삼겹살", cal: 650 },
  { kw: ["차돌박이", "차돌"], name: "차돌박이", cal: 650 },
  { kw: ["닭발", "무뼈닭발"], name: "닭발", cal: 450 },

  // 4. 면 / 분식류
  { kw: ["떡볶이"], name: "떡볶이", cal: 480 },
  { kw: ["김밥"], name: "김밥", cal: 350 },
  { kw: ["라면"], name: "라면", cal: 500 },
  { kw: ["짜장면", "자장면"], name: "짜장면", cal: 700 },
  { kw: ["짬뽕"], name: "짬뽕", cal: 650 },
  { kw: ["칼국수"], name: "칼국수", cal: 550 },
  { kw: ["우동"], name: "우동", cal: 450 },
  { kw: ["순대"], name: "순대", cal: 400 },
  { kw: ["잔치국수", "국수"], name: "잔치국수", cal: 420 },
  { kw: ["쌀국수"], name: "쌀국수", cal: 450 },
  { kw: ["냉면", "물냉면", "비빔냉면"], name: "냉면", cal: 500 },
  { kw: ["토스트"], name: "토스트", cal: 380 },

  // 5. 일식 / 양식 / 패스트푸드
  { kw: ["초밥", "스시"], name: "초밥", cal: 450 },
  { kw: ["돈까스", "돈가스"], name: "돈까스", cal: 650 },
  { kw: ["피자"], name: "피자", cal: 560 },
  { kw: ["햄버거", "버거"], name: "햄버거", cal: 500 },
  { kw: ["샌드위치"], name: "샌드위치", cal: 400 },
  { kw: ["타꼬야키", "타코야끼"], name: "타꼬야키", cal: 320 },
  { kw: ["파스타"], name: "파스타", cal: 600 },
  { kw: ["스파게티"], name: "스파게티", cal: 600 },

  // 6. 다이어트 / 과일 / 간식류
  { kw: ["과일", "사과", "배", "포도", "귤", "복숭아", "감"], name: "과일", cal: 150 },
  { kw: ["샐러드"], name: "샐러드", cal: 200 },
  { kw: ["계란", "달걀", "삶은계란"], name: "계란", cal: 80 },
  { kw: ["두부"], name: "두부", cal: 100 },
  { kw: ["빵", "식빵"], name: "식빵", cal: 200 },
  { kw: ["과자", "스낵"], name: "과자", cal: 350 },
  { kw: ["초콜릿"], name: "초콜릿", cal: 220 },
  { kw: ["아이스크림"], name: "아이스크림", cal: 220 },

  // 7. 음료류
  { kw: ["쥬스", "주스", "과일주스"], name: "쥬스", cal: 160 },
  { kw: ["식혜"], name: "식혜", cal: 180 },
  { kw: ["요거트", "플레인요거트"], name: "요거트", cal: 120 },
  { kw: ["요구르트"], name: "요구르트", cal: 70 },
  { kw: ["콜라"], name: "콜라", cal: 150 },
  { kw: ["사이다"], name: "사이다", cal: 150 },
  { kw: ["음료수", "음료"], name: "음료수", cal: 140 },
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

function smartFallback(text) {
  const t = text.trim();
  if (/음료|아메리카노|차|티|물|탄산수/i.test(t)) return { name: t, calories: 40 };
  if (/라떼|주스|에이드|스무디|밀크티/i.test(t)) return { name: t, calories: 180 };
  if (/샐러드|채소|야채|과일/i.test(t)) return { name: t, calories: 150 };
  if (/고기|삼겹살|갈비|스테이크|구이|치킨|돈까스|보쌈|족발/i.test(t)) return { name: t, calories: 650 };
  if (/탕|찌개|전골|국|국밥/i.test(t)) return { name: t, calories: 450 };
  if (/면|라면|우동|파스타|짜장|짬뽕|국수/i.test(t)) return { name: t, calories: 550 };
  if (/밥|비빔밥|볶음밥|덮밥|초밥/i.test(t)) return { name: t, calories: 480 };
  if (/빵|샌드위치|버거|피자|케이크/i.test(t)) return { name: t, calories: 420 };
  if (/과자|초콜릿|쿠키|아이스크림/i.test(t)) return { name: t, calories: 250 };
  return { name: t, calories: Math.min(650, Math.max(150, t.length * 90)) };
}

// 로컬 DB에 없는 음식은 Gemini API(클라이언트 직통 및 백엔드)를 활용해 실시간으로 칼로리를 정확히 추정한다.
async function estimateWithAI(text) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  
  if (apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `다음 음식/식사 설명의 대략적인 1인분 칼로리를 추정해줘: "${text}"` }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING", description: "간결한 음식명(한글)" },
                calories: { type: "NUMBER", description: "추정 칼로리(kcal)" },
              },
              required: ["name", "calories"],
            },
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.calories && Number.isFinite(parsed.calories)) {
            return {
              name: parsed.name || text,
              calories: Math.round(Number(parsed.calories)),
              source: "ai",
            };
          }
        }
      }
    } catch {
      // direct call fallback
    }
  }

  try {
    const response = await fetch("/api/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.calories && Number.isFinite(data.calories)) {
        return {
          name: data.name || text,
          calories: Math.round(Number(data.calories)),
          source: "ai",
        };
      }
    }
  } catch {
    // backend unavailable in local dev
  }

  const fb = smartFallback(text);
  return { ...fb, source: "ai" };
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
  { value: "sedentary", label: "거의 안함 (x1.2)", mult: 1.2, desc: "BMR x 1.2" },
  { value: "light", label: "가벼운 활동 (x1.375)", mult: 1.375, desc: "BMR x 1.375" },
  { value: "moderate", label: "보통 활동 (x1.55)", mult: 1.55, desc: "BMR x 1.55" },
  { value: "active", label: "활발한 활동 (x1.725)", mult: 1.725, desc: "BMR x 1.725" },
];

const CALORIE_REFERENCE_CATEGORIES = [
  { id: "all", label: "전체" },
  { id: "rice", label: "🍚 밥/죽/덮밥" },
  { id: "soup", label: "🍲 찌개/국/탕" },
  { id: "meat", label: "🥩 고기/구이/찜" },
  { id: "noodle", label: "🍜 면/분식/튀김" },
  { id: "bread", label: "🍔 빵/패스트푸드" },
  { id: "drink", label: "🥤 카페/음료" },
  { id: "diet", label: "🥗 다이어트/과일" },
];

const CALORIE_REFERENCE_ITEMS = [
  // 🍚 밥/죽/덮밥
  { cat: "rice", name: "쌀밥 (1공기)", cal: 300 },
  { cat: "rice", name: "잡곡밥 (1공기)", cal: 300 },
  { cat: "rice", name: "현미밥 (1공기)", cal: 290 },
  { cat: "rice", name: "비빔밥", cal: 550 },
  { cat: "rice", name: "일반 김밥 (1줄)", cal: 350 },
  { cat: "rice", name: "참치 김밥 (1줄)", cal: 480 },
  { cat: "rice", name: "돈가스 김밥 (1줄)", cal: 500 },
  { cat: "rice", name: "제육덮밥", cal: 650 },
  { cat: "rice", name: "불고기덮밥", cal: 620 },
  { cat: "rice", name: "돈가스덮밥(가츠동)", cal: 700 },
  { cat: "rice", name: "카레라이스", cal: 680 },
  { cat: "rice", name: "오므라이스", cal: 650 },
  { cat: "rice", name: "전복죽", cal: 320 },
  { cat: "rice", name: "야채죽", cal: 280 },
  { cat: "rice", name: "삼선볶음밥", cal: 750 },

  // 🍲 찌개/국/탕
  { cat: "soup", name: "김치찌개 (밥 포함)", cal: 450 },
  { cat: "soup", name: "된장찌개", cal: 200 },
  { cat: "soup", name: "순두부찌개", cal: 350 },
  { cat: "soup", name: "부대찌개", cal: 550 },
  { cat: "soup", name: "청국장찌개", cal: 250 },
  { cat: "soup", name: "갈비탕", cal: 500 },
  { cat: "soup", name: "설렁탕 / 곰탕", cal: 480 },
  { cat: "soup", name: "삼계탕 (1그릇)", cal: 850 },
  { cat: "soup", name: "감자탕 / 뼈해장국", cal: 600 },
  { cat: "soup", name: "마라탕", cal: 700 },
  { cat: "soup", name: "해물탕", cal: 380 },
  { cat: "soup", name: "추어탕", cal: 420 },
  { cat: "soup", name: "소고기무국", cal: 180 },
  { cat: "soup", name: "미역국", cal: 150 },

  // 🥩 고기/구이/찜
  { cat: "meat", name: "삼겹살구이 (200g)", cal: 650 },
  { cat: "meat", name: "돼지양념갈비 (250g)", cal: 750 },
  { cat: "meat", name: "돼지고기 수육/보쌈 (200g)", cal: 550 },
  { cat: "meat", name: "족발 (1접시 몫)", cal: 750 },
  { cat: "meat", name: "소불고기 (200g)", cal: 350 },
  { cat: "meat", name: "제육볶음 (200g)", cal: 450 },
  { cat: "meat", name: "닭볶음탕", cal: 600 },
  { cat: "meat", name: "안동찜닭", cal: 580 },
  { cat: "meat", name: "곱창구이 / 볶음", cal: 500 },
  { cat: "meat", name: "우삼겹 / 차돌박이 (150g)", cal: 520 },
  { cat: "meat", name: "닭발 (1접시)", cal: 420 },
  { cat: "meat", name: "훈제오리 (200g)", cal: 480 },

  // 🍜 면/분식/튀김
  { cat: "noodle", name: "봉지 라면 (1봉)", cal: 500 },
  { cat: "noodle", name: "짜장면", cal: 680 },
  { cat: "noodle", name: "짬뽕", cal: 550 },
  { cat: "noodle", name: "칼국수", cal: 550 },
  { cat: "noodle", name: "잔치국수", cal: 420 },
  { cat: "noodle", name: "물냉면", cal: 480 },
  { cat: "noodle", name: "비빔냉면", cal: 520 },
  { cat: "noodle", name: "쌀국수 (포)", cal: 450 },
  { cat: "noodle", name: "우동", cal: 400 },
  { cat: "noodle", name: "떡볶이 (1인분)", cal: 450 },
  { cat: "noodle", name: "로제 떡볶이 (1인분)", cal: 720 },
  { cat: "noodle", name: "순대 (1인분)", cal: 350 },
  { cat: "noodle", name: "모둠 튀김 (1인분)", cal: 400 },
  { cat: "noodle", name: "길거리 어묵 (2꼬치)", cal: 220 },
  { cat: "noodle", name: "호떡 (1개)", cal: 260 },
  { cat: "noodle", name: "붕어빵 (2개)", cal: 240 },

  // 🍔 빵/패스트푸드
  { cat: "bread", name: "식빵 (1장)", cal: 100 },
  { cat: "bread", name: "단팥빵 / 소보로빵", cal: 250 },
  { cat: "bread", name: "크루아상", cal: 250 },
  { cat: "bread", name: "클럽 샌드위치", cal: 450 },
  { cat: "bread", name: "기본 햄버거", cal: 400 },
  { cat: "bread", name: "치즈버거", cal: 500 },
  { cat: "bread", name: "더블 패티 버거", cal: 700 },
  { cat: "bread", name: "후라이드 치킨 (1조각)", cal: 250 },
  { cat: "bread", name: "양념 치킨 (1조각)", cal: 300 },
  { cat: "bread", name: "피자 (1조각)", cal: 350 },
  { cat: "bread", name: "감자튀김 (M)", cal: 350 },
  { cat: "bread", name: "토스트 (계란/치즈)", cal: 380 },
  { cat: "bread", name: "타코야키 (6개)", cal: 320 },
  { cat: "bread", name: "크림 파스타 / 스파게티", cal: 750 },
  { cat: "bread", name: "토마토 파스타", cal: 550 },

  // 🥤 카페/음료
  { cat: "drink", name: "아메리카노 (아이스/핫)", cal: 10 },
  { cat: "drink", name: "카페라떼", cal: 180 },
  { cat: "drink", name: "바닐라라떼 / 카라멜마키아또", cal: 280 },
  { cat: "drink", name: "생과일주스", cal: 180 },
  { cat: "drink", name: "식혜 (1컵)", cal: 200 },
  { cat: "drink", name: "요거트 / 요구르트", cal: 120 },
  { cat: "drink", name: "콜라 / 사이다 (1캔 355ml)", cal: 150 },
  { cat: "drink", name: "제로 콜라 / 제로 사이다", cal: 0 },
  { cat: "drink", name: "이온음료 (포카리/게토레이 1캔)", cal: 80 },

  // 🥗 다이어트/과일
  { cat: "diet", name: "삶은 계란 (1개)", cal: 70 },
  { cat: "diet", name: "훈제 닭가슴살 (100g)", cal: 110 },
  { cat: "diet", name: "두부 (반 모 150g)", cal: 130 },
  { cat: "diet", name: "닭가슴살 샐러드", cal: 220 },
  { cat: "diet", name: "사과 (1개)", cal: 100 },
  { cat: "diet", name: "바나나 (1개)", cal: 90 },
  { cat: "diet", name: "배 (1개)", cal: 160 },
  { cat: "diet", name: "방울토마토 (10알)", cal: 30 },
  { cat: "diet", name: "고구마 (중간 1개)", cal: 180 },
  { cat: "diet", name: "감자 (중간 1개)", cal: 130 },
  { cat: "diet", name: "견과류 (하루한봉 25g)", cal: 150 },
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

  const bmr = Math.round(
    gender === "male" ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161
  );
  const activityLevelObj = ACTIVITY_LEVELS.find((l) => l.value === activity) || ACTIVITY_LEVELS[1];
  const activityMult = activityLevelObj.mult;
  const activityLabel = activityLevelObj.label;
  const tdee = Math.round(bmr * activityMult);

  const diff = tw - w; // 목표체중 - 현재체중
  let goalCal;
  let mode;
  let adjustment = 0;

  if (diff <= -0.5) {
    adjustment = -500;
    goalCal = tdee + adjustment; // 감량
    mode = "감량";
  } else if (diff >= 0.5) {
    adjustment = +300;
    goalCal = tdee + adjustment; // 증량
    mode = "증량";
  } else {
    adjustment = 0;
    goalCal = tdee; // 유지
    mode = "유지";
  }

  const minCal = gender === "male" ? 1500 : 1200;
  goalCal = Math.max(minCal, Math.round(goalCal));
  const weeks = Math.abs(diff) >= 0.5 ? Math.ceil(Math.abs(diff) / 0.45) : 0;

  return { goalCal, mode, bmr, activityMult, activityLabel, tdee, adjustment, diff, weeks };
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
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [isHalf, setIsHalf] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileDraft, setProfileDraft] = useState(DEFAULT_PROFILE);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [entries, setEntries] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [input, setInput] = useState("");
  // meal은 더 이상 수동 선택하지 않고 입력 시각 기준으로 자동 결정됨
  const [mode, setMode] = useState(null); // null | 'search' | 'log' | 'manual'
  const [manualName, setManualName] = useState("");
  const [manualCal, setManualCal] = useState("");
  const [showRefModal, setShowRefModal] = useState(false);
  const [refCat, setRefCat] = useState("all");
  const [refSearch, setRefSearch] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      alert(
        "📱 [스마트폰 홈 화면에 앱 바로가기/설치 안내]\n\n" +
        "🤖 안드로이드 (카카오톡 등으로 접속 시):\n" +
        "1. 오른쪽 아래 메뉴(⋮ 또는 ⋯) ➔ [다른 브라우저로 열기] 선택\n" +
        "2. 오른쪽 상단 메뉴(⋮) ➔ [설치 및 바로가기 만들기] 클릭!\n\n" +
        "🍎 아이폰 (Safari):\n" +
        "하단 공유 버튼 ➔ [홈 화면에 추가] 클릭!"
      );
    }
  };
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [logSuggestions, setLogSuggestions] = useState([]);
  const [showWeekly, setShowWeekly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const loadEntriesForDate = useCallback((ds) => {
    try {
      const raw = localStorage.getItem(`foodlog:${ds}`);
      setEntries(raw ? JSON.parse(raw) : []);
    } catch {
      setEntries([]);
    }
  }, []);

  const selectDate = useCallback((ds) => {
    setSelectedDate(ds);
    loadEntriesForDate(ds);
  }, [loadEntriesForDate]);

  const loadToday = useCallback(async () => {
    loadEntriesForDate(selectedDate);
  }, [loadEntriesForDate, selectedDate]);

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

  function selectRefFood(item) {
    if (mode === "manual") {
      setManualName(item.name);
      setManualCal(String(item.cal));
    } else {
      setSearchText(item.name);
      const finalCal = isHalf ? Math.round(item.cal * 0.5) : item.cal;
      const finalName = isHalf ? `${item.name} (1/2)` : item.name;
      setSearchResult({ name: finalName, calories: finalCal, source: "db" });
    }
    setShowRefModal(false);
  }



  async function doSearch() {
    if (!searchText.trim() || searchLoading) return;
    setSearchLoading(true);
    setSearchResult(null);
    let result = matchLocalFood(searchText);
    if (!result) {
      result = await estimateWithAI(searchText);
    }
    if (isHalf) {
      result = {
        ...result,
        name: `${result.name} (1/2)`,
        calories: Math.round(result.calories * 0.5),
      };
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
    let finalCal = result.calories;
    let finalName = result.name;
    if (isHalf) {
      finalCal = Math.round(finalCal * 0.5);
      finalName = `${finalName} (1/2)`;
    }
    const now = new Date();
    const entry = {
      id: Date.now(),
      name: finalName,
      calories: finalCal,
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
    setIsHalf(false); // 매번 추가 후 기본값(1인분)으로 리셋
    setLoading(false);
    try {
      localStorage.setItem(`foodlog:${selectedDate}`, JSON.stringify(next));
    } catch {
      // storage failed, keep in-memory state
    }
    loadWeekly();
  }

  async function addManualEntry() {
    if (!manualName.trim() || !manualCal) return;
    const rawCal = Number(manualCal);
    if (isNaN(rawCal) || rawCal <= 0) return;

    let finalCal = Math.round(rawCal);
    let finalName = manualName.trim();
    if (isHalf) {
      finalCal = Math.round(finalCal * 0.5);
      finalName = `${finalName} (1/2)`;
    }

    const now = new Date();
    const entry = {
      id: Date.now(),
      name: finalName,
      calories: finalCal,
      meal: getAutoMeal(now),
      source: "manual",
      time: now.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    const next = [...entries, entry];
    setEntries(next);
    setManualName("");
    setManualCal("");
    setIsHalf(false);
    setMode(null);
    try {
      localStorage.setItem(`foodlog:${selectedDate}`, JSON.stringify(next));
    } catch {
      // storage failed, keep state
    }
    loadWeekly();
  }

  async function deleteEntry(id) {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    try {
      localStorage.setItem(`foodlog:${selectedDate}`, JSON.stringify(next));
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
        fontFamily: "'Jua', 'Gowun Dodum', sans-serif",
      }}
      className="w-full max-w-2xl mx-auto p-4 md:p-6"
    >
      {/* Header */}
      <div style={{ borderBottom: `3px solid ${COLOR.ink}` }} className="pb-2 mb-4 flex items-center justify-between">
        <div>
          <h1
            style={{
              fontFamily: "'Jua', sans-serif",
              letterSpacing: "0.02em",
            }}
            className="text-2xl font-semibold leading-tight"
          >
            Calorie Diary
          </h1>
          <div style={{ color: COLOR.inkDim, fontSize: "0.8rem" }}>{todayStr()}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleInstallApp}
            style={{
              fontFamily: "'Jua', sans-serif",
              border: `1px solid ${COLOR.brand}`,
              background: "#FFF0E6",
              color: COLOR.brand,
            }}
            className="px-2.5 py-1.5 text-xs flex items-center gap-1 hover:bg-orange-100 rounded-full transition-all shadow-sm"
          >
            📲 앱 설치
          </button>
          <button
            onClick={() => setShowProfileForm(true)}
            style={{
              fontFamily: "'Jua', sans-serif",
              border: `1px solid ${COLOR.line}`,
              background: COLOR.paperDim,
              color: COLOR.ink,
            }}
            className="px-3 py-1.5 text-xs flex items-center gap-1 hover:bg-amber-100 rounded-full transition-colors"
          >
            ⚙️ 프로필 / 목표
          </button>
        </div>
      </div>

      {/* Profile & Settings Modal */}
      {showProfileForm && (
        <div
          style={{ background: "rgba(0, 0, 0, 0.4)" }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            style={{ background: COLOR.paper, border: `2px solid ${COLOR.ink}` }}
            className="w-full max-w-md p-5 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto text-sm"
          >
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <span className="font-semibold text-base" style={{ color: COLOR.ink }}>
                ⚙️ 프로필 & 목표 설정
              </span>
              <button
                type="button"
                onClick={() => {
                  if (profile) setProfileDraft(profile);
                  setShowProfileForm(false);
                }}
                style={{ color: COLOR.inkDim, fontSize: "0.9rem" }}
                className="px-2 py-0.5 hover:opacity-80 font-bold"
              >
                ✕
              </button>
            </div>

            {/* 현재 프로필 수치 요약 */}
            {profile && goalInfo && (
              <div
                style={{ border: `1px solid ${COLOR.line}`, background: COLOR.paperDim }}
                className="p-3 mb-4 rounded text-xs grid grid-cols-2 md:grid-cols-4 gap-2 text-center"
              >
                <div>
                  <div style={{ color: COLOR.inkDim, fontSize: "0.65rem" }}>기초대사량 (BMR)</div>
                  <div className="font-semibold">{goalInfo.bmr.toLocaleString()} kcal</div>
                </div>
                <div>
                  <div style={{ color: COLOR.inkDim, fontSize: "0.65rem" }}>활동 계수</div>
                  <div className="font-semibold text-amber-700">x {goalInfo.activityMult}배</div>
                </div>
                <div>
                  <div style={{ color: COLOR.inkDim, fontSize: "0.65rem" }}>활동소비 (TDEE)</div>
                  <div className="font-semibold">{goalInfo.tdee.toLocaleString()} kcal</div>
                </div>
                <div>
                  <div style={{ color: COLOR.inkDim, fontSize: "0.65rem" }}>목표 칼로리</div>
                  <div className="font-semibold text-emerald-700">
                    {goalInfo.goalCal.toLocaleString()} kcal
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 mb-3">
              {[
                { value: "female", label: "여성" },
                { value: "male", label: "남성" },
              ].map((g) => (
                <button
                  key={g.value}
                  onClick={() => setProfileDraft({ ...profileDraft, gender: g.value })}
                  style={{
                    fontFamily: "'Jua', sans-serif",
                    fontSize: "0.8rem",
                    border: `1px solid ${
                      profileDraft.gender === g.value ? COLOR.ink : COLOR.line
                    }`,
                    background: profileDraft.gender === g.value ? COLOR.ink : "transparent",
                    color: profileDraft.gender === g.value ? COLOR.paper : COLOR.inkDim,
                  }}
                  className="flex-1 py-1.5 rounded"
                >
                  {g.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { key: "age", label: "나이" },
                { key: "height", label: "키 (cm)" },
                { key: "currentWeight", label: "현재 체중 (kg)" },
                { key: "targetWeight", label: "목표 체중 (kg)" },
              ].map((f) => (
                <label key={f.key} className="block">
                  <span style={{ color: COLOR.inkDim, fontSize: "0.75rem" }}>{f.label}</span>
                  <input
                    type="number"
                    value={profileDraft[f.key]}
                    onChange={(e) =>
                      setProfileDraft({ ...profileDraft, [f.key]: e.target.value })
                    }
                    style={{ border: `1px solid ${COLOR.line}`, background: "white", fontSize: "16px" }}
                    className="w-full px-2 py-1.5 mt-0.5 rounded"
                  />
                </label>
              ))}
            </div>

            <span style={{ color: COLOR.inkDim, fontSize: "0.75rem" }}>활동량 선택 (활동 계수 반영)</span>
            <div className="grid grid-cols-2 gap-1.5 mt-1 mb-4">
              {ACTIVITY_LEVELS.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setProfileDraft({ ...profileDraft, activity: a.value })}
                  style={{
                    fontFamily: "'Jua', sans-serif",
                    fontSize: "0.75rem",
                    border: `1px solid ${
                      profileDraft.activity === a.value ? COLOR.ink : COLOR.line
                    }`,
                    background: profileDraft.activity === a.value ? COLOR.ink : "transparent",
                    color: profileDraft.activity === a.value ? COLOR.paper : COLOR.inkDim,
                  }}
                  className="px-2 py-1.5 text-center rounded"
                >
                  {a.label}
                </button>
              ))}
            </div>

            {/* 실시간 계산 미리보기 박스 */}
            {(() => {
              const draftCalc = calcGoalCalories(profileDraft);
              if (!draftCalc) return null;
              return (
                <div
                  style={{ border: `1px dashed ${COLOR.line}`, background: "#F8F9FA" }}
                  className="p-2.5 mb-4 text-xs rounded"
                >
                  <div className="font-semibold mb-1 text-slate-700">📊 계산 결과 미리보기:</div>
                  <div className="grid grid-cols-2 gap-1 text-slate-600">
                    <div>기초대사량: <b>{draftCalc.bmr.toLocaleString()} kcal</b></div>
                    <div>활동계수: <b className="text-amber-600">x {draftCalc.activityMult}배</b></div>
                    <div>일일소비: <b>{draftCalc.tdee.toLocaleString()} kcal</b></div>
                    <div>목표: <b className="text-emerald-600">{draftCalc.goalCal.toLocaleString()} kcal</b></div>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => {
                  if (profile) setProfileDraft(profile);
                  setShowProfileForm(false);
                }}
                style={{
                  color: COLOR.inkDim,
                  fontSize: "0.8rem",
                  border: `1px solid ${COLOR.line}`,
                }}
                className="px-3 py-1.5 rounded hover:bg-gray-100"
              >
                닫기 / 취소
              </button>
              <button
                onClick={() => {
                  saveProfile();
                  setShowProfileForm(false);
                }}
                style={{
                  fontFamily: "'Jua', sans-serif",
                  background: COLOR.ink,
                  color: COLOR.paper,
                }}
                className="px-4 py-1.5 text-xs rounded font-medium"
              >
                저장하고 적용
              </button>
            </div>
          </div>
        </div>
      )}
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
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
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
            <div
              style={{
                fontFamily: "'Jua', sans-serif",
                fontSize: "1.35rem",
                fontWeight: 700,
                color: COLOR.ink,
                lineHeight: 1.05,
              }}
            >
              {total.toLocaleString()}
            </div>
            <div style={{ fontFamily: "'Jua', sans-serif", color: COLOR.inkDim, fontSize: "0.65rem" }}>
              kcal
            </div>
            <div style={{ color: statusColor, fontSize: "0.7rem", fontWeight: 600, marginTop: "1px" }}>
              {Math.round(ratio * 100)}%
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div
            style={{ color: statusColor, fontFamily: "'Jua', sans-serif", fontWeight: 600 }}
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

      {/* Input Mode Selector */}
      <div style={{ borderTop: `1px solid ${COLOR.line}`, borderBottom: `1px solid ${COLOR.line}` }} className="py-4 mb-6">
        {mode === null && (
          <div className="flex flex-wrap items-center gap-2">
            {/* 주 메인 버튼 (Primary CTA) */}
            <button
              onClick={() => {
                setMode("log");
                setIsHalf(false);
              }}
              style={{
                fontFamily: "'Jua', sans-serif",
                background: COLOR.ink,
                color: COLOR.paper,
              }}
              className="flex-[2] py-3 px-3 text-sm font-medium flex items-center justify-center gap-1.5 hover:opacity-90"
            >
              <span>✏️ 뭐 먹었더라?</span>
            </button>

            {/* 보조 버튼 (Secondary Ghost Button) */}
            <button
              onClick={() => {
                setMode("search");
                setSearchText("");
                setSearchResult(null);
                setIsHalf(false);
              }}
              style={{
                fontFamily: "'Jua', sans-serif",
                border: `1px solid ${COLOR.line}`,
                background: COLOR.paperDim,
                color: COLOR.inkDim,
              }}
              className="flex-1 py-3 px-2 text-xs flex items-center justify-center gap-1 hover:bg-gray-200 transition-colors"
            >
              <span>🔍 칼로리만 계산</span>
            </button>

            {/* 수동 직접 입력 버튼 */}
            <button
              onClick={() => {
                setMode("manual");
                setManualName("");
                setManualCal("");
                setIsHalf(false);
              }}
              style={{
                fontFamily: "'Jua', sans-serif",
                border: `1px solid ${COLOR.line}`,
                background: "white",
                color: COLOR.ink,
              }}
              className="flex-1 py-3 px-2 text-xs flex items-center justify-center gap-1 hover:bg-gray-100 transition-colors"
            >
              <span>⚙️ 직접 입력</span>
            </button>
          </div>
        )}

        {mode === "manual" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: "'Jua', sans-serif", fontSize: "0.8rem", color: COLOR.ink }}>
                  ✏️ 칼로리 직접 수동입력
                </span>
                <button
                  type="button"
                  onClick={() => setShowRefModal(true)}
                  style={{
                    fontFamily: "'Jua', sans-serif",
                    border: `1px solid ${COLOR.line}`,
                    background: COLOR.paperDim,
                    color: COLOR.brick,
                  }}
                  className="px-2 py-0.5 text-xs rounded hover:bg-amber-100 transition-colors"
                >
                  💡 칼로리 참고표 보기
                </button>
              </div>
              <button
                onClick={() => {
                  setMode(null);
                  setIsHalf(false);
                }}
                style={{ color: COLOR.inkDim, fontSize: "0.75rem" }}
                className="py-1.5 px-1"
              >
                ← 뒤로
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <input
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="음식 이름 (예: 엄마표 볶음밥)"
                style={{ border: `1px solid ${COLOR.line}`, background: "white", fontSize: "16px" }}
                className="w-full px-3 py-2"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={manualCal}
                  onChange={(e) => setManualCal(e.target.value)}
                  placeholder="칼로리 (kcal)"
                  style={{ border: `1px solid ${COLOR.line}`, background: "white", fontSize: "16px" }}
                  className="w-full px-3 py-2"
                />
                <button
                  onClick={addManualEntry}
                  disabled={!manualName.trim() || !manualCal}
                  style={{
                    fontFamily: "'Jua', sans-serif",
                    background: !manualName.trim() || !manualCal ? COLOR.inkDim : COLOR.ink,
                    color: COLOR.paper,
                  }}
                  className="px-4 py-2 text-sm flex-shrink-0"
                >
                  등록
                </button>
              </div>
            </div>
            {/* 음식을 고른 후 체크하는 1/2 옵션 */}
            <div className="mt-2.5 flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
                <input
                  type="checkbox"
                  checked={isHalf}
                  onChange={(e) => setIsHalf(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 rounded"
                />
                <span style={{ color: isHalf ? COLOR.brick : COLOR.inkDim, fontWeight: isHalf ? 600 : 400 }}>
                  🥣 1/2 섭취 (50% 칼로리로 계산)
                </span>
              </label>
              <span style={{ fontSize: "0.7rem", color: COLOR.inkDim }}>
                {isHalf ? "50% 적용 중" : "기본 1인분"}
              </span>
            </div>
          </div>
        )}

        {mode === "search" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  style={{ fontFamily: "'Jua', sans-serif", fontSize: "0.8rem", color: COLOR.turmeric }}
                >
                  칼로리만 계산 · 기록되지 않음
                </span>
                <button
                  type="button"
                  onClick={() => setShowRefModal(true)}
                  style={{
                    fontFamily: "'Jua', sans-serif",
                    border: `1px solid ${COLOR.line}`,
                    background: COLOR.paperDim,
                    color: COLOR.brick,
                  }}
                  className="px-2 py-0.5 text-xs rounded hover:bg-amber-100 transition-colors"
                >
                  💡 칼로리 참고표 보기
                </button>
              </div>
              <button
                onClick={() => {
                  setMode(null);
                  setIsHalf(false);
                }}
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
                  placeholder="예: 삼겹살"
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
                          const finalCal = isHalf ? Math.round(s.cal * 0.5) : s.cal;
                          const finalName = isHalf ? `${s.name} (1/2)` : s.name;
                          setSearchResult({ name: finalName, calories: finalCal, source: "db" });
                        }}
                        style={{ borderBottom: `1px solid ${COLOR.paperDim}` }}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-left hover:bg-gray-50"
                      >
                        <span>{s.name}</span>
                        <span style={{ color: COLOR.inkDim, fontSize: "0.75rem" }}>
                          {isHalf ? Math.round(s.cal * 0.5) : s.cal} kcal
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
                  fontFamily: "'Jua', sans-serif",
                  border: `1px solid ${COLOR.ink}`,
                  color: COLOR.ink,
                }}
                className="px-4 py-2 text-sm"
              >
                {searchLoading ? "확인 중…" : "검색"}
              </button>
            </div>
            {/* 음식을 고른 후 체크하는 1/2 옵션 */}
            <div className="mt-2.5 flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
                <input
                  type="checkbox"
                  checked={isHalf}
                  onChange={(e) => setIsHalf(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 rounded"
                />
                <span style={{ color: isHalf ? COLOR.brick : COLOR.inkDim, fontWeight: isHalf ? 600 : 400 }}>
                  🥣 1/2 섭취 (50% 칼로리로 계산)
                </span>
              </label>
              <span style={{ fontSize: "0.7rem", color: COLOR.inkDim }}>
                {isHalf ? "50% 적용 중" : "기본 1인분"}
              </span>
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
                <span style={{ fontFamily: "'Jua', sans-serif", fontWeight: 600 }}>
                  {searchResult.calories} kcal
                </span>
              </div>
            )}
          </div>
        )}

        {mode === "log" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontFamily: "'Jua', sans-serif", fontSize: "0.8rem", color: COLOR.inkDim }}>
                식사 기록하기
              </span>
              <button
                onClick={() => {
                  setMode(null);
                  setIsHalf(false);
                }}
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
                  placeholder="음식 이름 입력 (예: 김치찌개)"
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
                  fontFamily: "'Jua', sans-serif",
                  background: loading ? COLOR.inkDim : COLOR.ink,
                  color: COLOR.paper,
                }}
                className="px-4 py-2 text-sm"
              >
                {loading ? "계산 중…" : "추가"}
              </button>
            </div>
            {/* 음식을 고른 후 체크하는 1/2 옵션 */}
            <div className="mt-2.5 flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
                <input
                  type="checkbox"
                  checked={isHalf}
                  onChange={(e) => setIsHalf(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 rounded"
                />
                <span style={{ color: isHalf ? COLOR.brick : COLOR.inkDim, fontWeight: isHalf ? 600 : 400 }}>
                  🥣 1/2 섭취 (50% 칼로리로 계산)
                </span>
              </label>
              <span style={{ fontSize: "0.7rem", color: COLOR.inkDim }}>
                {isHalf ? "50% 적용 중" : "기본 1인분"}
              </span>
            </div>
          </div>
        )}

        <div style={{ color: COLOR.inkDim, fontSize: "0.7rem" }} className="mt-2">
          DB에 없는 음식은 자동으로 추정 계산됩니다
        </div>
      </div>

      {/* Today's list */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div
            style={{ fontFamily: "'Jua', sans-serif", fontSize: "0.8rem", color: COLOR.ink }}
            className="font-semibold"
          >
            {selectedDate === todayStr() ? "오늘 기록" : `${selectedDate} 기록`} ({entries.length})
          </div>
          {selectedDate !== todayStr() && (
            <button
              onClick={() => selectDate(todayStr())}
              style={{ color: COLOR.olive, fontSize: "0.75rem" }}
              className="font-semibold underline hover:opacity-80"
            >
              오늘로 돌아가기 ↩
            </button>
          )}
        </div>
        {entries.length === 0 && !ready ? null : entries.length === 0 ? (
          <div style={{ color: COLOR.inkDim, fontSize: "0.85rem" }} className="py-4">
            {selectedDate === todayStr()
              ? "아직 기록이 없습니다. 위에서 먹은 음식을 입력해보세요."
              : `${selectedDate}에 등록된 식사 기록이 없습니다.`}
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
                      fontFamily: "'Jua', sans-serif",
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

      {/* Weekly chart (Collapsible Accordion) */}
      <div style={{ borderTop: `1px solid ${COLOR.line}` }} className="pt-4 mt-6">
        <button
          onClick={() => setShowWeekly(!showWeekly)}
          style={{
            fontFamily: "'Jua', sans-serif",
            background: COLOR.paperDim,
            border: `1px solid ${COLOR.line}`,
            color: COLOR.ink,
          }}
          className="w-full py-2.5 px-4 text-xs font-medium flex items-center justify-between rounded hover:bg-gray-200 transition-colors"
        >
          <span>📊 최근 7일 섭취 추이 그래프</span>
          <span>{showWeekly ? "▴ 접기" : "▾ 펼쳐보기"}</span>
        </button>

        {showWeekly && (
          <div className="mt-3 p-3 border rounded bg-white">
            {(() => {
              const maxCalorieInWeekly = Math.max(...weekly.map((d) => d.calories || 0), 0);
              const yMax = Math.ceil(Math.max(maxCalorieInWeekly, goal || 2000) * 1.15);
              return (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      style={{ fontFamily: "'Jua', sans-serif", fontSize: "0.8rem", color: COLOR.inkDim }}
                    >
                      최근 7일 추이
                    </div>
                    <span style={{ fontSize: "0.7rem", color: COLOR.inkDim }}>
                      💡 막대를 클릭하여 해당 날짜 기록 확인
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 170 }}>
                    <ResponsiveContainer>
                      <BarChart
                        data={weekly}
                        margin={{ top: 16, right: 4, left: -15, bottom: 0 }}
                        onClick={(state) => {
                          if (state && state.activePayload && state.activePayload.length) {
                            const targetDate = state.activePayload[0].payload.date;
                            if (targetDate) selectDate(targetDate);
                          }
                        }}
                      >
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
                            stroke={COLOR.olive}
                            strokeWidth={2}
                            label={{
                              value: `목표 ${goal.toLocaleString()}kcal`,
                              fill: COLOR.olive,
                              fontSize: 10,
                              position: "top",
                              fontWeight: 600,
                            }}
                          />
                        )}
                        <Bar dataKey="calories" radius={[2, 2, 0, 0]}>
                          {weekly.map((d, i) => {
                            const isSelected = d.date === selectedDate;
                            return (
                              <Cell
                                key={i}
                                cursor="pointer"
                                onClick={() => selectDate(d.date)}
                                stroke={isSelected ? COLOR.ink : "none"}
                                strokeWidth={isSelected ? 2 : 0}
                                fill={
                                  isSelected
                                    ? (d.calories > goal ? "#B91C1C" : COLOR.ink)
                                    : (d.calories > goal ? COLOR.brick : COLOR.turmeric)
                                }
                              />
                            );
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
      {/* Calorie Reference Book Modal */}
      {showRefModal && (
        <div
          style={{ background: "rgba(0, 0, 0, 0.4)" }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4"
        >
          <div
            style={{ background: COLOR.paper, border: `2px solid ${COLOR.ink}` }}
            className="w-full max-w-xl p-4 md:p-5 rounded-lg shadow-xl max-h-[85vh] flex flex-col text-sm"
          >
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <div>
                <span className="font-semibold text-base" style={{ color: COLOR.ink }}>
                  📖 한눈에 보는 칼로리 백과 참고표
                </span>
                <div style={{ color: COLOR.inkDim, fontSize: "0.75rem" }}>
                  💡 항목을 누르면 현재 입력칸에 음식명과 칼로리가 바로 채워집니다
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRefModal(false)}
                style={{ color: COLOR.inkDim, fontSize: "0.9rem" }}
                className="px-2 py-0.5 hover:opacity-80 font-bold"
              >
                ✕
              </button>
            </div>

            {/* 실시간 검색창 */}
            <div className="mb-3">
              <input
                type="text"
                value={refSearch}
                onChange={(e) => setRefSearch(e.target.value)}
                placeholder="🔍 참고표 내 음식 빠른 검색 (예: 찌개, 삼겹살, 라면...)"
                style={{ border: `1px solid ${COLOR.line}`, background: "white" }}
                className="w-full px-3 py-1.5 text-xs rounded"
              />
            </div>

            {/* 카테고리 탭 */}
            <div className="flex flex-wrap gap-1 mb-3 pb-1 border-b">
              {CALORIE_REFERENCE_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setRefCat(c.id)}
                  style={{
                    fontFamily: "'Jua', sans-serif",
                    fontSize: "0.75rem",
                    border: `1px solid ${refCat === c.id ? COLOR.ink : COLOR.line}`,
                    background: refCat === c.id ? COLOR.ink : "transparent",
                    color: refCat === c.id ? COLOR.paper : COLOR.inkDim,
                  }}
                  className="px-2 py-1 rounded transition-colors"
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* 음식 리스트 목록 */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {CALORIE_REFERENCE_ITEMS.filter((item) => {
                const matchCat = refCat === "all" || item.cat === refCat;
                const matchQuery =
                  !refSearch.trim() || item.name.toLowerCase().includes(refSearch.trim().toLowerCase());
                return matchCat && matchQuery;
              }).map((item) => (
                <button
                  key={item.name}
                  onClick={() => selectRefFood(item)}
                  style={{ border: `1px solid ${COLOR.line}`, background: "white" }}
                  className="flex items-center justify-between p-2 rounded text-left hover:border-amber-500 hover:bg-amber-50 transition-colors"
                >
                  <span className="font-medium text-xs text-slate-800">{item.name}</span>
                  <span
                    style={{ fontFamily: "'Jua', sans-serif", color: COLOR.brick }}
                    className="text-xs font-semibold"
                  >
                    {item.cal} kcal
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t mt-3">
              <button
                type="button"
                onClick={() => setShowRefModal(false)}
                style={{
                  color: COLOR.inkDim,
                  fontSize: "0.75rem",
                  border: `1px solid ${COLOR.line}`,
                }}
                className="px-3 py-1 rounded hover:bg-gray-100"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
