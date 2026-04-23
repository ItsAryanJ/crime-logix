// ============================================================
// script.js — CrimeLogix Frontend Logic
// Handles UI interactions, data management, and API calls.
// ============================================================

(function () {
    "use strict";

    // --- State ---
    const state = {
        suspects: [],
        evidence: [],
        statements: [],
        lastResults: null,
    };

    // API base (same origin)
    const API_BASE = window.location.origin;

    // --- DOM References ---
    const dom = {
        // Server status
        statusDot: document.querySelector(".status-dot"),
        statusText: document.querySelector(".status-text"),

        // Suspect inputs
        suspectName: document.getElementById("suspect-name"),
        addSuspectBtn: document.getElementById("add-suspect-btn"),
        suspectList: document.getElementById("suspect-list"),
        suspectCount: document.getElementById("suspect-count"),

        // Evidence inputs
        evidenceType: document.getElementById("evidence-type"),
        evidenceDesc: document.getElementById("evidence-desc"),
        evidenceSuspect: document.getElementById("evidence-suspect"),
        addEvidenceBtn: document.getElementById("add-evidence-btn"),
        evidenceList: document.getElementById("evidence-list"),
        evidenceCount: document.getElementById("evidence-count"),

        // Statement inputs
        witnessName: document.getElementById("witness-name"),
        statementSuspect: document.getElementById("statement-suspect"),
        statementClaim: document.getElementById("statement-claim"),
        addStatementBtn: document.getElementById("add-statement-btn"),
        statementList: document.getElementById("statement-list"),
        statementCount: document.getElementById("statement-count"),

        // Action buttons
        loadSampleBtn: document.getElementById("load-sample-btn"),
        clearAllBtn: document.getElementById("clear-all-btn"),
        runBtn: document.getElementById("run-investigation-btn"),

        // Results
        resultsSection: document.getElementById("results-section"),
        primeAvatar: document.getElementById("prime-avatar"),
        primeName: document.getElementById("prime-name"),
        primeScore: document.getElementById("prime-score"),
        rankingTbody: document.getElementById("ranking-tbody"),
        contradictionList: document.getElementById("contradiction-list"),
        contradictionCountBadge: document.getElementById("contradiction-count-badge"),
        explanationText: document.getElementById("explanation-text"),
    };

    // --- Initialization ---
    function init() {
        bindEvents();
        checkServerStatus();
        updateRunButton();
    }

    // --- Event Binding ---
    function bindEvents() {
        // Add suspect
        dom.addSuspectBtn.addEventListener("click", addSuspect);
        dom.suspectName.addEventListener("keydown", function (e) {
            if (e.key === "Enter") addSuspect();
        });

        // Add evidence
        dom.addEvidenceBtn.addEventListener("click", addEvidence);
        dom.evidenceDesc.addEventListener("keydown", function (e) {
            if (e.key === "Enter") addEvidence();
        });

        // Add statement
        dom.addStatementBtn.addEventListener("click", addStatement);
        dom.witnessName.addEventListener("keydown", function (e) {
            if (e.key === "Enter") addStatement();
        });

        // Action buttons
        dom.loadSampleBtn.addEventListener("click", loadSampleCase);
        dom.clearAllBtn.addEventListener("click", clearAll);
        dom.runBtn.addEventListener("click", runInvestigation);
    }

    // --- Server Status Check ---
    function checkServerStatus() {
        fetch(API_BASE + "/api/results")
            .then(function () {
                dom.statusDot.classList.add("online");
                dom.statusDot.classList.remove("offline");
                dom.statusText.textContent = "Server Online";
            })
            .catch(function () {
                dom.statusDot.classList.add("offline");
                dom.statusDot.classList.remove("online");
                dom.statusText.textContent = "Server Offline";
            });
    }

    // --- Suspect Management ---
    function addSuspect() {
        var name = dom.suspectName.value.trim();
        if (!name) return;

        // Check for duplicates
        if (state.suspects.indexOf(name) !== -1) {
            shakeElement(dom.suspectName);
            return;
        }

        state.suspects.push(name);
        dom.suspectName.value = "";
        dom.suspectName.focus();

        renderSuspectList();
        updateSuspectDropdowns();
        updateRunButton();
    }

    function removeSuspect(index) {
        var removed = state.suspects[index];
        state.suspects.splice(index, 1);

        // Remove related evidence and statements
        state.evidence = state.evidence.filter(function (e) { return e.suspect !== removed; });
        state.statements = state.statements.filter(function (s) { return s.suspect !== removed; });

        renderSuspectList();
        renderEvidenceList();
        renderStatementList();
        updateSuspectDropdowns();
        updateRunButton();
    }

    function renderSuspectList() {
        dom.suspectList.innerHTML = "";
        dom.suspectCount.textContent = state.suspects.length;

        state.suspects.forEach(function (name, index) {
            var li = document.createElement("li");
            li.innerHTML =
                '<div class="item-text"><span>👤</span><span>' + escapeHtml(name) + '</span></div>' +
                '<button class="remove-btn" title="Remove">&times;</button>';
            li.querySelector(".remove-btn").addEventListener("click", function () {
                removeSuspect(index);
            });
            dom.suspectList.appendChild(li);
        });
    }

    // --- Evidence Management ---
    function addEvidence() {
        var type = dom.evidenceType.value;
        var desc = dom.evidenceDesc.value.trim();
        var suspect = dom.evidenceSuspect.value;

        if (!type || !desc || !suspect) {
            if (!type) shakeElement(dom.evidenceType);
            if (!desc) shakeElement(dom.evidenceDesc);
            if (!suspect) shakeElement(dom.evidenceSuspect);
            return;
        }

        state.evidence.push({ type: type, description: desc, suspect: suspect });
        dom.evidenceType.selectedIndex = 0;
        dom.evidenceDesc.value = "";
        dom.evidenceSuspect.selectedIndex = 0;

        renderEvidenceList();
        updateRunButton();
    }

    function removeEvidence(index) {
        state.evidence.splice(index, 1);
        renderEvidenceList();
        updateRunButton();
    }

    function renderEvidenceList() {
        dom.evidenceList.innerHTML = "";
        dom.evidenceCount.textContent = state.evidence.length;

        state.evidence.forEach(function (ev, index) {
            var li = document.createElement("li");
            li.innerHTML =
                '<div class="item-text">' +
                '<span class="item-tag">' + escapeHtml(ev.type) + '</span>' +
                '<span>' + escapeHtml(ev.description) + '</span>' +
                '<span class="item-tag" style="background:rgba(240,178,50,0.15);color:#f0b232;">→ ' + escapeHtml(ev.suspect) + '</span>' +
                '</div>' +
                '<button class="remove-btn" title="Remove">&times;</button>';
            li.querySelector(".remove-btn").addEventListener("click", function () {
                removeEvidence(index);
            });
            dom.evidenceList.appendChild(li);
        });
    }

    // --- Statement Management ---
    function addStatement() {
        var witness = dom.witnessName.value.trim();
        var suspect = dom.statementSuspect.value;
        var claim = dom.statementClaim.value;

        if (!witness || !suspect || !claim) {
            if (!witness) shakeElement(dom.witnessName);
            if (!suspect) shakeElement(dom.statementSuspect);
            if (!claim) shakeElement(dom.statementClaim);
            return;
        }

        state.statements.push({ witness: witness, suspect: suspect, claim: claim });
        dom.witnessName.value = "";
        dom.statementSuspect.selectedIndex = 0;
        dom.statementClaim.selectedIndex = 0;
        dom.witnessName.focus();

        renderStatementList();
        updateRunButton();
    }

    function removeStatement(index) {
        state.statements.splice(index, 1);
        renderStatementList();
        updateRunButton();
    }

    var CLAIM_LABELS = {
        was_at_scene: "Was at scene",
        was_not_at_scene: "Was NOT at scene",
        has_motive: "Has motive",
        no_motive: "No motive",
        has_alibi: "Has alibi",
        is_suspicious: "Is suspicious",
        is_not_suspicious: "Is NOT suspicious",
    };

    function renderStatementList() {
        dom.statementList.innerHTML = "";
        dom.statementCount.textContent = state.statements.length;

        state.statements.forEach(function (st, index) {
            var claimLabel = CLAIM_LABELS[st.claim] || st.claim;
            var li = document.createElement("li");
            li.innerHTML =
                '<div class="item-text">' +
                '<span>💬</span>' +
                '<span><strong>' + escapeHtml(st.witness) + '</strong> says ' +
                '<em>' + escapeHtml(st.suspect) + '</em>: ' + escapeHtml(claimLabel) + '</span>' +
                '</div>' +
                '<button class="remove-btn" title="Remove">&times;</button>';
            li.querySelector(".remove-btn").addEventListener("click", function () {
                removeStatement(index);
            });
            dom.statementList.appendChild(li);
        });
    }

    // --- Suspect Dropdowns ---
    function updateSuspectDropdowns() {
        var dropdowns = [dom.evidenceSuspect, dom.statementSuspect];

        dropdowns.forEach(function (select) {
            var currentVal = select.value;
            // Keep first disabled option
            while (select.options.length > 1) {
                select.remove(1);
            }
            state.suspects.forEach(function (name) {
                var opt = document.createElement("option");
                opt.value = name;
                opt.textContent = name;
                select.appendChild(opt);
            });
            // Restore selection if still valid
            if (state.suspects.indexOf(currentVal) !== -1) {
                select.value = currentVal;
            }
        });
    }

    // --- Run Button State ---
    function updateRunButton() {
        dom.runBtn.disabled = state.suspects.length === 0;
    }

    // --- Run Investigation ---
    function runInvestigation() {
        if (state.suspects.length === 0) return;

        var payload = {
            suspects: state.suspects,
            evidence: state.evidence,
            statements: state.statements,
        };

        // Set loading state
        dom.runBtn.classList.add("loading");
        dom.runBtn.disabled = true;

        fetch(API_BASE + "/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
            .then(function (res) {
                if (!res.ok) throw new Error("Server error: " + res.status);
                return res.json();
            })
            .then(function (data) {
                if (data.error) throw new Error(data.error);
                state.lastResults = data;
                displayResults(data);
            })
            .catch(function (err) {
                alert("Investigation failed: " + err.message + "\n\nMake sure the Prolog server is running on port 5000.");
            })
            .finally(function () {
                dom.runBtn.classList.remove("loading");
                dom.runBtn.disabled = false;
            });
    }

    // --- Display Results ---
    function displayResults(data) {
        dom.resultsSection.classList.remove("hidden");

        // Scroll to results
        setTimeout(function () {
            dom.resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);

        // Most likely suspect
        var mostLikely = data.most_likely || "Unknown";
        dom.primeAvatar.textContent = mostLikely.charAt(0).toUpperCase();
        dom.primeName.textContent = mostLikely;

        var topScore = 0;
        if (data.ranking && data.ranking.length > 0) {
            topScore = data.ranking[0].score;
        }
        dom.primeScore.textContent = "Suspicion Score: " + topScore;

        // Ranking table
        renderRankingTable(data.ranking || []);

        // Contradictions
        renderContradictions(data.contradictions || []);

        // Explanation
        var explanationParts = (data.explanation || "No explanation available.").split(" | ");
        dom.explanationText.textContent = explanationParts.join("\n");
    }

    // --- Render Ranking Table ---
    function renderRankingTable(ranking) {
        dom.rankingTbody.innerHTML = "";

        if (ranking.length === 0) {
            var tr = document.createElement("tr");
            tr.innerHTML = '<td colspan="4" style="text-align:center;color:var(--text-muted);">No suspects analyzed.</td>';
            dom.rankingTbody.appendChild(tr);
            return;
        }

        var maxScore = Math.max(1, ranking[0].score);

        ranking.forEach(function (entry, index) {
            var tr = document.createElement("tr");
            if (index === 0 && entry.score > 0) tr.classList.add("top-suspect");

            var pct = Math.max(0, Math.round((entry.score / maxScore) * 100));
            var threatClass = pct >= 70 ? "threat-high" : (pct >= 40 ? "threat-medium" : "threat-low");

            tr.innerHTML =
                '<td class="rank-num">#' + (index + 1) + '</td>' +
                '<td><strong>' + escapeHtml(String(entry.suspect)) + '</strong></td>' +
                '<td class="rank-score">' + entry.score + '</td>' +
                '<td>' +
                '<div class="threat-bar-container">' +
                '<div class="threat-bar"><div class="threat-bar-fill ' + threatClass + '" style="width:' + pct + '%;"></div></div>' +
                '<span style="font-size:0.75rem;color:var(--text-muted);">' + pct + '%</span>' +
                '</div>' +
                '</td>';
            dom.rankingTbody.appendChild(tr);

            // Animate threat bar
            var fill = tr.querySelector(".threat-bar-fill");
            fill.style.width = "0%";
            setTimeout(function () {
                fill.style.width = pct + "%";
            }, 100 + index * 80);
        });
    }

    // --- Render Contradictions ---
    function renderContradictions(contradictions) {
        dom.contradictionList.innerHTML = "";
        dom.contradictionCountBadge.textContent = contradictions.length;

        if (contradictions.length === 0) {
            var li = document.createElement("li");
            li.className = "no-data";
            li.textContent = "✅ No contradictions detected. Witness statements are consistent.";
            dom.contradictionList.appendChild(li);
            return;
        }

        contradictions.forEach(function (text) {
            var li = document.createElement("li");
            li.className = "contradiction-item";
            li.textContent = text;
            dom.contradictionList.appendChild(li);
        });
    }

    // --- Load Sample Case ---
    function loadSampleCase() {
        clearAll();

        var sampleSuspects = ["Marcus Webb", "Diana Cross", "Leo Finch"];
        var sampleEvidence = [
            { type: "fingerprint", description: "Found on murder weapon (kitchen knife)", suspect: "Marcus Webb" },
            { type: "dna", description: "Hair sample found at crime scene entrance", suspect: "Diana Cross" },
            { type: "digital", description: "Threatening emails sent to victim", suspect: "Marcus Webb" },
            { type: "fibers", description: "Clothing fibers on victim's jacket", suspect: "Leo Finch" },
        ];
        var sampleStatements = [
            { witness: "Mrs. Chen", suspect: "Marcus Webb", claim: "was_at_scene" },
            { witness: "Mr. Patel", suspect: "Marcus Webb", claim: "has_motive" },
            { witness: "Ms. Torres", suspect: "Diana Cross", claim: "was_at_scene" },
            { witness: "Mr. Brooks", suspect: "Diana Cross", claim: "was_not_at_scene" },
            { witness: "Mrs. Chen", suspect: "Leo Finch", claim: "has_alibi" },
            { witness: "Mr. Patel", suspect: "Leo Finch", claim: "was_at_scene" },
            { witness: "Ms. Torres", suspect: "Leo Finch", claim: "is_suspicious" },
        ];

        sampleSuspects.forEach(function (name) {
            state.suspects.push(name);
        });

        sampleEvidence.forEach(function (ev) {
            state.evidence.push(ev);
        });

        sampleStatements.forEach(function (st) {
            state.statements.push(st);
        });

        renderSuspectList();
        updateSuspectDropdowns();
        renderEvidenceList();
        renderStatementList();
        updateRunButton();
    }

    // --- Clear All ---
    function clearAll() {
        state.suspects = [];
        state.evidence = [];
        state.statements = [];
        state.lastResults = null;

        renderSuspectList();
        updateSuspectDropdowns();
        renderEvidenceList();
        renderStatementList();
        updateRunButton();

        dom.resultsSection.classList.add("hidden");
    }

    // --- Utility: Escape HTML ---
    function escapeHtml(str) {
        var div = document.createElement("div");
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // --- Utility: Shake Animation ---
    function shakeElement(el) {
        el.style.animation = "none";
        el.offsetHeight; // force reflow
        el.style.animation = "shake 0.4s ease";
        setTimeout(function () {
            el.style.animation = "";
        }, 400);
    }

    // Add shake keyframes dynamically
    var shakeStyle = document.createElement("style");
    shakeStyle.textContent =
        "@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }";
    document.head.appendChild(shakeStyle);

    // --- Boot ---
    document.addEventListener("DOMContentLoaded", init);
})();
