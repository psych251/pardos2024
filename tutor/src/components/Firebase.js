/*
 * OATutor's logger, adapted for the Psych 251 template.
 *
 * Upstream OATutor wrote each event to its own Firestore collections (problemSubmissions,
 * problemStartLogs, siteLogs, ...). Here every event is passed to the template's DataSaver
 * instead (see src/study/saver.js), so data land under experiments/<id>/participants/<doc>/
 * trials and are exported by the template's `npm run export` like any jsPsych study.
 * Method signatures are unchanged, so the rest of OATutor calls this exactly as before.
 *
 * Event -> `task` value in trials.csv:
 *   answerStep        -> "answer"          (a submitted answer to a problem step)
 *   unlockHint        -> "hint_unlock"     (a hint, scaffold, or bottom-out answer opened)
 *   hintScaffoldLog   -> "scaffold_answer" (an answer typed into a scaffold hint)
 *   startedProblem    -> "problem_start"
 *   submitFocusChange -> "focus"           (tab gained or lost focus)
 *   submitFeedback    -> "feedback"
 *   submitSiteLog     -> "site_log"
 */
import { DO_LOG_DATA } from '../config/config.js'
import { logEvent } from "../study/saver";

const TASK_FOR_EVENT = {
    answerStep: "answer",
    unlockHint: "hint_unlock",
    hintScaffoldLog: "scaffold_answer",
};

class Firebase {

    constructor(oats_user_id, credentials, treatment, siteVersion, ltiContext) {
        this.oats_user_id = oats_user_id;
        this.treatment = treatment;
        this.siteVersion = siteVersion;
    }

    _emit(task, data) {
        if (!DO_LOG_DATA) return Promise.resolve();
        logEvent(task, {
            oats_user_id: this.oats_user_id,
            site_version: this.siteVersion,
            ...data,
        });
        return Promise.resolve();
    }

    log(inputVal, problemID, step, hint, isCorrect, hintsFinished, eventType, variabilization, lesson, courseName) {
        if (Array.isArray(hintsFinished) && Array.isArray(hintsFinished[0])) {
            hintsFinished = hintsFinished.map(step => step.join(", "))
        }
        return this._emit(TASK_FOR_EVENT[eventType] || eventType, {
            eventType,
            problemID,
            stepID: step?.id ?? null,
            hintID: hint?.id ?? null,
            hintTitle: hint?.title ?? null,
            hintType: hint?.type ?? null,
            input: inputVal == null ? null : inputVal.toString(),
            correctAnswer: step?.stepAnswer?.toString() ?? null,
            isCorrect: isCorrect ?? null,
            hintsFinished,
            lesson,
            Content: courseName,
            knowledgeComponents: step?.knowledgeComponents ?? null,
        });
    }

    hintLog(hintInput, problemID, step, hint, isCorrect, hintsFinished, variabilization, lesson, courseName) {
        return this._emit("scaffold_answer", {
            eventType: "hintScaffoldLog",
            problemID,
            stepID: step?.id ?? null,
            hintID: hint?.id ?? null,
            hintInput: hintInput == null ? null : hintInput.toString(),
            hintAnswer: hint?.hintAnswer?.toString() ?? null,
            hintIsCorrect: isCorrect ?? null,
            hintsFinished,
            lesson,
            Content: courseName,
            knowledgeComponents: step?.knowledgeComponents ?? null,
        });
    }

    mouseLog(payload) {
        // Mouse logging is off (DO_LOG_MOUSE_DATA = false), as in the original study.
    }

    startedProblem(problemID, courseName, lesson, lessonObjectives) {
        return this._emit("problem_start", {
            problemID,
            Content: courseName,
            lesson,
        });
    }

    submitSiteLog(logType, logMessage, relevantInformation, problemID = "n/a") {
        return this._emit("site_log", {
            logType,
            logMessage,
            relevantInformation,
            problemID,
        });
    }

    submitFocusChange(_focusStatus) {
        return this._emit("focus", { focusStatus: _focusStatus });
    }

    submitFeedback(problemID, feedback, problemFinished, variables, courseName, steps, lesson) {
        return this._emit("feedback", {
            problemID,
            problemFinished,
            feedback,
            lesson,
            Content: courseName,
        });
    }
}

export default Firebase;
