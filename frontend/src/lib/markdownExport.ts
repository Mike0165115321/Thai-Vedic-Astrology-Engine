/**
 * markdownExport.ts
 * Utility functions to generate Markdown (.md) exports for
 * - Natal Chart (ดวงกำเนิด)
 * - Transit Planets (ดาวจร)
 */

// ─── Thai name maps ────────────────────────────────────────────────
const PLANET_TH: Record<string, string> = {
  Sun: "อาทิตย์", Moon: "จันทร์", Mars: "อังคาร", Mercury: "พุธ",
  Jupiter: "พฤหัสบดี", Venus: "ศุกร์", Saturn: "เสาร์", Rahu: "ราหู",
  Ketu: "เกตุ", Uranus: "มฤตยู", Neptune: "เนปจูน", Pluto: "พลูโต",
};

const PLANET_NUM: Record<string, string> = {
  Sun: "๑", Moon: "๒", Mars: "๓", Mercury: "๔",
  Jupiter: "๕", Venus: "๖", Saturn: "๗", Rahu: "๘",
  Ketu: "๙", Uranus: "๐",
};

const SIGN_TH = [
  "เมษ", "พฤษภ", "เมถุน", "กรกฎ", "สิงห์", "กันย์",
  "ตุลย์", "พิจิก", "ธนู", "มังกร", "กุมภ์", "มีน",
];

const HOUSE_TH = [
  "ตนุ", "กดุมภะ", "สหัชชะ", "พันธุ", "ปุตตะ", "อริ",
  "ปัตนิ", "มรณะ", "ศุภะ", "กัมมะ", "ลาภะ", "วินาศ",
];

const NAKSHATRA_TH: Record<string, string> = {
  "Ashwini": "อัศวินี", "Bharani": "ภรณี", "Krittika": "กฤติกา", "Rohini": "โรหิณี",
  "Mrigashira": "มฤคศิระ", "Ardra": "อารทรา", "Punarvasu": "ปุนัพพสุ", "Pushya": "ปุษยะ",
  "Ashlesha": "อศิเลษา", "Magha": "มฆา", "Purva Phalguni": "บุพพผลคุนี", "Uttara Phalguni": "อุตตรผลคุนี",
  "Hasta": "หัสตะ", "Chitra": "จิตรา", "Swati": "สวาตี", "Vishakha": "วิสาขา",
  "Anuradha": "อนุราธา", "Jyeshtha": "เชษฐา", "Mula": "มูละ", "Purva Ashadha": "บุพพอาษาฬหะ",
  "Uttara Ashadha": "อุตตราษาฬหะ", "Shravana": "ศรวณะ", "Dhanishta": "ธนิษฐา", "Shatabhisha": "ศตภิษัช",
  "Purva Bhadrapada": "บุพพภัทรบท", "Uttara Bhadrapada": "อุตตรภัทรบท", "Revati": "เรวดี",
};

// ─── Helpers ───────────────────────────────────────────────────────
const thSign = (n: number) => SIGN_TH[(n - 1) % 12] ?? "-";
const thHouse = (n: number) => HOUSE_TH[(n - 1) % 12] ?? "-";
const thPlanet = (k: string) => PLANET_TH[k] ?? k;
const thNakshatra = (k: string) => NAKSHATRA_TH[k] ?? k;

function fmtDeg(lon: number): string {
  const degInSign = lon % 30;
  const deg = Math.floor(degInSign);
  const min = Math.floor((degInSign - deg) * 60);
  return `${deg}°${min.toString().padStart(2, "0")}'`;
}

function hr(char = "-", len = 60) {
  return char.repeat(len);
}

// ─── ExportConfig type mirror (avoid circular imports) ────────────
interface SectionConfig {
  basicInfo: boolean;
  planetTable: boolean;
  yogas: boolean;
  dasha: boolean;
}
interface ColConfig {
  degrees: boolean;
  house: boolean;
  lordship: boolean;
  d1: boolean;
  d3: boolean;
  d9: boolean;
  nakshatra: boolean;
}
interface MDConfig {
  sections: SectionConfig;
  tableColumns: ColConfig;
}

