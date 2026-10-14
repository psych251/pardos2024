/**
 * Reads Prolific URL parameters as soon as the app loads (before App.js strips query
 * parameters from the address bar), persists them, and assigns a condition.
 *
 * Supported URL parameters:
 *   PROLIFIC_PID, STUDY_ID, SESSION_ID  - appended automatically by Prolific
 *   arm=gpt|human|none                  - optional override (e.g., pilots, topping up one arm)
 *   reset=1                             - clear saved study progress in this browser
 *   emulator=1                          - save to the local Firestore emulator (tests); no redirect
 *
 * A visit without PROLIFIC_PID is a "preview" (a TA or classmate trying the live link):
 * it runs normally and its events are flagged is_preview = true.
 *
 * Data model: the template's DataSaver writes one participant document per page load. A
 * participant who reloads mid-study therefore has two documents. `session_key` (random,
 * stored in this browser, not derived from any identifier) is written on every event and on
 * each participant document so the report can join them back into one person.
 */
import { ARM_KEYS } from "./studyConfig";

const STORAGE_KEY = "pardos-replication-study-context";
const PHASE_KEY_PREFIX = "pardos-replication-phase-";

function readAllParams() {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash || "";
    const q = hash.indexOf("?");
    if (q !== -1) {
        new URLSearchParams(hash.substr(q + 1)).forEach((v, k) => {
            if (!params.has(k)) params.set(k, v);
        });
    }
    return params;
}

// FNV-1a 32-bit hash: deterministic, so a participant who reloads keeps their arm.
function hashString(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}

export function assignArm(pid) {
    return ARM_KEYS[hashString(pid) % ARM_KEYS.length];
}

function randomKey() {
    const c = window.crypto;
    if (c && typeof c.randomUUID === "function") return c.randomUUID().replace(/-/g, "").slice(0, 16);
    return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}

function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
}

function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
}

function safeRemove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
}

const urlParams = readAllParams();
export const USE_EMULATOR = urlParams.get("emulator") === "1";

function build() {
    let saved = null;
    try { saved = JSON.parse(safeGet(STORAGE_KEY) || "null"); } catch (e) { saved = null; }

    if (urlParams.get("reset") === "1" && saved) {
        safeRemove(PHASE_KEY_PREFIX + saved.session_key);
        safeRemove(STORAGE_KEY);
        saved = null;
    }

    const urlPid = urlParams.get("PROLIFIC_PID");
    const armOverride = ARM_KEYS.includes(urlParams.get("arm")) ? urlParams.get("arm") : null;

    let ctx;
    if (urlPid) {
        // A new Prolific ID in the URL always starts a new session in this browser.
        const sameAsSaved = saved && saved.prolific_pid === urlPid;
        ctx = sameAsSaved ? saved : {
            prolific_pid: urlPid,
            session_key: randomKey(),
            study_arm: armOverride || assignArm(urlPid),
            arm_source: armOverride ? "url_override" : "hash_of_prolific_id",
            is_preview: false,
        };
    } else if (saved) {
        // Reload: App.js has already removed the URL parameters, so resume this browser's session.
        ctx = saved;
    } else {
        const key = randomKey();
        ctx = {
            prolific_pid: null,
            session_key: key,
            study_arm: armOverride || assignArm(key),
            arm_source: armOverride ? "url_override" : "random_preview",
            is_preview: true,
        };
    }

    freshSession = !saved || saved.session_key !== ctx.session_key;
    safeSet(STORAGE_KEY, JSON.stringify(ctx));
    return ctx;
}

let freshSession = false;
const studyContext = build();

export const isFreshSession = () => freshSession;

export default studyContext;

/**
 * Fields added to every logged event. Deliberately contains no Prolific identifiers:
 * those are stored once, on the participant document, and the template's export moves
 * them to the gitignored identifiers.csv.
 */
export function getStudyMeta() {
    return {
        condition: studyContext.study_arm,
        arm_source: studyContext.arm_source,
        is_preview: studyContext.is_preview,
        session_key: studyContext.session_key,
        study_phase: getSavedPhase(),
    };
}

export function getSavedPhase() {
    return safeGet(PHASE_KEY_PREFIX + studyContext.session_key) || "consent";
}

export function savePhase(phase) {
    safeSet(PHASE_KEY_PREFIX + studyContext.session_key, phase);
}
