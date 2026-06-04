// Advanced Unicode Cleaner - Main Script

const HIDDEN_CHARS = {
  zeroWidth: {
    name: "Zero-Width Characters",
    chars: [
      "\u200B",
      "\u200C",
      "\u200D",
      "\uFEFF",
    ],
    icon: "👁️",
    color: "#3b82f6",
  },
  specialSpaces: {
    name: "Special Spaces",
    chars: ["\u00A0", "\u202F", "\u205F"],
    icon: "⏵",
    color: "#ef4444",
  },
  direction: {
    name: "Direction Controls",
    chars: [
      "\u2060",
      "\u061C",
      "\u200E",
      "\u200F",
    ],
    icon: "⬌",
    color: "#eab308",
  },
  format: {
    name: "Format Characters",
    chars: [
      "\u202A",
      "\u202B",
      "\u202C",
      "\u202D",
      "\u202E",
      "\u2066",
      "\u2067",
      "\u2068",
      "\u2069",
    ],
    icon: "⚙️",
    color: "#a855f7",
  },
  softHyphen: {
    name: "Soft Hyphens",
    chars: ["\u00AD"],
    icon: "⬌",
    color: "#8b5cf6",
  },
  control: {
    name: "Control Characters",
    chars: [
      ...Array.from({ length: 32 }, (_, i) =>
        String.fromCharCode(i),
      ),
      "\u007F",
    ],
    icon: "🔧",
    color: "#ec4899",
  },
};

// Generate tag and variation characters
function getTagAndVariationChars() {
  const chars = [];
  for (let i = 0xe0000; i <= 0xe007f; i++) {
    try {
      chars.push(String.fromCodePoint(i));
    } catch (e) {}
  }
  for (let i = 0xfe00; i <= 0xfe0f; i++) {
    chars.push(String.fromCharCode(i));
  }
  return chars;
}

HIDDEN_CHARS.tags = {
  name: "Hidden Tags & Variation Selectors",
  chars: getTagAndVariationChars(),
  icon: "🏷️",
  color: "#10b981",
};

// DOM Elements
const elements = {
  input: document.getElementById("inputText"),
  output: document.getElementById("outputText"),
  cleanBtn: document.getElementById("cleanBtn"),
  compareBtn:
    document.getElementById("compareBtn"),
  copyBtn: document.getElementById("copyBtn"),
  downloadBtn: document.getElementById(
    "downloadBtn",
  ),
  pasteBtn: document.getElementById("pasteBtn"),
  sampleBtn: document.getElementById("sampleBtn"),
  tabBtns: document.querySelectorAll(".tab-btn"),
  tabContents: document.querySelectorAll(
    ".tab-content",
  ),
  removedDisplay: document.getElementById(
    "removedDisplay",
  ),
  comparisonView: document.getElementById(
    "comparisonView",
  ),
  detailedAnalysis: document.getElementById(
    "detailedAnalysis",
  ),
  foundCharsList: document.getElementById(
    "foundCharsList",
  ),
  unicodePoints: document.getElementById(
    "unicodePoints",
  ),
  categoryStats: document.getElementById(
    "categoryStats",
  ),
  textStats: document.getElementById("textStats"),
};

const stats = {
  hiddenCount: document.getElementById(
    "hiddenCount",
  ),
  removedCount: document.getElementById(
    "removedCount",
  ),
  cleanedCount: document.getElementById(
    "cleanedCount",
  ),
  cleanRate: document.getElementById("cleanRate"),
  inputLength: document.getElementById(
    "inputLength",
  ),
  outputLength: document.getElementById(
    "outputLength",
  ),
  inputLines:
    document.getElementById("inputLines"),
  outputLines: document.getElementById(
    "outputLines",
  ),
  inputWords:
    document.getElementById("inputWords"),
  outputWords: document.getElementById(
    "outputWords",
  ),
};

const settings = {
  removeZeroWidth: document.getElementById(
    "removeZeroWidth",
  ),
  removeSpaces: document.getElementById(
    "removeSpaces",
  ),
  removeDirection: document.getElementById(
    "removeDirection",
  ),
  removeFormat: document.getElementById(
    "removeFormat",
  ),
  removeTags:
    document.getElementById("removeTags"),
  removeControl: document.getElementById(
    "removeControl",
  ),
  trimWhitespace: document.getElementById(
    "trimWhitespace",
  ),
  normalizeNewlines: document.getElementById(
    "normalizeNewlines",
  ),
};

let charChart = null;

