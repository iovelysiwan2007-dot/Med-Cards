import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Allow enough time for deep clinical reasoning cases

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const serverCache = new Map<string, any>();

export async function POST(req: NextRequest) {
  try {
    const { muscle, condition, stage, severity } = await req.json();

    if (!muscle || !condition) {
      return NextResponse.json({ error: "Muscle and condition are required." }, { status: 400 });
    }

    const sKey = `${muscle.id}_${condition}_${stage}_${severity}`.replace(/\s+/g, '_');
    if (serverCache.has(sKey)) {
      console.log(`[ClinicalIQ Server Cache] Serving cached case for: ${sKey}`);
      return NextResponse.json(serverCache.get(sKey));
    }

    const systemPrompt = `You are an elite academic professor of Physical Therapy and Clinical Reasoning.
Your specialty is designing highly realistic, anatomically correct, and muscle-specific clinical simulation scenarios for Bachelor of Physiotherapy (BPT) students.

Your goal is to generate a comprehensive, highly authentic clinical reasoning case based on a specific muscle and condition.
Every single finding, test, positioning, and treatment choice MUST be strictly muscle-specific and condition-specific.

DO NOT use generic clinical templates. Every element must be meticulously customized to the specific muscle and condition:
Muscle: ${muscle.muscleName}
Origin: ${muscle.origin}
Insertion: ${muscle.insertion}
Innervation: ${muscle.innervation}
Root Value: ${muscle.rootValue}
Primary Action: ${muscle.primaryAction}
Secondary Actions: ${JSON.stringify(muscle.secondaryActions)}
Functional Role: ${muscle.functionalRole || "Skeletal movement stabilizer"}
Clinical Importance: ${muscle.clinicalImportance}
Physiotherapy Relevance: ${muscle.physiotherapyRelevance}

Selected Condition: ${condition}
Selected Healing Stage: ${stage}
Selected Severity: ${severity}

Ensure the output is valid JSON matching the exact requested schema structure.`;

    const userPrompt = `Generate a comprehensive clinical simulation case for BPT students studying:
Muscle: ${muscle.muscleName}
Condition: ${condition}
Stage: ${stage}
Severity: ${severity}

Return a single JSON object with the following fields:

1. "muscleId": String matching "${muscle.id}"
2. "muscleName": String matching "${muscle.muscleName}"
3. "condition": String matching "${condition}"
4. "stage": String matching "${stage}"
5. "severity": String matching "${severity}"
6. "patientPresentation": An object containing:
   - "age": Number (realistic, e.g. 18-70)
   - "gender": String (Male/Female)
   - "occupation": String (muscle-relevant, e.g. "Builder" for rotator cuff, "Runner" for gastrocnemius)
   - "chiefComplaint": String (highly realistic chief complaint)
   - "historyOfPresentIllness": String (detailed description of onset, mechanism of injury, progression)
   - "onset": String (Acute onset or Gradual/Insidious)
   - "mechanismOfInjury": String (exact mechanism, e.g. eccentric overload, sudden deceleration, repetitive overhead activity)
   - "painPattern": String (precise location, radiating pattern if applicable, type of pain e.g., deep ache, sharp on resistance)
   - "painSeverity": Number (0-10 scale appropriate to condition and stage)
   - "aggravatingFactors": String (physiotherapist activities, specific joint angles, movements)
   - "relievingFactors": String (positioning, rest, etc.)
   - "swellingBruising": String (detailed local examination report)
   - "romChanges": String (specific passive/active ranges in degrees, indicating painful arcs or capsular vs non-capsular patterns)
   - "strengthChanges": String (resisted isometric strength, e.g., "Strong and painful" or "Weak and painless" with grades)
   - "palpationFindings": String (exact clinical locations e.g. lateral facet, musculotendinous junction, trigger point location)
   - "functionalLimitations": String (activities of daily living, sports limits)
   - "movementPattern": String (movement substitution, antalgic posture, limps)
   - "neurologicalFindings": String (sensory, motor, or reflex findings, or "Intact and normal" if not relevant)

7. "localization": An object containing:
   - "correctStructureType": Choose one: "Muscle" | "Tendon" | "Nerve" | "Joint" | "Ligament" | "Bone" | "Other" (based on condition, e.g., tendinopathy is "Tendon", strain is "Muscle", entrapment is "Nerve")
   - "correctStructureName": String (e.g. "${muscle.muscleName} Muscle" or "${muscle.muscleName} Tendon")
   - "explanation": String (detailed explanation connecting mechanism and OIAN to this structure)
   - "studentWhyPrompt": String (a specific question asking the student to justify this choice)

8. "differentials": An array of exactly 3 objects. Do NOT use the same differentials for every case. Each object contains:
   - "name": String (different, plausible diagnosis, e.g. referred pain from cervical spine, bursitis, different muscle tear)
   - "type": Choose one: "Most likely" | "Possible" | "Less likely" (only ONE can be "Most likely", which corresponds to our actual condition)
   - "whyPossible": String (clinical reasoning for listing it)
   - "supportingFindings": String (findings from the case that support this differential)
   - "opposingFindings": String (findings from the case that rule this differential out or make it less likely)

9. "testSelection": An object containing:
   - "availableTests": An array of exactly 5 realistic tests. Only include tests that are actually relevant to this body region/muscle/tissue. Include:
     * 1 or 2 highly appropriate Special Tests for this specific muscle/condition (e.g., Empty Can for supraspinatus, Thompson test for Achilles, etc.)
     * 1 or 2 general assessments that are clinically correct for this stage (e.g. passive stretching, resisted contraction)
     * 1 or 2 tests that are inappropriate/negative/unnecessary (e.g. neurological neurodynamic test for a simple tendon case, or joint laxity test)
     Each test object must have:
       * "id": String (e.g. "test_1", "test_2", etc.)
       * "name": String (e.g., "Empty Can Test", "Resisted Wrist Extension")
       * "category": "Muscle" | "Tendon" | "Nerve" | "Joint" | "Special" | "MMT" | "Length" | "Neuro"
       * "isAppropriate": Boolean (true if appropriate to perform for diagnosis, false if irrelevant or contraindicated)
       * "purpose": String (what the test physically evaluates)
       * "appropriatenessReason": String (detailed reason why this test is appropriate or inappropriate for this exact patient presentation and stage)
       * "patientPosition": String (precise patient setup)
       * "therapistPosition": String (precise therapist position)
       * "startingPosition": String (exact starting joint angles)
       * "stabilization": String (how the therapist stabilizes the proximal joints)
       * "procedure": String (step-by-step instructions on what is done)
       * "resistance": String (if resisted, where and how resistance is applied; otherwise "N/A")
       * "expectedNormal": String (what is found in a healthy subject)
       * "positiveFinding": String (what constitutes an abnormal/positive test)
       * "interpretation": String (what a positive or negative result means for this case)
       * "limitation": String (limitations of this test, e.g., low specificity, cannot distinguish tear size)
       * "precautions": String (precautions, e.g., high tissue irritability, pain)
   - "correctTestIds": Array of strings containing the ids of tests where isAppropriate is true.

10. "mmtDetails": An object (Required if MMT is appropriate for this muscle/condition, otherwise null):
   - "muscleName": String (${muscle.muscleName})
   - "action": String (specific action being tested)
   - "patientPosition": String (exact positioning, e.g., "Prone with knee flexed to 90" or "Sitting with arm abducted")
   - "therapistPosition": String (exact positioning)
   - "stabilization": String (proximal joint stabilization)
   - "resistanceLocation": String (exact hand placement for resistance)
   - "resistanceDirection": String (exact vector of force)
   - "substitutionPatterns": String (how the patient tries to cheat, e.g., using upper trapezius or trunk rotation)
   - "correctGrade": Number (from 0 to 5, reflecting the severity/stage of this case. E.g., Grade 3 if can hold against gravity but no resistance, Grade 5 if normal, Grade 2 if gravity-eliminated only)
   - "findingText": String (description of the physical response when tested, e.g., "Patient abducts shoulder to 90 degrees in sitting. When moderate pressure is applied, the arm immediately gives way due to sharp local pain.")

11. "muscleLengthTest": An object (Required if stretching/length testing is appropriate, otherwise null):
   - "testName": String
   - "patientPosition": String
   - "jointPosition": String
   - "movementToLengthen": String (anatomical movement to stretch this muscle)
   - "assessmentGoal": String (what is being assessed)
   - "positiveFinding": String (e.g. restriction in range of motion, pain at end range)
   - "interpretation": String (meaning of the finding)
   - "precautions": String (contraindications or caution)
   - "findingText": String (what is found in this specific patient, e.g. "Severe limitation in passive lengthening with immediate muscular spasm at 45 degrees of range.")

12. "neuroAssessment": An object (Required if nerve involvement is suspected or needs ruling out, otherwise null):
   - "sensoryExam": String (dermatomal findings)
   - "myotomes": String (myotome findings)
   - "reflexes": String (deep tendon reflex findings)
   - "peripheralNerve": String (peripheral nerve sensation and motor findings)
   - "neuralTension": String (e.g. Upper Limb Tension Test or SLR results)
   - "motorTesting": String (individual nerve-specific testing)
   - "distribution": String (anatomic nerve pathway)
   - "functionalFindings": String (e.g. winging of scapula, foot drop)
   - "findingText": String (specific findings, e.g. "Numbness along the lateral aspect of the shoulder, biceps reflex normal.")

13. "problemList": An object containing:
   - "allOptions": Array of 5 objects representing potential problems, each with:
     * "id": String (e.g., "prob_1")
     * "name": String (e.g., "Severe localized pain", "Decreased passive ROM", "Muscle weakness", "Gait deviation", "Impaired motor control")
     * "description": String
     * "isActualProblem": Boolean (true if this problem is active in this case)
   - "correctSequence": Array of strings (the ids of the true problems sorted in order of clinical priority, e.g. pain/irritability first, then weakness, then ROM limits, then function)

14. "goals": An object containing:
   - "shortTerm": Array of strings (2-3 highly specific, measurable short-term goals appropriate for the stage, e.g. "Reduce pain from 7/10 to 3/10 within 2 weeks")
   - "longTerm": Array of strings (2-3 measurable long-term goals, e.g. "Restore full shoulder flexion range to 180 degrees in 6 weeks")
   - "functional": Array of strings (1-2 functional goals, e.g. "Able to reach into the overhead cupboard to retrieve a cup without pain")

15. "treatment": An object containing:
   - "availableInterventions": An array of exactly 5 interventions. Meticulously align these with the tissue-healing stage (Acute = protective, gentle AROM/isometrics; Chronic = progressive loading, eccentric, stretching). Include:
     * 2 or 3 highly appropriate interventions (e.g., "Sub-maximal pain-free isometrics" in acute tendon, "Eccentric calf raises" in chronic tendinopathy)
     * 2 inappropriate interventions (e.g., "Aggressive passive stretching" in acute muscle tear, or "High-velocity manipulation" in highly irritable tissues)
     Each intervention object contains:
       * "id": String (e.g., "int_1")
       * "name": String (e.g., "Pain-free Submaximal Isometrics")
       * "category": String
       * "isAppropriate": Boolean
       * "appropriatenessReason": String (detailed physiological/clinical justification)
       * "procedure": String (how it is performed)
       * "expectedOutcome": String (physiological effect)
       * "progressionCriteria": String (when the patient is ready to advance)
   - "correctInterventionIds": Array of strings of appropriate interventions.

16. "contraindications": An object containing:
   - "options": An array of exactly 4 actions/modalities, some contraindicated:
     * "id": String (e.g., "cont_1")
     * "name": String (e.g., "Deep transverse friction massage", "Aggressive heat therapy", "Resisted eccentric testing")
     * "description": String
     * "isContraindicated": Boolean
     * "reason": String (exact physiological reason why it would harm the healing tissue in this stage)
   - "correctContraindicatedIds": Array of strings of contraindicated options.

17. "reassessment": An object containing:
   - "originalFindingsRecall": String (summary of baseline findings)
   - "followUpScenario": String (a paragraph detailing the patient returning 4 weeks later, describing their subjective reports of improvement and compliance with home exercises)
   - "timeframe": String (e.g. "4 weeks post-initial assessment")
   - "reassessmentFindings": String (specific measurements, e.g., "Pain is now 2/10. MMT is Grade 4+. Active range is fully restored.")
   - "correctAction": "Continue" | "Progress" | "Modify" | "Refer"
   - "correctActionReason": String (clinical justification for the decision)

18. "qualityControl": An object containing:
   - "sourceReference": String (e.g., "Magee's Orthopedic Physical Assessment" or "Dutton's Orthopaedic Physical Therapy")
   - "evidenceStatus": String (e.g., "Level I Evidence / Peer Reviewed Guidelines")
   - "reviewer": String (e.g., "Prof. A. Nair, BPT, MPT (Ortho), Senior Academic Reviewer")
   - "lastReviewedDate": String (e.g., "2026-08-15")

CRITICAL: Return ONLY raw, valid JSON. Do not wrap the JSON in Markdown backticks (like \`\`\`json) or any explanation. Ensure all double quotes are properly escaped and the JSON compiles successfully.`;

    // Let's implement a robust retry/fallback engine to handle any high demand (503) or transient API errors
    const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.5-pro"];
    let response = null;
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting to generate clinical case using model: ${modelName}`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: [
            { text: systemPrompt },
            { text: userPrompt }
          ],
          config: {
            responseMimeType: "application/json",
          }
        });
        if (response && response.text) {
          console.log(`Successfully generated clinical case using model: ${modelName}`);
          break; // Success! Break out of the loop
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} failed or was busy:`, err.message || err);
        lastError = err;
        // Wait a small moment before trying the next model
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error("All generative models are currently experiencing high demand. Please try again in a few moments.");
    }

    const text = response.text || "{}";
    const cleanedText = text.trim();
    
    // Attempt to parse to ensure it's valid JSON
    let parsedData;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("JSON Parsing Error from Gemini output:", parseError);
      console.log("Raw output was:", text);
      return NextResponse.json({ error: "Failed to parse simulation data", raw: text }, { status: 500 });
    }

    // Defensive schema validation & repair to guarantee the client never crashes
    try {
      if (!parsedData) parsedData = {};
      if (!parsedData.muscleId) parsedData.muscleId = muscle.id;
      if (!parsedData.muscleName) parsedData.muscleName = muscle.muscleName;
      if (!parsedData.condition) parsedData.condition = condition;
      if (!parsedData.stage) parsedData.stage = stage;
      if (!parsedData.severity) parsedData.severity = severity;
      
      if (!parsedData.patientPresentation) {
        parsedData.patientPresentation = {};
      }
      const pp = parsedData.patientPresentation;
      if (pp.age === undefined) pp.age = 35;
      if (!pp.gender) pp.gender = "Female";
      if (!pp.occupation) pp.occupation = "Office worker";
      if (!pp.chiefComplaint) pp.chiefComplaint = `Aching pain in the ${muscle.muscleName} region.`;
      if (!pp.historyOfPresentIllness) pp.historyOfPresentIllness = `Patient reports gradual onset of pain in the ${muscle.muscleName} region after repetitive strain.`;
      if (!pp.onset) pp.onset = "Gradual/Insidious";
      if (!pp.mechanismOfInjury) pp.mechanismOfInjury = "Repetitive mechanical strain during daily activities.";
      if (!pp.painPattern) pp.painPattern = "Dull ache localized over the muscle belly.";
      if (pp.painSeverity === undefined) pp.painSeverity = 5;
      if (!pp.aggravatingFactors) pp.aggravatingFactors = "Active contraction and passive stretching of the muscle.";
      if (!pp.relievingFactors) pp.relievingFactors = "Rest, gentle heat, and supported positions.";
      if (!pp.swellingBruising) pp.swellingBruising = "No visible swelling or bruising.";
      if (!pp.romChanges) pp.romChanges = "Mild limitation in active ranges due to end-range pain.";
      if (!pp.strengthChanges) pp.strengthChanges = "Resisted testing is weak and mildly painful.";
      if (!pp.palpationFindings) pp.palpationFindings = "Local tenderness over the muscle tendon junction.";
      if (!pp.functionalLimitations) pp.functionalLimitations = "Slight limitation during overhead reaching or lifting.";
      if (!pp.movementPattern) pp.movementPattern = "No major gait or posture deviations, slight guarding.";
      if (!pp.neurologicalFindings) pp.neurologicalFindings = "Neurological exam is entirely intact.";

      if (!parsedData.localization) {
        parsedData.localization = {};
      }
      const loc = parsedData.localization;
      if (!loc.correctStructureType) {
        const isTendon = condition.toLowerCase().includes("tendon") || condition.toLowerCase().includes("tendinopathy");
        const isNerve = condition.toLowerCase().includes("nerve") || condition.toLowerCase().includes("entrapment");
        loc.correctStructureType = isTendon ? "Tendon" : isNerve ? "Nerve" : "Muscle";
      }
      if (!loc.correctStructureName) loc.correctStructureName = `${muscle.muscleName} ${loc.correctStructureType}`;
      if (!loc.explanation) loc.explanation = `The clinical onset, mechanism of load, and localized palpation match pathology of the ${loc.correctStructureName}.`;
      if (!loc.studentWhyPrompt) loc.studentWhyPrompt = `Why do the active ROM and resisted testing findings pinpoint the ${loc.correctStructureName} rather than a generic joint issue?`;

      if (!parsedData.differentials || !Array.isArray(parsedData.differentials) || parsedData.differentials.length === 0) {
        parsedData.differentials = [
          {
            name: `${muscle.muscleName} ${condition}`,
            type: "Most likely",
            whyPossible: "The localized clinical presentation matches perfectly.",
            supportingFindings: "Palpation tenderness, painful resisted testing.",
            opposingFindings: "None. This is the primary condition."
          },
          {
            name: "Referred Spinal Pain",
            type: "Less likely",
            whyPossible: "Spinal segment facilitation can refer pain down the dermatome.",
            supportingFindings: "Pain location.",
            opposingFindings: "Spine ROM is painless, no neural tension, and local palpation of the shoulder reproduces the complaint."
          },
          {
            name: "Myofascial Trigger Points",
            type: "Possible",
            whyPossible: "Repetitive activity can generate active tender points in the muscle.",
            supportingFindings: "Pain on palpation, muscle fatigue.",
            opposingFindings: "A trigger point would not explain the joint motion painful arcs or distinct structural weakness."
          }
        ];
      }

      if (!parsedData.testSelection) {
        parsedData.testSelection = { availableTests: [], correctTestIds: [] };
      }
      if (!parsedData.testSelection.availableTests || parsedData.testSelection.availableTests.length === 0) {
        parsedData.testSelection.availableTests = [
          {
            id: "test_1",
            name: "Active Muscle Stretch & Length Test",
            category: "Length",
            isAppropriate: true,
            purpose: "Evaluate muscle lengthening restriction and irritability.",
            appropriatenessReason: "Helps define tissue irritability and mechanical limits.",
            patientPosition: "Relaxed supine or sitting.",
            therapistPosition: "Standing adjacent.",
            startingPosition: "Joint positioned at neutral.",
            stabilization: "Stabilize proximal bone.",
            procedure: "Gently move joint into passive stretch.",
            resistance: "Passive end-feel.",
            expectedNormal: "Painless full range with muscular elastic end-feel.",
            positiveFinding: "Pain at end-range or restriction.",
            interpretation: "Suggestive of structural shortening or acute inflammation.",
            limitation: "Pain can limit testing accuracy.",
            precautions: "Do not force range in highly irritable tissue."
          }
        ];
        parsedData.testSelection.correctTestIds = ["test_1"];
      }

      if (!parsedData.problemList) {
        parsedData.problemList = { allOptions: [], correctSequence: [] };
      }
      if (!parsedData.problemList.allOptions || parsedData.problemList.allOptions.length === 0) {
        parsedData.problemList.allOptions = [
          { id: "prob_1", name: "Localized Pain", description: "Pain localized in muscle/tendon tissue", isActualProblem: true },
          { id: "prob_2", name: "Reduced Active ROM", description: "Decreased active movement range", isActualProblem: true }
        ];
        parsedData.problemList.correctSequence = ["prob_1", "prob_2"];
      }

      if (!parsedData.goals) {
        parsedData.goals = { shortTerm: [], longTerm: [], functional: [] };
      }
      if (!parsedData.goals.shortTerm || parsedData.goals.shortTerm.length === 0) {
        parsedData.goals.shortTerm = ["Reduce local resting pain to ≤2/10 in 2 weeks."];
      }
      if (!parsedData.goals.longTerm || parsedData.goals.longTerm.length === 0) {
        parsedData.goals.longTerm = ["Restore pain-free functional active ROM within 4 weeks."];
      }
      if (!parsedData.goals.functional || parsedData.goals.functional.length === 0) {
        parsedData.goals.functional = ["Perform basic activities of daily living without pain or guarding."];
      }

      if (!parsedData.treatment) {
        parsedData.treatment = { availableInterventions: [], correctInterventionIds: [] };
      }
      if (!parsedData.treatment.availableInterventions || parsedData.treatment.availableInterventions.length === 0) {
        parsedData.treatment.availableInterventions = [
          {
            id: "int_1",
            name: "Sub-maximal Pain-free Isometrics",
            category: "Exercise",
            isAppropriate: true,
            appropriatenessReason: "Engages motor units and promotes tendon/muscle realignment without harmful joint shear.",
            procedure: "Hold isometric contraction at mid-range for 10 seconds, 5 reps.",
            expectedOutcome: "Anabolic protein synthesis and pain relief via cortical inhibition.",
            progressionCriteria: "Able to hold full load for 10 seconds without pain."
          }
        ];
        parsedData.treatment.correctInterventionIds = ["int_1"];
      }

      if (!parsedData.contraindications) {
        parsedData.contraindications = { options: [], correctContraindicatedIds: [] };
      }
      if (!parsedData.contraindications.options || parsedData.contraindications.options.length === 0) {
        parsedData.contraindications.options = [
          { id: "cont_1", name: "Heavy Eccentric Loading", description: "High force stretching during loading", isContraindicated: true, reason: "Too aggressive for current acute/subacute stage of healing." }
        ];
        parsedData.contraindications.correctContraindicatedIds = ["cont_1"];
      }

      if (!parsedData.reassessment) {
        parsedData.reassessment = {};
      }
      const re = parsedData.reassessment;
      if (!re.originalFindingsRecall) re.originalFindingsRecall = "Initial local pain, weak and painful testing.";
      if (!re.followUpScenario) re.followUpScenario = "Patient returns after 4 weeks of diligent home exercises, reporting 70% reduction in local soreness.";
      if (!re.timeframe) re.timeframe = "4 weeks post-assessment";
      if (!re.reassessmentFindings) re.reassessmentFindings = "Pain is now 1/10. Muscle strength is restored to Grade 4+. Active range is fully restored.";
      if (!re.correctAction) re.correctAction = "Progress";
      if (!re.correctActionReason) re.correctActionReason = "Patient has met tissue-healing milestones, allowing progression to advanced strength training.";

      if (!parsedData.qualityControl) {
        parsedData.qualityControl = {};
      }
      const qc = parsedData.qualityControl;
      if (!qc.sourceReference) qc.sourceReference = "Dutton's Orthopaedic Physical Therapy";
      if (!qc.evidenceStatus) qc.evidenceStatus = "Level I Evidence / Peer Reviewed";
      if (!qc.reviewer) qc.reviewer = "Prof. Clinical Committee, Senior Reviewer";
    } catch (repairError) {
      console.warn("Defensive repair step failed, returning parsedData as-is:", repairError);
    }

    serverCache.set(sKey, parsedData);

    return NextResponse.json(parsedData);
  } catch (err: any) {
    console.error("Clinical Lab Generation Route Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