// ─── Natal Chart Markdown ─────────────────────────────────────────
export function generateNatalMarkdown(
  natal: any,
  birth: any,
  config?: MDConfig
): string {
  const sec = config?.sections;
  const col = config?.tableColumns;

  const name = natal?.name ?? birth?.name ?? "ไม่ระบุชื่อ";
  const dateStr = birth
    ? `${birth.day}/${birth.month}/${birth.year + 543} เวลา ${String(birth.hour).padStart(2, "0")}:${String(birth.minute).padStart(2, "0")} น.`
    : "-";
  const locStr = birth?.location ?? (birth ? `${birth.lat?.toFixed(4)}, ${birth.lon?.toFixed(4)}` : "-");

  const lines: string[] = [];

  lines.push(`# 🌟 ดวงกำเนิด — ${name}`);
  lines.push("");
  lines.push(`> **AETOX ASTRO ENGINE** | สร้างเมื่อ: ${new Date().toLocaleString("th-TH")}`);
  lines.push("");

  // ── Basic Info
  if (!sec || sec.basicInfo) {
    lines.push(`## ข้อมูลพื้นฐาน`);
    lines.push("");
    lines.push(`| รายการ | ข้อมูล |`);
    lines.push(`|--------|--------|`);
    lines.push(`| **ชื่อ** | ${name} |`);
    lines.push(`| **วันเกิด** | ${dateStr} |`);
    lines.push(`| **สถานที่** | ${locStr} |`);
    if (natal?.lagna) {
      lines.push(`| **ลัคนา (D1)** | ${thSign(natal.lagna.sign)} ${fmtDeg(natal.lagna.longitude)} |`);
    }
    if (natal?.d3_lagna) {
      lines.push(`| **ลัคนา (D3)** | ${thSign(natal.d3_lagna.sign)} |`);
    }
    if (natal?.d9_lagna) {
      lines.push(`| **ลัคนา (D9)** | ${thSign(natal.d9_lagna.sign)} |`);
    }

    // Inthaphas / Batchan
    if (natal?.advanced_analysis) {
      const aa = natal.advanced_analysis;
      lines.push(`| 👑 **ดาวอินทภาส (วาสนา)** | ดาว${thPlanet(aa.inthaphas?.planet)} |`);
      lines.push(`| ⭐ **ดาวบาทจันทร์ (โชคลาภ)** | ดาว${thPlanet(aa.batchan?.planet)} |`);
      if (aa.is_dual_lord) {
        lines.push(`| 💎 **สถานะพิเศษ** | ดาวดวงเดียวกันคุมทั้งสองตำแหน่ง (วาสนาสูงส่งพิเศษ) |`);
      }
    }
    lines.push("");
  }

  // ── Planet Table
  if (!sec || sec.planetTable) {
    lines.push(`## ตารางดาวสถิต`);
    lines.push("");

    // Build header
    const headers: string[] = ["ดาว (หมายเลข)"];
    if (!col || col.degrees) headers.push("องศา");
    if (!col || col.house) headers.push("ภพสถิต");
    if (!col || col.lordship) headers.push("เจ้าเรือน");
    if (!col || col.d1) headers.push("D1 ราศี");
    if (!col || col.d3) headers.push("D3 ตรียางศ์");
    if (!col || col.d9) headers.push("D9 นวางศ์");
    if (!col || col.nakshatra) headers.push("นักษัตร / บาท");

    lines.push(`| ${headers.join(" | ")} |`);
    lines.push(`| ${headers.map(() => "---").join(" | ")} |`);

    const planets = natal?.planets ?? {};
    for (const [pName, p] of Object.entries<any>(planets)) {
      const row: string[] = [];
      const num = PLANET_NUM[pName] ?? "";
      const inthLabel = natal?.advanced_analysis?.inthaphas?.planet === pName ? " 👑" : "";
      const batchLabel = natal?.advanced_analysis?.batchan?.planet === pName ? " ⭐" : "";
      row.push(`${num} ${thPlanet(pName)}${inthLabel}${batchLabel}`);

      if (!col || col.degrees) row.push(fmtDeg(p.longitude));
      if (!col || col.house) row.push(`${p.house} (${thHouse(p.house)})`);
      if (!col || col.lordship) {
        const lords = p.lordships?.map((l: any) => l.name).join(", ") ?? "-";
        row.push(lords);
      }
      if (!col || col.d1) {
        const d1Dignity = (p.dignity_list ?? []).filter((d: string) => d !== "ปกติ").join(", ") || "ปกติ";
        row.push(`${thSign(p.sign)} (${d1Dignity})`);
      }
      if (!col || col.d3) {
        const d3 = natal?.d3?.[pName];
        const d3Dig = d3 ? ((d3.dignity_list ?? []).filter((d: string) => d !== "ปกติ").join(", ") || "ปกติ") : "-";
        row.push(d3 ? `${thSign(d3.sign)} (${d3Dig})` : "-");
      }
      if (!col || col.d9) {
        const d9 = natal?.d9?.[pName];
        const d9Dig = d9 ? ((d9.dignity_list ?? []).filter((d: string) => d !== "ปกติ").join(", ") || "ปกติ") : "-";
        row.push(d9 ? `${thSign(d9.sign)} (${d9Dig})` : "-");
      }
      if (!col || col.nakshatra) {
        const nk = natal?.lunar_data?.planet_nakshatras?.[pName];
        row.push(nk ? `${thNakshatra(nk.name)} บาทที่ ${nk.pada}` : "-");
      }
      lines.push(`| ${row.join(" | ")} |`);
    }

    // Lagna row
    if (natal?.lagna) {
      const lagnaRow: string[] = ["**ลัคนา**"];
      if (!col || col.degrees) lagnaRow.push(fmtDeg(natal.lagna.longitude));
      if (!col || col.house) lagnaRow.push("1 (ตนุ)");
      if (!col || col.lordship) {
        const lord = natal?.house_lords?.[1]?.planet ? thPlanet(natal.house_lords[1].planet) : "-";
        lagnaRow.push(lord);
      }
      if (!col || col.d1) lagnaRow.push(`${thSign(natal.lagna.sign)}`);
      if (!col || col.d3) lagnaRow.push(natal?.d3_lagna ? `${thSign(natal.d3_lagna.sign)}` : "-");
      if (!col || col.d9) lagnaRow.push(natal?.d9_lagna ? `${thSign(natal.d9_lagna.sign)}` : "-");
      if (!col || col.nakshatra) {
        const nkL = natal?.lunar_data?.lagna_nakshatra;
        lagnaRow.push(nkL ? `${thNakshatra(nkL.name)} บาทที่ ${nkL.pada}` : "-");
      }
      lines.push(`| ${lagnaRow.join(" | ")} |`);
    }
    lines.push("");
    lines.push(`> **D1** = ราศีจักรหลัก | **D3** = ตรียางศ์ (ความเข้มแข็งลึก) | **D9** = นวางศ์ (ไส้ชะตา)`);
    lines.push("");
  }

  // ── Yogas
  if ((!sec || sec.yogas) && natal?.yogas?.length > 0) {
    lines.push(`## โยค และเกณฑ์ชะตาพิเศษ`);
    lines.push("");
    lines.push(`| โยค | ดาว | ประเภท | คำอธิบาย |`);
    lines.push(`|-----|-----|--------|----------|`);
    for (const y of natal.yogas) {
      const type = y.score < 0 ? "❌ จุดเสีย" : "✅ จุดเด่น";
      const planet = y.planet ? thPlanet(y.planet) : "-";
      lines.push(`| **${y.name}** | ${planet} | ${type} | ${y.description} |`);
    }
    lines.push("");
  }

  // ── Dasha
  if ((!sec || sec.dasha) && natal?.dasha_timeline) {
    lines.push(`## ลำดับมหาทศา (Vimshottari Dasha)`);
    lines.push("");
    lines.push(`| # | มหาทศา | เริ่ม | สิ้นสุด | ระยะ (ปี) | หมายเหตุ |`);
    lines.push(`|---|--------|-------|---------|-----------|---------|`);
    natal.dasha_timeline.slice(0, 9).forEach((d: any, i: number) => {
      const start = new Date(d.start).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
      const end = new Date(d.end).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
      const isMaster =
        natal.advanced_analysis?.inthaphas?.planet === d.planet ||
        natal.advanced_analysis?.batchan?.planet === d.planet;
      const note = isMaster ? "⭐ ดาวคุมชะตาทำงาน" : "";
      const num = PLANET_NUM[d.planet] ?? "";
      lines.push(`| ${i + 1} | ${num} ดาว${thPlanet(d.planet)} | ${start} | ${end} | ${d.duration} | ${note} |`);
    });
    lines.push("");
  }

  lines.push(hr());
  lines.push(`*รายงานจาก AETOX ASTRO ENGINE v1.0 | สร้างเมื่อ ${new Date().toLocaleString("th-TH")}*`);

  return lines.join("\n");
}

