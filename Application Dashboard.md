---
cssclasses: [dashboard]
obsidianUIMode: preview
---

# 🩺 Med School Application Dashboard

> **AMCAS Cycle** · Update this line with your cycle year and rec letter deadlines.

---
## Overview

> [!multi-column]
>
>> [!abstract]+ Composite Score
>> ```dataviewjs
>> const f = dv.current().file.folder;
>> const sc = dv.page([f, "Agent/scorecard"].filter(Boolean).join("/"));
>> const composite = sc.composite || 0;
>> dv.paragraph(`## ${composite}/100`);
>> dv.paragraph(`*Last updated: ${sc.last_updated || "Not yet scored"}*`);
>>
>> const domains = [
>>   ["Experiences", sc.experiences_avg || 0, sc.experiences_trend || "→", sc.experiences_updated || "—"],
>>   ["Personal Statement", sc.ps_avg || 0, sc.ps_trend || "→", sc.ps_updated || "—"],
>>   ["Activities", sc.activities_avg || 0, sc.activities_trend || "→", sc.activities_updated || "—"],
>>   ["Competency Coverage", sc.competency_avg || 0, sc.competency_trend || "→", sc.competency_updated || "—"],
>>   ["Narrative Coherence", sc.coherence_avg || 0, sc.coherence_trend || "→", sc.coherence_updated || "—"],
>> ];
>> dv.table(["Domain", "Score", "Trend", "Updated"], domains);
>> ```
>
>> [!note]+ Hard Metrics
>> ```dataviewjs
>> const f = dv.current().file.folder;
>> const sc = dv.page([f, "Agent/scorecard"].filter(Boolean).join("/"));
>> dv.table(
>>   ["Metric", "Value"],
>>   [
>>     ["GPA Cumulative", sc.gpa_cumulative || "—"],
>>     ["GPA Science/BCPM", sc.gpa_bcpm || "—"],
>>     ["MCAT Total", sc.mcat_total || "—"],
>>     ["MCAT C/P", sc.mcat_cp || "—"],
>>     ["MCAT CARS", sc.mcat_cars || "—"],
>>     ["MCAT B/B", sc.mcat_bb || "—"],
>>     ["MCAT P/S", sc.mcat_ps || "—"],
>>   ]
>> );
>> ```
>
>> [!warning]+ Agent Priorities
>> ![[improvement-priorities#Current Priorities]]
>>
>> **Active Red Flags:** `$= dv.page([dv.current().file.folder, "Agent/scorecard"].filter(Boolean).join("/")).red_flag_count || 0`
>
>> [!todo]+ Meeting To-Dos
>> ```dataviewjs
>> const f = dv.current().file.folder;
>> const mt = dv.page([f, "Agent/meeting-todos"].filter(Boolean).join("/"));
>> const open = mt.open_count || 0;
>> const done = mt.completed_count || 0;
>> dv.paragraph(`**${open} open · ${done} completed**`);
>> dv.paragraph(`*Last updated: ${mt.last_updated || "Not yet synced"}*`);
>> ```
>> [[Agent/meeting-todos|View full to-do list →]]

---
## Scores

> [!multi-column]
>
>> [!abstract]+ Domain Score Profile
>> ```dataviewjs
>> const f = dv.current().file.folder;
>> const sc = dv.page([f, "Agent/scorecard"].filter(Boolean).join("/"));
>> const domains = [
>>   ["Experiences", sc.experiences_avg || 0],
>>   ["Personal Statement", sc.ps_avg || 0],
>>   ["Activities", sc.activities_avg || 0],
>>   ["Competency Coverage", sc.competency_avg || 0],
>>   ["Narrative Coherence", sc.coherence_avg || 0],
>> ];
>> const el = dv.el("div", "");
>> let html = "";
>> for (const [name, score] of domains) {
>>   const pct = Math.round((score / 10) * 100);
>>   const color = score >= 8 ? "#4ade80" : score >= 6 ? "#facc15" : "#f87171";
>>   html += `
>>     <div style="margin-bottom:10px;">
>>       <div style="display:flex;justify-content:space-between;font-size:0.85em;margin-bottom:3px;">
>>         <span>${name}</span>
>>         <span style="font-weight:600;">${score > 0 ? score + "/10" : "—"}</span>
>>       </div>
>>       <div style="background:var(--background-modifier-border);border-radius:4px;height:8px;">
>>         <div style="background:${color};width:${pct}%;height:8px;border-radius:4px;"></div>
>>       </div>
>>     </div>`;
>> }
>> el.innerHTML = html;
>> ```
>
>> [!note]+ Competency Coverage
>> ```dataviewjs
>> const f = dv.current().file.folder;
>> const cc = dv.page([f, "Agent/competency-coverage"].filter(Boolean).join("/"));
>> const competencies = [
>>   ["Commitment to Learning", "commitment_to_learning"],
>>   ["Cultural Awareness", "cultural_awareness"],
>>   ["Cultural Humility", "cultural_humility"],
>>   ["Empathy & Compassion", "empathy_compassion"],
>>   ["Ethical Responsibility", "ethical_responsibility"],
>>   ["Interpersonal Skills", "interpersonal_skills"],
>>   ["Oral Communication", "oral_communication"],
>>   ["Reliability", "reliability"],
>>   ["Resilience/Adaptability", "resilience_adaptability"],
>>   ["Service Orientation", "service_orientation"],
>>   ["Teamwork", "teamwork"],
>>   ["Critical Thinking", "critical_thinking"],
>>   ["Quantitative Reasoning", "quantitative_reasoning"],
>>   ["Scientific Inquiry", "scientific_inquiry"],
>>   ["Written Communication", "written_communication"],
>>   ["Living Systems", "living_systems"],
>>   ["Human Behavior", "human_behavior"],
>> ];
>> const rows = competencies.map(([name, key]) => {
>>   const score = cc[key] || 0;
>>   const tier = score >= 8 ? "🟢 Strong" : score >= 5 ? "🟡 Present" : score > 0 ? "🔴 Thin" : "⚪ Unscored";
>>   return [name, score === 0 ? "—" : score, tier];
>> });
>> dv.table(["Competency", "Score", "Tier"], rows);
>> ```

---

## Application Components

> [!multi-column]
>
>> [!success]+ Personal Statement
>> ```dataviewjs
>> const f = dv.current().file.folder;
>> const ps = dv.page([f, "Personal Statement/ps-scores"].filter(Boolean).join("/"));
>> dv.paragraph(`**Score:** ${ps.avg_score || "Unscored"}/10`);
>> dv.paragraph(`**Last scored:** ${ps.last_scored || "—"}`);
>> dv.paragraph(`**Mode:** ${ps.scored_by || "—"}`);
>> ```
>> [[Personal Statement/Personal Statement Draft|Open Draft →]]
>
>> [!success]+ Activities List
>> ```dataviewjs
>> const f = dv.current().file.folder;
>> const ac = dv.page([f, "Activities/activities-scores"].filter(Boolean).join("/"));
>> dv.paragraph(`**Score:** ${ac.avg_score || "Unscored"}/10`);
>> dv.paragraph(`**Last scored:** ${ac.last_scored || "—"}`);
>> dv.paragraph(`**Mode:** ${ac.scored_by || "—"}`);
>> ```
>> [[Activities/Activities Master|Open Activities →]]
>
>> [!todo]+ Rec Letters
>> ```dataviewjs
>> const f = dv.current().file.folder;
>> const folder = f ? `"${f}/Rec Letters"` : `"Rec Letters"`;
>> const letters = dv.pages(folder).where(p => p.component === "rec-letter");
>> const total = letters.length;
>> const submitted = letters.where(p => p.hca_submitted === true).length;
>> dv.paragraph(`**${submitted} of ${total} submitted to HCA**`);
>> for (const l of letters) {
>>   const icon = l.hca_submitted ? "✅" : l.status === "draft" ? "✏️" : "📬";
>>   dv.paragraph(`${icon} [[${l.file.name}|${l.recommender}]] — ${l.status}`);
>> }
>> ```
>
>> [!success]+ Impactful Experience
>> ```dataviewjs
>> const f = dv.current().file.folder;
>> const ie = dv.page([f, "Impactful Experience/impactful-experience-scores"].filter(Boolean).join("/"));
>> dv.paragraph(`**Score:** ${ie.avg_score || "Unscored"}/10`);
>> dv.paragraph(`**Last scored:** ${ie.last_scored || "—"}`);
>> dv.paragraph(`**Mode:** ${ie.scored_by || "—"}`);
>> ```
>> [[Impactful Experience/Impactful Experience Draft|Open Draft →]]
>
>> [!todo]+ Secondaries
>> *Coming once secondary invitations arrive.*
>> [[Secondaries/README|View folder →]]
