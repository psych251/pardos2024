/**
 * Bridge between OATutor and the Psych 251 template's DataSaver (../src/save.js, copied to
 * public/template/ at build time). All data go through DataSaver, exactly as in the
 * template's jsPsych experiment: anonymous sign-in, experiments/<id>/participants/<doc>,
 * append-only trial chunks, client error logging, and the JSON download fallback.
 *
 * Each OATutor event (an answer, a hint opened, a problem shown, a phase starting, ...)
 * becomes one "trial" row with a `task` column, so the template's export produces a normal
 * long-format trials.csv.
 */
import studyContext, { getStudyMeta, USE_EMULATOR } from "./studyContext";
import { EXPERIMENT } from "./studyConfig";

let saver = null;
let trialIndex = 0;
const t0 = (window.performance && performance.now()) || Date.now();

export async function initSaver() {
    if (!window.DataSaver) {
        throw new Error("template/save.js did not load; run the build so public/template/ exists");
    }
    saver = await window.DataSaver.init({
        experiment_id: EXPERIMENT.id,
        chunk_size: EXPERIMENT.chunk_size,
        save_full_data_at_end: EXPERIMENT.save_full_data_at_end,
        use_emulator: USE_EMULATOR,
        contact_email: EXPERIMENT.contact_email,
    });
    window.__saver = saver; // for debugging and the automated test
    saver.updateParticipant({
        condition: studyContext.study_arm,
        arm_source: studyContext.arm_source,
        is_preview: studyContext.is_preview,
        session_key: studyContext.session_key,
        entry_phase: getStudyMeta().study_phase,
        requires_keyboard: EXPERIMENT.requires_keyboard,
        platform: "oatutor",
    });
    return saver;
}

export function getSaver() {
    return saver;
}

/** Log one event as a trial row. `task` names the event type. */
export function logEvent(task, fields = {}) {
    if (!saver) return;
    const now = (window.performance && performance.now()) || Date.now();
    saver.onTrial({
        trial_index: trialIndex++,
        time_elapsed: Math.round(now - t0),
        client_time: new Date().toISOString(),
        task,
        ...getStudyMeta(),
        ...fields,
    });
}

export function updateParticipant(fields) {
    if (saver) saver.updateParticipant(fields);
}