// Sample text for demo
const SAMPLE_TEXT = `يا سارة 🤍

عارفة إن من الحاجات الغريبة في الحياة إن الإنسان ممكن يقابل ناس كثير جدًا لكن قليل أوي اللي يسيبوا أثر حقيقي في قلبه

وأعتقد إنك واحدة من الناس دي بالنسبة لي

أحب فيكي إن قلبك طيب وحنون وإن عندك مشاعر صادقة حتى لو أوقات بتظهريها بطريقة مختلفة شوية 😄`;

// Tab switching
elements.tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tabName = btn.dataset.tab;
    elements.tabBtns.forEach((b) =>
      b.classList.remove("tab-active"),
    );
    elements.tabContents.forEach((content) =>
      content.classList.add("hidden"),
    );
    btn.classList.add("tab-active");
    document
      .getElementById(`${tabName}-tab`)
      .classList.remove("hidden");
  });
});

// Clean text function
function cleanText() {
  const input = elements.input.value;
  if (!input) {
    alert("Please paste some text first!");
    return;
  }

  let cleaned = input;
  let foundChars = {};
  let removedPositions = [];

  // Track removed characters
  function removeChars(
    charSet,
    replacementChar = "",
  ) {
    if (!charSet.enabled) return;
    charSet.chars.forEach((char) => {
      const regex = new RegExp(
        char.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&",
        ),
        "g",
      );
      const matches = cleaned.match(regex) || [];
      if (matches.length > 0) {
        foundChars[charSet.name] =
          (foundChars[charSet.name] || 0) +
          matches.length;
      }
      cleaned = cleaned
        .split(char)
        .join(replacementChar);
    });
  }

  // Remove based on settings
  if (settings.removeZeroWidth.checked)
    removeChars({
      chars: HIDDEN_CHARS.zeroWidth.chars,
      name: HIDDEN_CHARS.zeroWidth.name,
      enabled: true,
    });
  if (settings.removeSpaces.checked)
    removeChars(
      {
        chars: HIDDEN_CHARS.specialSpaces.chars,
        name: HIDDEN_CHARS.specialSpaces.name,
        enabled: true,
      },
      " ",
    );
  if (settings.removeDirection.checked)
    removeChars({
      chars: HIDDEN_CHARS.direction.chars,
      name: HIDDEN_CHARS.direction.name,
      enabled: true,
    });
  if (settings.removeFormat.checked)
    removeChars({
      chars: HIDDEN_CHARS.format.chars,
      name: HIDDEN_CHARS.format.name,
      enabled: true,
    });
  if (settings.removeControl.checked) {
    removeChars({
      chars: HIDDEN_CHARS.softHyphen.chars,
      name: HIDDEN_CHARS.softHyphen.name,
      enabled: true,
    });
    removeChars({
      chars: HIDDEN_CHARS.control.chars,
      name: HIDDEN_CHARS.control.name,
      enabled: true,
    });
  }
  if (settings.removeTags.checked)
    removeChars({
      chars: HIDDEN_CHARS.tags.chars,
      name: HIDDEN_CHARS.tags.name,
      enabled: true,
    });

  // Normalize newlines
  if (settings.normalizeNewlines.checked) {
    cleaned = cleaned
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");
  }

  // Trim whitespace
  if (settings.trimWhitespace.checked) {
    cleaned = cleaned.trim();
  }

  // Update output
  elements.output.value = cleaned;
  updateAllStats(input, cleaned, foundChars);
  displayRemovedChars(foundChars);
  displayDetailedAnalysis(input, foundChars);
}

// Update all statistics
function updateAllStats(
  input,
  output,
  foundChars,
) {
  const inputLen = input.length;
  const outputLen = output.length;
  const removedLen = inputLen - outputLen;
  const totalFound = Object.values(
    foundChars,
  ).reduce((a, b) => a + b, 0);
  const cleaningRate =
    inputLen > 0
      ? Math.round((removedLen / inputLen) * 100)
      : 0;

  stats.inputLength.textContent =
    inputLen.toLocaleString();
  stats.outputLength.textContent =
    outputLen.toLocaleString();
  stats.hiddenCount.textContent =
    totalFound.toLocaleString();
  stats.removedCount.textContent =
    removedLen.toLocaleString();
  stats.cleanedCount.textContent =
    outputLen.toLocaleString();
  stats.cleanRate.textContent =
    cleaningRate + "%";

  // Update text metrics
  stats.inputLines.textContent =
    input.split("\n").length;
  stats.outputLines.textContent =
    output.split("\n").length;
  stats.inputWords.textContent = input
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  stats.outputWords.textContent = output
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  // Update analysis if on that tab
  updateAnalysisDashboard(
    input,
    output,
    foundChars,
  );
}

