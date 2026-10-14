/**
 * Study configuration for the single-subject (Statistics) replication of
 * Pardos & Bhandari (2024), PLOS ONE 19(5): e0304013.
 *
 * Before data collection: set EXPERIMENT.id and EXPERIMENT.prolific_completion_code below,
 * and review the debrief text in DEBRIEF_PARAGRAPHS.
 */

// Lesson IDs come from src/content-sources/oatutor/coursePlans.json.
// Course names in the original content: "ChatGPT Experiment" = ChatGPT hints,
// "ChatGPT Control" = human tutor-authored hints, "ChatGPT Control 2" = no hints.
export const ARMS = {
    gpt: {
        label: "ChatGPT hints",
        pretest: "4KNMMWgx-ZCyL-0hX8PjeAgP",
        practice: "0EXr8DRB-JBSB-Q0EOI1nrZL",
        posttest: "6sNF1PSa-mrl8-uWQWfNYP5U",
    },
    human: {
        label: "Human tutor hints",
        pretest: "0HTUDhTs-vvBv-9Q1EmKDlXw",
        practice: "38OqeJnN-CHec-nP0nvjNe2w",
        posttest: "72rkjSYa-lOMn-laf7BoHSF5",
    },
    none: {
        label: "No hints (control)",
        pretest: "5cQ3Mg8k-iZdQ-D2a6JKCUsw",
        practice: "4AIFfh8f-Nzj0-PQ2k6vDL62",
        posttest: "35oNx0M9-rfif-YF17bGXkEF",
    },
};

export const ARM_KEYS = ["gpt", "human", "none"];

// Intro questions used in the original Statistics condition
// (age group, prior statistics course, prior college math).
export const INTRO_LESSON_ID = "0N3RlHdO-hA99-qvOE90wuYx";

// Phase order. Each lesson phase is one OATutor lesson.
export const PHASES = ["consent", "intro", "pretest", "practice", "posttest", "debrief", "complete"];

// ---------------------------------------------------------------------------
// Psych 251 template settings (same meaning as the EXPERIMENT block in ../experiment.js)
// ---------------------------------------------------------------------------
export const EXPERIMENT = {
    // Firestore path: experiments/<id>/participants/... Change it between phases so pilot
    // and real data never mix (pardos2024-pilot-a -> pardos2024-pilot-b -> pardos2024-stats),
    // and keep `experiment_id` at the top of writeup/replication-report.qmd the same.
    id: "pardos2024-pilot-a",

    // Events per Firestore write. A full session logs about 60 events.
    chunk_size: 5,

    // Also store every event on the participant document at the end (export fallback).
    save_full_data_at_end: true,

    // From your Prolific study page. Empty = no redirect (pilots, local testing).
    prolific_completion_code: "",

    // Contact shown in consent, debrief and the download fallback. The course consent
    // text may only be changed in this address.
    contact_email: "stanfordpsych251@gmail.com",

    // Answers are typed, so phones and tablets are turned away before consent.
    requires_keyboard: true,
};

export const PROLIFIC_COMPLETION_URL =
    `https://app.prolific.com/submissions/complete?cc=${EXPERIMENT.prolific_completion_code}`;

// Instructions shown before each phase. Wording is identical across arms.
export const PHASE_INSTRUCTIONS = {
    intro: {
        title: "Background questions",
        body: "First, please answer three short background questions.",
    },
    pretest: {
        title: "Part 1 of 3: Problems",
        body: "Answer each problem as best you can. You will not be told whether your " +
            "answers are correct. Please do not use AI tools (such as ChatGPT), search " +
            "engines, or other people's help. A calculator is fine.",
    },
    practice: {
        title: "Part 2 of 3: Practice",
        body: "Now you will practice similar problems. In this part you can check your " +
            "answers and try again, and you can open help with the raised-hand button next " +
            "to each problem. Please keep working without outside AI tools or search engines.",
    },
    posttest: {
        title: "Part 3 of 3: Problems",
        body: "Finally, answer a few more problems as best you can. You will not be told " +
            "whether your answers are correct. Please do not use AI tools, search engines, " +
            "or other people's help.",
    },
};

// Course-wide consent text (Psych 251). Only the contact address may change.
export const consentText = (email) =>
    "By answering the following questions, you are participating in a study being performed by " +
    "cognitive scientists in the Stanford Department of Psychology. If you have questions about " +
    `this research, please contact us at ${email}. You must be at least 18 years old ` +
    "to participate. Your participation in this research is voluntary. You may decline to answer " +
    "any or all of the following questions. You may decline further participation, at any time, " +
    "without adverse consequences. Your anonymity is assured; the researchers who have requested " +
    "your participation will not receive any personal information about you.";

// TODO (student): review and edit this wording; it is participant-facing study material.
export const DEBRIEF_PARAGRAPHS = [
    "Thank you for taking part. This study is a class replication of research on how different " +
    "kinds of help affect learning in online math practice. Participants were randomly assigned " +
    "to practice with help written by a human tutor, help generated by ChatGPT, or no help " +
    "beyond the answer, and we compare how much scores improved from the first set of problems " +
    "to the last.",
    "The study is not a test of you, and your scores do not affect your payment.",
];
