import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppBar, Button, Paper, Toolbar, Typography } from "@material-ui/core";
import Platform from "../platform-logic/Platform.js";
import { LESSON_PROGRESS_STORAGE_KEY, PROGRESS_STORAGE_KEY, ThemeContext } from "../config/config.js";
import studyContext, { getSavedPhase, isFreshSession, savePhase, USE_EMULATOR } from "./studyContext";
import { getSaver, logEvent, updateParticipant } from "./saver";
import {
    ARMS,
    consentText,
    DEBRIEF_PARAGRAPHS,
    EXPERIMENT,
    INTRO_LESSON_ID,
    PHASE_INSTRUCTIONS,
    PHASES,
    PROLIFIC_COMPLETION_URL,
} from "./studyConfig";

const LESSON_PHASES = ["intro", "pretest", "practice", "posttest"];

const HEADER_TITLES = {
    intro: "Background questions",
    pretest: "Part 1 of 3",
    practice: "Part 2 of 3",
    posttest: "Part 3 of 3",
};

function lessonForPhase(phase, arm) {
    if (phase === "intro") return INTRO_LESSON_ID;
    return ARMS[arm][phase];
}

function allStudyLessonIds() {
    const ids = [INTRO_LESSON_ID];
    Object.values(ARMS).forEach(a => ids.push(a.pretest, a.practice, a.posttest));
    return ids;
}

// Same test as the template: true on anything with a mouse, trackpad or stylus.
function hasFinePointer() {
    return !!(window.matchMedia && window.matchMedia("(any-pointer: fine)").matches);
}

const pageStyle = { backgroundColor: "#F6F6F6", minHeight: "100vh" };
const cardStyle = { maxWidth: 720, margin: "32px auto", padding: "28px 32px" };

function SimpleHeader() {
    return (
        <AppBar position="static">
            <Toolbar><Typography variant="h6">Probability problems study</Typography></Toolbar>
        </AppBar>
    );
}

function Card({ children }) {
    return <div style={pageStyle}><SimpleHeader/><Paper style={cardStyle}>{children}</Paper></div>;
}