// ─── Transit Planets Markdown ─────────────────────────────────────
export function generateTransitMarkdown(
  transitChart: any,
  transitDate?: Date
): string {
  const lines: string[] = [];
  const dateLabel = transitDate
    ? transitDate.toLocaleString("th-TH")
    : new Date().toLocaleString("th-TH");

  lines.push(`# 🪐 ดาวจร — ตำแหน่งดาวณ วันที่ ${dateLabel}`);
  lines.push("");
  lines.push(`> **AETOX ASTRO ENGINE** | ดาวจรสำหรับการวิเคราะห์ชั่วคราว`);
  lines.push("");

  lines.push(`## ตำแหน่งดาวจร`);
  lines.push("");
  lines.push(`| ดาว | องศา | ราศี (D1) | ภพ | สถานะ |`);
  lines.push(`|-----|------|-----------|-----|-------|`);

  const planets = transitChart?.planets ?? {};
  for (const [pName, p] of Object.entries<any>(planets)) {
    const num = PLANET_NUM[pName] ?? "";
    const dignity = (p.dignity_list ?? []).filter((d: string) => d !== "ปกติ").join(", ") || "ปกติ";
    const retroMark = p.retrograde ? " ℞" : "";
    lines.push(
      `| ${num} ${thPlanet(pName)}${retroMark} | ${fmtDeg(p.longitude)} | ${thSign(p.sign)} | ${p.house} (${thHouse(p.house)}) | ${dignity} |`
    );
  }

  // Lagna
  if (transitChart?.lagna) {
    const lg = transitChart.lagna;
    lines.push(`| **ลัคนาจร** | ${fmtDeg(lg.longitude)} | ${thSign(lg.sign)} | 1 (ตนุ) | - |`);
  }

  lines.push("");

  // Nakshatra
  const nkData = transitChart?.lunar_data?.planet_nakshatras;
  if (nkData && Object.keys(nkData).length > 0) {
    lines.push(`## นักษัตรดาวจร`);
    lines.push("");
    lines.push(`| ดาว | นักษัตร | บาท |`);
    lines.push(`|-----|---------|-----|`);
    for (const [pName, nk] of Object.entries<any>(nkData)) {
      const num = PLANET_NUM[pName] ?? "";
      lines.push(`| ${num} ${thPlanet(pName)} | ${thNakshatra(nk.name)} | บาทที่ ${nk.pada} |`);
    }
    lines.push("");
  }

  // Panchang
  const panchang = transitChart?.panchang;
  if (panchang) {
    lines.push(`## ปัญจางค์ (Panchang)`);
    lines.push("");
    lines.push(`| รายการ | ข้อมูล |`);
    lines.push(`|--------|--------|`);
    if (panchang.tithi) lines.push(`| ติถิ | ${panchang.tithi} |`);
    if (panchang.vara) lines.push(`| วาระ | ${panchang.vara} |`);
    if (panchang.nakshatra) lines.push(`| นักษัตร | ${thNakshatra(panchang.nakshatra)} |`);
    if (panchang.yoga) lines.push(`| โยค | ${panchang.yoga} |`);
    if (panchang.karana) lines.push(`| กรณะ | ${panchang.karana} |`);
    lines.push("");
  }

  lines.push(hr());
  lines.push(`*รายงานดาวจรจาก AETOX ASTRO ENGINE v1.0 | สร้างเมื่อ ${new Date().toLocaleString("th-TH")}*`);

  return lines.join("\n");
}

// ─── Download helper ──────────────────────────────────────────────
export function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".md") ? filename : `${filename}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
