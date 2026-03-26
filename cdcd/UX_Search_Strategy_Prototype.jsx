import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  Plus,
  Info,
  ArrowRight,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

// --- MOCK DATA & CONFIGURATION ---
const MARKET_DATA = {
  "샴푸 시장": [
    "라보에이치",
    "TS샴푸",
    "닥터그루트",
    "헤드앤숄더",
    "알페신",
    "려",
    "아로마티카",
    "쿤달",
  ],
  "탈모 케어": [
    "닥터포헤어",
    "TS샴푸",
    "모다모다",
    "카페인 샴푸",
    "비오틴 영양제",
  ],
  "비건 뷰티": ["아로마티카", "멜릭서", "디어달리아", "비플레인", "어뮤즈"],
};

const PLACEHOLDERS = [
  "시장 분석을 위해 제품명을 입력하세요 (예: 라보에이치, 알페신...)",
  "또는 카테고리를 선택하여 제품군을 불러오세요.",
  "원하는 경쟁사 제품들을 자유롭게 추가/삭제 하세요.",
];

// --- COMPONENTS ---

const Token = ({ label, onRemove }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2 mb-2 animate-fadeIn">
    {label}
    <button
      onClick={() => onRemove(label)}
      className="ml-1.5 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
    >
      <X size={14} />
    </button>
  </span>
);

const SuggestionChip = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="group flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:shadow-md transition-all duration-200"
  >
    <Plus size={16} className="mr-2 text-gray-400 group-hover:text-blue-500" />
    <span className="font-medium">{label}</span>
  </button>
);

const Tooltip = ({ children, text }) => (
  <div className="group relative flex items-center">
    {children}
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-50 text-center">
      {text}
      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
    </div>
  </div>
);

