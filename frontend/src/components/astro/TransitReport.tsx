import React from 'react';
import { Calendar, User, Star, MapPin, Clock, ArrowRight } from 'lucide-react';

interface TransitReportProps {
  data: any;
  onClose: () => void;
  config?: {
    sections: {
      basicInfo: boolean;
      planetTable: boolean;
      yogas: boolean;
      dasha: boolean;
    };
    tableColumns: {
      degrees: boolean;
      house: boolean;
      lordship: boolean;
      d1: boolean;
      d3: boolean;
      d9: boolean;
      nakshatra: boolean;
    };
  };
}

const TransitReport: React.FC<TransitReportProps> = ({ data, onClose, config }) => {
  if (!data) return null;

  const { natal_chart, initial_transits, events, total_events } = data;

  const printReport = () => {
    window.print();
  };

  const getThaiPlanetName = (name: string) => {
    const names: { [key: string]: string } = {
      "Sun": "อาทิตย์", "Moon": "จันทร์", "Mars": "อังคาร", "Mercury": "พุธ",
      "Jupiter": "พฤหัสบดี", "Venus": "ศุกร์", "Saturn": "เสาร์", "Rahu": "ราหู",
      "Ketu": "เกตุ", "Uranus": "มฤตยู"
    };
    return names[name] || name;
  };

  const getThaiSignName = (signNum: number) => {
    const signs = ["เมษ", "พฤษภ", "เมถุน", "กรกฎ", "สิงห์", "กันย์", "ตุลย์", "พิจิก", "ธนู", "มังกร", "กุมภ์", "มีน"];
    return signs[(signNum - 1) % 12] || "-";
  };

  const getThaiNakshatraName = (name: string) => {
    const nakshatras: { [key: string]: string } = {
      "Ashwini": "อัศวินี", "Bharani": "ภรณี", "Krittika": "กฤติกา", "Rohini": "โรหิณี",
      "Mrigashira": "มฤคศิระ", "Ardra": "อารทรา", "Punarvasu": "ปุนัพพสุ", "Pushya": "ปุษยะ",
      "Ashlesha": "อศิเลษา", "Magha": "มฆา", "Purva Phalguni": "บุพพผลคุนี", "Uttara Phalguni": "อุตตรผลคุนี",
      "Hasta": "หัสตะ", "Chitra": "จิตรา", "Swati": "สวาตี", "Vishakha": "วิสาขา",
      "Anuradha": "อนุราธา", "Jyeshtha": "เชษฐา", "Mula": "มูละ", "Purva Ashadha": "บุพพอาษาฬหะ",
      "Uttara Ashadha": "อุตตราษาฬหะ", "Shravana": "ศรวณะ", "Dhanishta": "ธนิษฐา", "Shatabhisha": "ศตภิษัช",
      "Purva Bhadrapada": "บุพพภัทรบท", "Uttara Bhadrapada": "อุตตรภัทรบท", "Revati": "เรวดี"
    };
    return nakshatras[name] || name;
  };

  const getThaiPlanetNameById = (planetName: string) => {
    const names: { [key: string]: string } = {
        "Sun": "อาทิตย์", "Moon": "จันทร์", "Mars": "อังคาร", "Mercury": "พุธ",
        "Jupiter": "พฤหัสบดี", "Venus": "ศุกร์", "Saturn": "เสาร์", "Rahu": "ราหู",
        "Ketu": "เกตุ", "Uranus": "มฤตยู", "Neptune": "เนปจูน", "Pluto": "พลูโต"
    };
    return names[planetName] || planetName;
  };

  const formatDegree = (longitude: number) => {
    const degInSign = longitude % 30;
    const deg = Math.floor(degInSign);
    const min = Math.floor((degInSign - deg) * 60);
    return `${deg}°${min.toString().padStart(2, '0')}'`;
  };

  const getHouseName = (houseNum: number) => {
    const names = ["ตนุ", "กดุมภะ", "สหัชชะ", "พันธุ", "ปุตตะ", "อริ", "ปัตนิ", "มรณะ", "ศุภะ", "กัมมะ", "ลาภะ", "วินาศ"];
    return names[(houseNum - 1) % 12] || "-";
  };

  const getRulingHouses = (planetName: string, lagnaSign: number) => {
    if (!lagnaSign) return "-";
    const owners: { [key: number]: string } = {
      1: "Mars", 2: "Venus", 3: "Mercury", 4: "Moon", 5: "Sun", 6: "Mercury",
      7: "Venus", 8: "Mars", 9: "Jupiter", 10: "Saturn", 11: "Saturn", 12: "Jupiter"
    };
    const ruledHouses: number[] = [];
    for (let sign = 1; sign <= 12; sign++) {
      if (owners[sign] === planetName) {
        const house = (sign - lagnaSign + 12) % 12 + 1;
        ruledHouses.push(house);
      }
    }
    if (ruledHouses.length === 0) return "-";
    return ruledHouses.map(h => getHouseName(h)).join(", ");
  };

  const getSignRuler = (sign: number) => {
    const rulers: { [key: number]: string } = {
      1: "อังคาร", 2: "ศุกร์", 3: "พุธ", 4: "จันทร์", 5: "อาทิตย์", 6: "พุธ",
      7: "ศุกร์", 8: "อังคาร", 9: "พฤหัสบดี", 10: "เสาร์", 11: "เสาร์", 12: "พฤหัสบดี"
    };
    return rulers[sign] || "-";
  };

  return (
    <div className="fixed inset-0 z-100 bg-slate-100 overflow-y-auto print:static print:bg-white font-sans">
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 print:hidden shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Star className="h-5 w-5 text-indigo-600" />
          </div>
          <h1 className="font-bold text-slate-800">AETOX ASTRO - รายงานการวิเคราะห์ดวงกำเนิด</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">ย้อนกลับ</button>
          <button onClick={() => window.print()} className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-bold shadow-md hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2">
            พิมพ์รายงาน (A4)
          </button>
        </div>
      </div>

      <div className="w-[190mm] mx-auto my-8 p-[10mm] bg-white text-slate-900 shadow-xl print:shadow-none print:my-0 print:p-0 sarabun-font print:w-full">
        
        {/* Header Section */}
        {(!config || config.sections.basicInfo) && (
          <div className="flex justify-between items-end border-b-2 border-slate-800 pb-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 leading-tight">วิเคราะห์ดวงกำเนิดเชิงลึก</h2>
              <p className="text-slate-600 font-semibold text-sm">ข้อมูลราศีจักร, ตรียางศ์จักร, และนวางศ์จักร (D1, D3, D9)</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-bold text-lg text-slate-900">{natal_chart?.name || 'ไม่ระบุชื่อ'}</p>
              <p className="text-slate-600">เกิด: {natal_chart?.birth_date || '-'}</p>
              <p className="text-slate-600">พิกัด: {natal_chart?.location || '-'}</p>
            </div>
          </div>
        )}

        {/* Master Table Section */}
        {(!config || config.sections.planetTable) && (
          <section className="mt-4">
            <div className="border border-slate-500 bg-white shadow-sm">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-500 text-slate-800">
                    <th className="px-1 py-3 text-[12px] font-bold border-r border-slate-300 w-[8%] text-center">ดาว</th>
                    {(!config || config.tableColumns.degrees) && <th className="px-1 py-3 text-[12px] font-bold border-r border-slate-300 w-[10%]">องศา</th>}
                    {(!config || config.tableColumns.house) && <th className="px-1 py-3 text-[12px] font-bold border-r border-slate-300 w-[10%]">ภพสถิต</th>}
                    {(!config || config.tableColumns.lordship) && <th className="px-1 py-3 text-[12px] font-bold border-r border-slate-300 w-[10%]">เจ้าเรือน</th>}
                    {(!config || config.tableColumns.d1) && <th className="px-2 py-3 text-[12px] font-bold border-r border-slate-300 w-[17%]">ราศีจักร(D1)</th>}
                    {(!config || config.tableColumns.d3) && <th className="px-2 py-3 text-[12px] font-bold border-r border-slate-300 w-[15%]">ตรียางศ์(D3)</th>}
                    {(!config || config.tableColumns.d9) && <th className="px-2 py-3 text-[12px] font-bold border-r border-slate-300 w-[15%]">นวางศ์(D9)</th>}
                    {(!config || config.tableColumns.nakshatra) && <th className="px-2 py-3 text-[12px] font-bold w-[15%] text-center">นักษัตร/บาท</th>}
                  </tr>
                </thead>
              <tbody className="text-slate-900">
                {Object.entries(natal_chart?.planets || {}).map(([name, p]: [string, any]) => (
                  <tr key={name} className="border-b border-slate-200">
                    <td className="px-1 py-3 border-r border-slate-200 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-[16px] leading-none">
                          {Object.entries({Sun:"๑",Moon:"๒",Mars:"๓",Mercury:"๔",Jupiter:"๕",Venus:"๖",Saturn:"๗",Rahu:"๘",Ketu:"๙",Uranus:"๐"}).find(([k])=>k===name)?.[1]}
                        </span>
                        <span className="text-[11px] font-medium">{getThaiPlanetName(name)}</span>
                      </div>
                    </td>
                    {(!config || config.tableColumns.degrees) && <td className="px-1 py-3 border-r border-slate-200 text-[13px] font-medium">{formatDegree(p.longitude)}</td>}
                    {(!config || config.tableColumns.house) && <td className="px-1 py-3 border-r border-slate-200 font-bold text-[13px] text-indigo-800">{p.house} ({getHouseName(p.house)})</td>}
                    {(!config || config.tableColumns.lordship) && (
                      <td className="px-1 py-3 border-r border-slate-200 font-bold text-[12px] text-emerald-800">
                        {p.lordships?.map((l: any) => l.name).join(", ") || "-"}
                      </td>
                    )}
                    
                    {(!config || config.tableColumns.d1) && (
                      <td className="px-2 py-3 border-r border-slate-200">
                        <p className="font-bold text-[14px]">{getThaiSignName(p.sign)}</p>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {p.dignity_list && p.dignity_list.filter((d: string) => d !== "ปกติ").length > 0 ? (
                            p.dignity_list.filter((d: string) => d !== "ปกติ").map((d: string) => (
                              <span key={d} className="text-[10px] font-black px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-800 shadow-sm leading-none">{d}</span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400">ปกติ</span>
                          )}
                        </div>
                      </td>
                    )}

                    {(!config || config.tableColumns.d3) && (
                      <td className="px-2 py-3 border-r border-slate-200">
                        <p className="font-bold text-[14px]">{getThaiSignName(natal_chart?.d3?.[name]?.sign)}</p>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {natal_chart?.d3?.[name]?.dignity_list && natal_chart.d3[name].dignity_list.filter((d: string) => d !== "ปกติ").length > 0 ? (
                            natal_chart.d3[name].dignity_list.filter((d: string) => d !== "ปกติ").map((d: string) => (
                              <span key={d} className="text-[10px] font-black px-1.5 py-0.5 bg-blue-50 border border-blue-200 rounded text-blue-800 shadow-sm leading-none">{d}</span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400">ปกติ</span>
                          )}
                        </div>
                      </td>
                    )}

                    {(!config || config.tableColumns.d9) && (
                      <td className="px-2 py-3 border-r border-slate-200">
                        <p className="font-bold text-[14px]">{getThaiSignName(natal_chart?.d9?.[name]?.sign)}</p>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {natal_chart?.d9?.[name]?.dignity_list && natal_chart.d9[name].dignity_list.filter((d: string) => d !== "ปกติ").length > 0 ? (
                            natal_chart.d9[name].dignity_list.filter((d: string) => d !== "ปกติ").map((d: string) => (
                              <span key={d} className="text-[10px] font-black px-1.5 py-0.5 bg-amber-50 border border-amber-200 rounded text-amber-800 shadow-sm leading-none">{d}</span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400">ปกติ</span>
                          )}
                        </div>
                      </td>
                    )}

                    {(!config || config.tableColumns.nakshatra) && (
                      <td className="px-2 py-3 text-center">
                          <p className="font-bold text-[13px]">{getThaiNakshatraName(natal_chart?.lunar_data?.planet_nakshatras?.[name]?.name) || "-"}</p>
                          <p className="text-[11px] text-slate-500">บาทที่ {natal_chart?.lunar_data?.planet_nakshatras?.[name]?.pada || "-"}</p>
                      </td>
                    )}
                  </tr>
                ))}

                  <tr className="bg-slate-50 border-t-2 border-slate-500">
                    <td className="px-1 py-4 border-r border-slate-300 text-center font-bold text-[14px]">ลัคนา</td>
                    {(!config || config.tableColumns.degrees) && <td className="px-1 py-4 border-r border-slate-300 font-bold text-[14px]">{formatDegree(natal_chart?.lagna?.longitude)}</td>}
                    {(!config || config.tableColumns.house) && <td className="px-1 py-4 border-r border-slate-300 font-bold text-[13px] text-indigo-900">1 (ตนุ)</td>}
                    {(!config || config.tableColumns.lordship) && (
                      <td className="px-1 py-4 border-r border-slate-300 font-bold text-[12px] text-emerald-800 text-center">
                        {getThaiPlanetNameById(natal_chart?.house_lords?.[1]?.planet)}
                      </td>
                    )}
                    {(!config || config.tableColumns.d1) && (
                      <td className="px-2 py-4 border-r border-slate-300">
                        <p className="font-bold text-[14px]">{getThaiSignName(natal_chart?.lagna?.sign)}</p>
                        <p className="text-[11px] text-emerald-700 font-bold">ตนุลัคน์: {getSignRuler(natal_chart?.lagna?.sign)}</p>
                      </td>
                    )}
                    {(!config || config.tableColumns.d3) && (
                      <td className="px-2 py-4 border-r border-slate-300">
                        <p className="font-bold text-[14px]">{getThaiSignName(natal_chart?.d3_lagna?.sign)}</p>
                        <p className="text-[11px] text-emerald-700 font-bold">ตนุลัคน์: {getSignRuler(natal_chart?.d3_lagna?.sign)}</p>
                      </td>
                    )}
                    {(!config || config.tableColumns.d9) && (
                      <td className="px-2 py-4 border-r border-slate-300">
                        <p className="font-bold text-[14px]">{getThaiSignName(natal_chart?.d9_lagna?.sign)}</p>
                        <p className="text-[11px] text-emerald-700 font-bold">ตนุลัคน์: {getSignRuler(natal_chart?.d9_lagna?.sign)}</p>
                      </td>
                    )}
                    {(!config || config.tableColumns.nakshatra) && (
                      <td className="px-2 py-4 text-center">
                        <p className="font-bold text-[13px]">{getThaiNakshatraName(natal_chart?.lunar_data?.lagna_nakshatra?.name) || "-"}</p>
                        <p className="text-[11px]">บาทที่ {natal_chart?.lunar_data?.lagna_nakshatra?.pada || "-"}</p>
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 p-4 bg-slate-50 border border-slate-300 text-[13px] text-slate-700 leading-relaxed grid grid-cols-2 gap-x-8">
              <p>• <strong>D1:</strong> ราศีจักรหลัก • <strong>D3:</strong> ตรียางศ์ (ความเข้มแข็งลึก) • <strong>D9:</strong> นวางศ์ (ไส้ชะตา)</p>
              <p>• <strong>เจ้าเรือน:</strong> ภพต้นกำเนิดของดาว • <strong>ตนุลัคน์:</strong> ดาวเจ้าเรือนลัคนาประจำแต่ละจักร</p>
            </div>

          </section>
        )}

        {/* Yoga & Special Criteria Analysis */}
        {(!config || config.sections.yogas) && natal_chart?.yogas && natal_chart.yogas.length > 0 && (
          <section className="mt-8">
            <h3 className="text-lg font-black text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">วิเคราะห์โยค และเกณฑ์ชะตาพิเศษ (Yoga & Special Criteria)</h3>
            <div className="grid grid-cols-2 gap-4">
              {natal_chart.yogas.map((y: any, i: number) => (
                <div key={i} className={`p-3 border rounded-md break-inside-avoid ${y.score < 0 ? 'bg-rose-50 border-rose-200' : 'bg-indigo-50 border-indigo-200'}`}>
                  <p className="font-bold text-[14px] flex items-center justify-between">
                    <span>{y.name} {y.planet ? `(${getThaiPlanetNameById(y.planet)})` : ""}</span>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded ${y.score < 0 ? 'bg-rose-600 text-white' : 'bg-indigo-600 text-white'}`}>
                      {y.score < 0 ? 'จุดเสีย' : 'จุดเด่น'}
                    </span>
                  </p>
                  <p className="text-[12px] mt-1 text-slate-700 leading-tight">{y.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Dasha section was here, removed per user request */}

        <div className="mt-6 pt-4 border-t-2 border-slate-800 flex justify-between items-end text-slate-500 text-[12px]">
          <div>
            <p className="font-bold text-slate-700">AETOX ASTRO ENGINE v1.0</p>
            <p>รายงานทางเทคนิคโหราศาสตร์ไทยมาตรฐาน (Master Natal Chart)</p>
          </div>
          <div className="text-right">
            <p>พิมพ์เมื่อ: {new Date().toLocaleString('th-TH')}</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          /* Force background colors */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          
          /* Reset container for multi-page printing */
          body, html { 
            height: auto !important; 
            overflow: visible !important; 
            background: white !important;
          }

          /* The modal container must not restrict height or overflow */
          .fixed { 
            position: absolute !important; 
            display: block !important;
            height: auto !important;
            width: 100% !important;
            overflow: visible !important;
          }

          .overflow-y-auto { 
            overflow: visible !important; 
            height: auto !important;
          }

          @page { 
            size: A4 portrait; 
            margin: 15mm; 
          }

          /* Hide UI elements */
          .print\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default TransitReport;