// Display removed characters
function displayRemovedChars(foundChars) {
  if (Object.keys(foundChars).length === 0) {
    elements.removedDisplay.innerHTML =
      '<div class="analysis-section border-l-4 border-green-500"><p class="text-green-300"><i class="fas fa-check-circle mr-2"></i>✓ No hidden characters found! Text is clean.</p></div>';
    return;
  }

  let html =
    '<div class="analysis-section border-l-4 border-red-500"><h4 class="font-bold text-red-300 mb-4 flex items-center gap-2"><i class="fas fa-warning"></i>Hidden Characters Detected & Removed:</h4><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">';

  for (const [charType, count] of Object.entries(
    foundChars,
  )) {
    html += `<div class="bg-slate-900/50 p-4 rounded-lg border border-red-500/50 hover:border-red-500 transition">
            <p class="text-red-300 font-semibold">${charType}</p>
            <p class="text-3xl font-bold text-red-500">${count}</p>
            <p class="text-xs text-slate-400 mt-2">Found & Removed</p>
        </div>`;
  }

  html += "</div></div>";
  elements.removedDisplay.innerHTML = html;
}

// Display detailed analysis
function displayDetailedAnalysis(
  input,
  foundChars,
) {
  let html = "";
  const charCodes = new Map();
  const hiddenCharSet = new Set();

  // Collect all hidden characters
  for (const category of Object.values(
    HIDDEN_CHARS,
  )) {
    category.chars.forEach((char) =>
      hiddenCharSet.add(char),
    );
  }

  // Analyze input
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const code = char.charCodeAt(0);
    const isHidden = hiddenCharSet.has(char);

    if (isHidden) {
      let charName = "Unknown";
      for (const category of Object.values(
        HIDDEN_CHARS,
      )) {
        if (category.chars.includes(char)) {
          charName = category.name;
          break;
        }
      }

      if (!charCodes.has(code)) {
        charCodes.set(code, {
          char,
          name: charName,
          count: 0,
        });
      }
      charCodes.get(code).count++;
    }
  }

  // Display found characters
  elements.foundCharsList.innerHTML = "";
  elements.unicodePoints.innerHTML = "";

  if (charCodes.size === 0) {
    elements.foundCharsList.innerHTML =
      '<p class="text-slate-400">No hidden characters found</p>';
    elements.unicodePoints.innerHTML =
      '<p class="text-slate-400">No hidden characters found</p>';
    return;
  }

  charCodes.forEach((info, code) => {
    const hex =
      "0x" +
      code
        .toString(16)
        .toUpperCase()
        .padStart(4, "0");
    elements.foundCharsList.innerHTML += `<span class="char-item found"><i class="fas fa-warning mr-1"></i>${info.name}: ${info.count}x (U+${code.toString(16).toUpperCase().padStart(4, "0")})</span>`;
    elements.unicodePoints.innerHTML += `<div><strong>${info.name}</strong> - ${hex} (${code}) - Found: <span class="text-red-400 font-bold">${info.count}x</span></div>`;
  });
}

// Update analysis dashboard
function updateAnalysisDashboard(
  input,
  output,
  foundChars,
) {
  // Category statistics
  elements.categoryStats.innerHTML = "";
  for (const [category, info] of Object.entries(
    foundChars,
  )) {
    elements.categoryStats.innerHTML += `
            <div class="bg-slate-900/50 p-4 rounded-lg border border-slate-700 hover:border-blue-500/50 transition">
                <p class="text-slate-300 font-semibold">${category}</p>
                <p class="text-2xl font-bold text-blue-400">${info}</p>
                <div class="w-full bg-slate-800 rounded-full h-2 mt-2">
                    <div class="bg-blue-500 h-2 rounded-full" style="width: ${Math.min(100, (info / 10) * 100)}%"></div>
                </div>
            </div>
        `;
  }

  // Text statistics
  const inputStats = {
    Characters: input.length,
    Words: input
      .split(/\s+/)
      .filter((w) => w.length > 0).length,
    Lines: input.split("\n").length,
    Spaces: (input.match(/ /g) || []).length,
  };

  const outputStats = {
    Characters: output.length,
    Words: output
      .split(/\s+/)
      .filter((w) => w.length > 0).length,
    Lines: output.split("\n").length,
    Spaces: (output.match(/ /g) || []).length,
  };

  elements.textStats.innerHTML = "";
  const statKeys = [
    "Characters",
    "Words",
    "Lines",
    "Spaces",
  ];
  statKeys.forEach((key) => {
    const diff =
      outputStats[key] - inputStats[key];
    const diffColor =
      diff < 0
        ? "text-red-400"
        : diff > 0
          ? "text-green-400"
          : "text-slate-400";
    elements.textStats.innerHTML += `
            <div class="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                <p class="text-slate-400 text-sm">${key}</p>
                <p class="text-xl font-bold text-blue-300">${outputStats[key]}</p>
                <p class="text-xs ${diffColor}"><i class="fas fa-arrow-${diff < 0 ? "down" : "up"}"></i> ${diff >= 0 ? "+" : ""}${diff}</p>
            </div>
        `;
  });
}