export default function StudyFlow(props) {
    const context = useContext(ThemeContext);
    const deviceSupported = !EXPERIMENT.requires_keyboard || hasFinePointer();
    const [ready, setReady] = useState(false);
    const [phase, setPhase] = useState(getSavedPhase() || "consent");
    const [showInstructions, setShowInstructions] = useState(true);
    const [declined, setDeclined] = useState(false);
    const [finishResult, setFinishResult] = useState(null);
    const advancing = useRef(false);
    const finishing = useRef(false);

    // Start of session: record the device verdict, and on a participant's first visit in this
    // browser clear any OATutor progress left from piloting so the item pool starts full.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            updateParticipant({ device_supported: deviceSupported });
            if (!deviceSupported) {
                logEvent("device_unsupported", {});
                if (!cancelled) setReady(true);
                return;
            }
            if (isFreshSession()) {
                const { removeByKey } = context.browserStorage;
                const keys = [PROGRESS_STORAGE_KEY, ...allStudyLessonIds().map(LESSON_PROGRESS_STORAGE_KEY)];
                await Promise.allSettled(keys.map(k => removeByKey(k)));
                logEvent("session_start", {});
            } else {
                logEvent("session_resume", {});
            }
            if (!cancelled) setReady(true);
        })();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const goToPhase = useCallback((next) => {
        savePhase(next);
        setPhase(next);
        setShowInstructions(true);
        advancing.current = false;
        window.scrollTo(0, 0);
    }, []);

    const onLessonComplete = useCallback((lessonId) => {
        if (advancing.current) return;
        if (lessonId !== lessonForPhase(phase, studyContext.study_arm)) return;
        advancing.current = true;
        logEvent("phase_complete", { phase, lessonId });
        goToPhase(PHASES[PHASES.indexOf(phase) + 1]);
    }, [phase, goToPhase]);

    // Flush everything and mark the participant complete (template's saver.finish). Then, for
    // a live Prolific run that saved successfully, return the participant to Prolific.
    const finish = useCallback(async (consented) => {
        if (finishing.current) return;
        finishing.current = true;
        const saver = getSaver();
        const result = saver ? await saver.finish(null) : { ok: false };
        setFinishResult(result);
        if (consented && result.ok && EXPERIMENT.prolific_completion_code && !USE_EMULATOR
            && !studyContext.is_preview) {
            window.location.href = PROLIFIC_COMPLETION_URL;
        }
    }, []);

    if (!ready) {
        return <div style={pageStyle}><SimpleHeader/><center><h3>Loading…</h3></center></div>;
    }

    if (!deviceSupported) {
        return (
            <Card>
                <div id="device-unsupported">
                    <Typography variant="h5" gutterBottom>Please use a computer</Typography>
                    <Typography paragraph>
                        This study needs a computer with a physical keyboard, because answers are typed.
                        Phones and tablets cannot be used.
                    </Typography>
                    <Typography paragraph>
                        Please reopen this link on a laptop or desktop computer. If you were sent here from
                        Prolific, you can return the study and take it later on a computer; nothing has been
                        recorded against you.
                    </Typography>
                    <Typography>
                        Questions: <a href={`mailto:${EXPERIMENT.contact_email}`}>{EXPERIMENT.contact_email}</a>
                    </Typography>
                </div>
            </Card>
        );
    }

    const arm = studyContext.study_arm;

    if (phase === "consent") {
        if (declined) {
            return (
                <Card>
                    <Typography variant="h5" gutterBottom>Thank you</Typography>
                    <Typography>
                        You chose not to participate. You may close this window
                        {EXPERIMENT.prolific_completion_code ? " and return the study on Prolific" : ""}.
                    </Typography>
                </Card>
            );
        }
        return (
            <Card>
                <div className="consent">
                    <Typography variant="h5" gutterBottom>Consent</Typography>
                    <Typography paragraph>{consentText(EXPERIMENT.contact_email)}</Typography>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                    <Button variant="contained" color="primary" data-study="consent-agree"
                            onClick={() => {
                                logEvent("consent", { consented: true });
                                goToPhase("intro");
                            }}>
                        I agree to participate
                    </Button>
                    <Button variant="outlined" data-study="consent-decline"
                            onClick={() => {
                                logEvent("consent", { consented: false });
                                savePhase("declined");
                                setDeclined(true);
                                finish(false);
                            }}>
                        I do not agree
                    </Button>
                </div>
            </Card>
        );
    }

    if (phase === "declined") {
        return (
            <Card>
                <Typography variant="h5" gutterBottom>Thank you</Typography>
                <Typography>You chose not to participate. You may close this window.</Typography>
            </Card>
        );
    }

    if (phase === "debrief") {
        return (
            <Card>
                <Typography variant="h5" gutterBottom>Debrief</Typography>
                {DEBRIEF_PARAGRAPHS.map((p, i) => <Typography key={i} paragraph>{p}</Typography>)}
                <Typography paragraph>
                    If you have questions about this research, contact{" "}
                    <a href={`mailto:${EXPERIMENT.contact_email}`}>{EXPERIMENT.contact_email}</a>.
                    Press the button to save your responses and finish.
                </Typography>
                <Button variant="contained" color="primary" data-study="debrief-finish"
                        onClick={() => {
                            logEvent("debrief", {});
                            goToPhase("complete");
                        }}>
                    Finish
                </Button>
            </Card>
        );
    }

    if (phase === "complete") {
        return <CompleteScreen finish={finish} result={finishResult}/>;
    }

    if (LESSON_PHASES.includes(phase) && showInstructions) {
        const ins = PHASE_INSTRUCTIONS[phase];
        return (
            <Card>
                <Typography variant="h5" gutterBottom>{ins.title}</Typography>
                <Typography paragraph>{ins.body}</Typography>
                <Button variant="contained" color="primary" data-study="phase-continue"
                        onClick={() => {
                            logEvent("phase_start", { phase, lessonId: lessonForPhase(phase, arm) });
                            setShowInstructions(false);
                        }}>
                    Continue
                </Button>
            </Card>
        );
    }

    return (
        <Platform key={phase}
                  lessonID={lessonForPhase(phase, arm)}
                  headerTitle={HEADER_TITLES[phase]}
                  onLessonComplete={onLessonComplete}
                  saveProgress={props.saveProgress}
                  loadBktProgress={props.loadBktProgress}
                  removeProgress={props.removeProgress}/>
    );
}

function CompleteScreen({ finish, result }) {
    useEffect(() => {
        finish(true);
    }, [finish]);

    const code = EXPERIMENT.prolific_completion_code;
    const redirecting = result && result.ok && code && !USE_EMULATOR && !studyContext.is_preview;
    return (
        <Card>
            <div id="finish-message">
                {!result && <Typography className="thanks">Saving your responses…</Typography>}
                {redirecting && <Typography className="thanks">Saved. Returning you to Prolific…</Typography>}
                {result && !redirecting && (
                    <>
                        <Typography variant="h5" gutterBottom className="thanks">All done</Typography>
                        {result.ok && (
                            <Typography paragraph className="thanks">
                                Your responses were saved. Thank you for participating!
                            </Typography>
                        )}
                        {code && (
                            <Typography paragraph className="thanks">
                                Your completion code is <strong>{code}</strong>.
                            </Typography>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
}
