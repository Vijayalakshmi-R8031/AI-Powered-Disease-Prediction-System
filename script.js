/* ===== Simple demo prediction model (front-end) =====
   Weighted-score model. Weights are illustrative only.
   For production replace with validated ML model on server.
*/

function predictRisk(inputs) {
  // inputs: {age, fever, cough, fatigue, breath, preexist}
  let score = 0;

  // base: age
  if (inputs.age >= 60) score += 2;
  else if (inputs.age >= 45) score += 1;
  // fever strong signal
  if (inputs.fever === 1) score += 2;
  // cough
  if (inputs.cough === 1) score += 1;
  // fatigue (0-5)
  score += (inputs.fatigue * 0.4);
  // breathing
  score += (inputs.breath * 1.5);
  // preexisting multiplier (value contains risk factor)
  score *= inputs.preexist;

  // normalize into probability-like 0-100
  let raw = Math.min(10, score); // cap
  const probability = Math.round((raw / 10) * 100);

  // classification
  let label = "Low";
  if (probability >= 70) label = "High";
  else if (probability >= 40) label = "Moderate";

  return { probability, label, raw };
}

/* ===== UI wiring for predict.html ===== */
document.addEventListener("DOMContentLoaded", () => {
  const predictBtn = document.getElementById("predict-btn");
  const resetBtn = document.getElementById("reset-btn");
  if (predictBtn) {
    predictBtn.addEventListener("click", () => {
      const age = Number(document.getElementById("age").value || 0);
      const fever = Number(document.getElementById("fever").value || 0);
      const cough = Number(document.getElementById("cough").value || 0);
      const fatigue = Number(document.getElementById("fatigue").value || 0);
      const breath = Number(document.getElementById("breath").value || 0);
      const preexist = Number(document.getElementById("preexist").value || 0);

      const result = predictRisk({ age, fever, cough, fatigue, breath, preexist });

      const riskText = document.getElementById("risk-text");
      const adviceText = document.getElementById("advice-text");

      riskText.innerHTML = `<strong>Risk:</strong> ${result.label} — ${result.probability}% probability`;
      if (result.label === "High") {
        adviceText.innerHTML = "Advice: Seek medical attention immediately and consider contacting a healthcare provider.";
      } else if (result.label === "Moderate") {
        adviceText.innerHTML = "Advice: Monitor symptoms closely. Consider teleconsultation if symptoms persist or worsen.";
      } else {
        adviceText.innerHTML = "Advice: Low immediate risk. Rest, hydrate, and consult a doctor if new symptoms appear.";
      }

      // speak result (optional)
      if (window.speechSynthesis) {
        const utter = new SpeechSynthesisUtterance(`Predicted risk is ${result.label} with probability ${result.probability} percent.`);
        window.speechSynthesis.speak(utter);
      }
    });

    resetBtn.addEventListener("click", () => {
      ["age","fever","cough","fatigue","breath","preexist"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          if (el.tagName === "SELECT") el.selectedIndex = 0;
          else el.value = "";
        }
      });
      document.getElementById("risk-text").textContent = "No prediction yet.";
      document.getElementById("advice-text").textContent = "";
    });
  }

  /* === tiny assistant on index (demo) === */
  const asend = document.getElementById("assistant-send");
  const ainput = document.getElementById("assistant-input");
  const amsg = document.getElementById("assistant-messages");
  if (asend) {
    asend.addEventListener("click", () => {
      const text = (ainput.value || "").trim().toLowerCase();
      if (!text) return;
      appendAssistant(`You: ${ainput.value}`);
      ainput.value = "";
      if (text.includes("predict")) {
        appendAssistant("Assistant: Open the Predict page and fill the form to get a risk score.");
      } else if (text.includes("help")) {
        appendAssistant("Assistant: Try: 'predict', 'how it works', or 'about'.");
      } else if (text.includes("how")) {
        appendAssistant("Assistant: This demo uses a small weighted algorithm in JavaScript to estimate risk.");
      } else {
        appendAssistant("Assistant: Sorry, I didn't understand. Type 'help' for options.");
      }
    });
  }

  function appendAssistant(msg) {
    const p = document.createElement("p");
    p.textContent = msg;
    amsg.appendChild(p);
    amsg.scrollTop = amsg.scrollHeight;
  }
});