// Compare original and cleaned
function showComparison() {
  const input = elements.input.value;
  const output = elements.output.value;

  if (!input || !output) {
    alert("Please clean the text first!");
    return;
  }

  let htmlInput = escapeHtml(input).replace(
    /./g,
    (char) => {
      if (char.match(/\s/)) return char;
      // Check if character is hidden
      for (const category of Object.values(
        HIDDEN_CHARS,
      )) {
        if (category.chars.includes(char)) {
          return `<span class="hidden-highlight" title="${category.name}: U+${char.charCodeAt(0).toString(16).toUpperCase()}">${char}</span>`;
        }
      }
      return char;
    },
  );

  const html = `
        <div class="comparison-view fade-in">
            <div>
                <h4 class="font-bold text-blue-300 mb-3 flex items-center gap-2">
                    <i class="fas fa-file-lines"></i>Before (With Hidden Chars)
                </h4>
                <div class="char-preview">${htmlInput}</div>
            </div>
            <div>
                <h4 class="font-bold text-green-300 mb-3 flex items-center gap-2">
                    <i class="fas fa-check-circle"></i>After (Cleaned)
                </h4>
                <div class="char-preview">${escapeHtml(output)}</div>
            </div>
        </div>
    `;

  elements.comparisonView.innerHTML = html;
  elements.comparisonView.classList.remove(
    "hidden",
  );
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Copy to clipboard
elements.copyBtn.addEventListener("click", () => {
  if (!elements.output.value) {
    alert("No cleaned text to copy!");
    return;
  }
  navigator.clipboard
    .writeText(elements.output.value)
    .then(() => {
      const original = elements.copyBtn.innerHTML;
      elements.copyBtn.innerHTML =
        '<i class="fas fa-check mr-1"></i>Copied!';
      setTimeout(() => {
        elements.copyBtn.innerHTML = original;
      }, 2000);
    });
});

// Download as text file
elements.downloadBtn.addEventListener(
  "click",
  () => {
    if (!elements.output.value) {
      alert("No cleaned text to download!");
      return;
    }
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," +
        encodeURIComponent(elements.output.value),
    );
    element.setAttribute(
      "download",
      "cleaned_text.txt",
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  },
);

// Paste from clipboard
elements.pasteBtn.addEventListener(
  "click",
  () => {
    navigator.clipboard
      .readText()
      .then((text) => {
        elements.input.value = text;
        stats.inputLength.textContent =
          text.length.toLocaleString();
      })
      .catch(() =>
        alert("Failed to read from clipboard"),
      );
  },
);

// Sample text
elements.sampleBtn.addEventListener(
  "click",
  () => {
    elements.input.value = SAMPLE_TEXT;
    stats.inputLength.textContent =
      SAMPLE_TEXT.length.toLocaleString();
    elements.removedDisplay.innerHTML = "";
    elements.comparisonView.classList.add(
      "hidden",
    );
  },
);

// Update input length as user types
elements.input.addEventListener("input", () => {
  const text = elements.input.value;
  stats.inputLength.textContent =
    text.length.toLocaleString();
  stats.inputLines.textContent =
    text.split("\n").length;
  stats.inputWords.textContent = text
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
});

// Button clicks
elements.cleanBtn.addEventListener(
  "click",
  cleanText,
);
elements.compareBtn.addEventListener(
  "click",
  showComparison,
);

// Keyboard shortcuts
elements.input.addEventListener(
  "keydown",
  (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      cleanText();
    }
  },
);

console.log(
  "🧙‍♂️ Advanced Unicode Cleaner loaded successfully!",
);