export default function App() {
  // State Management
  const [query, setQuery] = useState("");
  const [tokens, setTokens] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [searchState, setSearchState] = useState("idle"); // idle, active, no-result-constructive
  const inputRef = useRef(null);

  // Placeholder Rotation Logic (Priming)
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleAddCategory = (category) => {
    // "Explosion" Logic: Convert category to tokens
    const newTokens = MARKET_DATA[category];
    // Prevent duplicates
    const uniqueTokens = [...new Set([...tokens, ...newTokens])];
    setTokens(uniqueTokens);
    setQuery("");
    setSearchState("active");
    inputRef.current?.focus();
  };

  const handleRemoveToken = (tokenToRemove) => {
    setTokens(tokens.filter((t) => t !== tokenToRemove));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (tokens.length > 0) {
      // Valid Search with tokens
      setSearchState("success");
    } else {
      // Fail-safe Scenario Check
      const matchedCategory = Object.keys(MARKET_DATA).find(
        (cat) => cat === query.trim()
      );
      if (matchedCategory) {
        setSearchState("no-result-constructive"); // Trigger the constructive fail-safe
      } else if (query.trim() !== "") {
        setSearchState("no-result-basic"); // Standard no result
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim() !== "") {
      handleSearch(e);
    }
    if (e.key === "Backspace" && query === "" && tokens.length > 0) {
      // Remove last token on backspace
      const newTokens = [...tokens];
      newTokens.pop();
      setTokens(newTokens);
    }
  };

  // Render Logic
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 selection:bg-blue-200">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              M
            </div>
            <h1 className="text-lg font-bold text-gray-800">
              Market Intelligence Search
            </h1>
          </div>
          <div className="text-sm text-gray-500">UX 전략 프로토타입 v1.0</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* SECTION 1: The Search Interface */}
        <section className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-12">
          <div className="p-10">
            <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
              시장 분석 인사이트 검색
            </h2>
            <p className="text-gray-500 text-center mb-8">
              원하는 시장의 경쟁 제품군을 입력하여 데이터를 비교 분석하세요.
            </p>

            {/* Search Box Area */}
            <div className="relative max-w-3xl mx-auto">
              {/* The Smart Tokenized Search Bar */}
              <div
                className={`
                  flex flex-wrap items-center min-h-[64px] px-4 py-2 bg-white border-2 rounded-xl transition-all duration-300
                  ${
                    isFocused
                      ? "border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]"
                      : "border-gray-300 hover:border-gray-400"
                  }
                `}
                onClick={() => inputRef.current?.focus()}
              >
                <Search
                  className={`mr-3 ${
                    isFocused ? "text-blue-500" : "text-gray-400"
                  }`}
                />

                {/* Tokens Display */}
                {tokens.map((token) => (
                  <Token
                    key={token}
                    label={token}
                    onRemove={handleRemoveToken}
                  />
                ))}

                {/* Input Field with Ghost Text */}
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay for click handling
                  onKeyDown={handleKeyDown}
                  className="flex-grow outline-none bg-transparent text-gray-800 placeholder-gray-400 min-w-[150px] h-8"
                  placeholder={
                    tokens.length === 0 ? PLACEHOLDERS[placeholderIndex] : ""
                  }
                />

                {/* Action Button */}
                <button
                  onClick={handleSearch}
                  className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  검색
                </button>
              </div>

              {/* Zero State: Suggestion Chips (Nudge) */}
              {isFocused && tokens.length === 0 && query === "" && (
                <div className="absolute top-full left-0 right-0 mt-4 p-4 bg-white rounded-xl shadow-xl border border-gray-100 animate-slideDown z-20">
                  <div className="flex items-center mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <Lightbulb size={14} className="mr-1 text-yellow-500" />
                    추천 시장 카테고리 (클릭 시 자동 확장)
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {Object.keys(MARKET_DATA).map((category) => (
                      <SuggestionChip
                        key={category}
                        label={category}
                        onClick={() => handleAddCategory(category)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RESULT AREA / FEEDBACK LOOP */}
            <div className="max-w-3xl mx-auto mt-8 min-h-[200px]">
              {/* State 1: Idle */}
              {searchState === "idle" && tokens.length === 0 && (
                <div className="text-center text-gray-400 py-10">
                  <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                    <Search size={32} />
                  </div>
                  <p>검색어를 입력하거나 카테고리를 선택해주세요.</p>
                </div>
              )}

              {/* State 2: Active/Tokens Ready */}
              {tokens.length > 0 && searchState !== "success" && (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 animate-fadeIn">
                  <h3 className="font-bold text-blue-900 mb-2 flex items-center">
                    <CheckCircle2 size={18} className="mr-2" />
                    검색 조건 설정됨
                  </h3>
                  <p className="text-sm text-blue-700 mb-4">
                    현재 <strong>{tokens.length}개</strong>의 경쟁 제품이 분석
                    대상으로 설정되었습니다. 필요 없는 제품은 'X'를 눌러
                    제거하거나, 검색바에 새로운 제품을 추가할 수 있습니다.
                  </p>
                  <div className="flex gap-2">
                    {tokens.slice(0, 5).map((t) => (
                      <div
                        key={t}
                        className="h-2 w-12 bg-blue-200 rounded-full"
                      ></div>
                    ))}
                    {tokens.length > 5 && (
                      <span className="text-xs text-blue-400">...</span>
                    )}
                  </div>
                </div>
              )}

              {/* State 3: Fail-safe (Constructive No-Results) - Document Section 6.1 */}
              {searchState === "no-result-constructive" && (
                <div className="bg-orange-50 rounded-xl p-8 border border-orange-100 text-center animate-pulse-once">
                  <AlertCircle
                    size={48}
                    className="mx-auto text-orange-500 mb-4"
                  />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    검색어 '{query}'와 일치하는 단일 제품은 없습니다.
                  </h3>
                  <p className="text-gray-600 mb-6">
                    하지만 <strong>'{query}' 카테고리</strong>를 찾고 계신가요?
                    <br />
                    해당 시장의 주요 경쟁 제품들을 한 번에 불러올 수 있습니다.
                  </p>
                  <button
                    onClick={() => handleAddCategory(query)}
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 shadow-lg hover:shadow-orange-500/30 transition-all flex items-center mx-auto"
                  >
                    <Plus size={18} className="mr-2" />'{query}' 관련 제품{" "}
                    {MARKET_DATA[query].length}개 모두 불러오기
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 2: Strategy Explanation (Educational Context) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center mb-4 text-blue-600">
              <span className="bg-blue-100 p-2 rounded-lg mr-3 text-sm font-bold">
                Step 1
              </span>
              <h3 className="font-bold">프라이밍 & 넛지</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>"0초의 순간"</strong>: 사용자가 입력하기 전, 회전하는
              고스트 텍스트가 구체적인 입력 예시(라보에이치 등)를 보여줍니다.
              포커스 시 나타나는 칩은 '타이핑(회상)' 대신 '클릭(재인)'을
              유도합니다.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center mb-4 text-green-600">
              <span className="bg-green-100 p-2 rounded-lg mr-3 text-sm font-bold">
                Step 2
              </span>
              <h3 className="font-bold">토큰 클러스터 확장</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>"아하 모멘트"</strong>: [샴푸 시장]을 선택하면 텍스트가
              남지 않고 8개의 개별 제품 토큰으로 <strong>폭발(Explode)</strong>
              합니다. 사용자는 "아, 시장은 제품들의 집합이구나"를 직관적으로
              학습합니다.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center mb-4 text-orange-600">
              <span className="bg-orange-100 p-2 rounded-lg mr-3 text-sm font-bold">
                Step 3
              </span>
              <h3 className="font-bold">오류 복구 (Fail-safe)</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>"용서하는 디자인"</strong>: 위 검색창에 '샴푸 시장'이라고
              억지로 타이핑하고 엔터를 쳐보세요. 단순한 '결과 없음' 대신
              카테고리 확장을 제안하는 복구 화면이 나타납니다.
            </p>
          </div>
        </section>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-slideDown { animation: slideDown 0.2s ease-out forwards; }
        .animate-pulse-once { animation: pulse 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}
