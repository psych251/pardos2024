# The experiment: OATutor, Statistics replication of Pardos & Bhandari (2024)

This folder is the experiment participants take. It is the authors' own study platform
([CAHLR/OATutor-GPT-Study](https://github.com/CAHLR/OATutor-GPT-Study), with its content at
OATutor-Content commit `ac7b12b`), restricted to the Statistics lesson, and connected to the
Psych 251 template so that data are saved and exported exactly like the template's jsPsych demo.

**Flow:** device check → course consent → 3 background questions → 3-item pre-test → 5 practice
problems with the condition's help → the same 3-item post-test → debrief → Prolific redirect.

**Conditions** (assigned by hashing the Prolific id, so a reload keeps the same one):
`gpt` (ChatGPT 3.5 worked-solution hints from the original study), `human` (OATutor's human-tutor
hints and scaffolds), `none` (only the answer). All three get correctness feedback in practice and
none on the tests, as in the original.

## Where things are

| | |
| --- | --- |
| `src/study/studyConfig.js` | **Settings**: `EXPERIMENT.id`, Prolific completion code, contact email, debrief text, phase instructions, condition-to-lesson mapping. |
| `src/study/StudyFlow.js` | The participant flow (consent, phases, debrief, finish, redirect). |
| `src/study/saver.js` | Bridge to the template's `DataSaver` (`../src/save.js`). Every OATutor event becomes one row in `trials.csv` with a `task` column. |
| `src/components/Firebase.js` | OATutor's logger, rerouted to the bridge. Lists the `task` values. |
| `src/content-sources/oatutor/` | Problems, answers and hints, from the original study. |

## Changes from the original content

- Pre/post item 3 differed by condition in the published content (ChatGPT condition:
  P(A) = 0.5, P(B) = 0.5, P(A and B) = 0.20; others: 0.4, 0.2, 0.08). All conditions now use the
  0.4 / 0.2 / 0.08 version.
- Practice item 3's stem said "A AND B = learning Spanish and German" for lunch/dinner events;
  corrected to "eating Lunch and Dinner".
- The background questions have a "Prefer not to say" option, required by the course consent text.
- The page header shows a neutral "Part 1 of 3" instead of lesson codes that differed by condition.

## Commands (run inside `tutor/`)

```bash
npm ci          # once
npm start       # http://localhost:3001 ; add ?emulator=1 to save to the local emulator
npm run build   # production build in build/; GitHub Actions does this on every push to main
```

Useful URL parameters: `?PROLIFIC_PID=PILOT_NAME` (pilot as a named participant),
`&arm=gpt|human|none` (force a condition), `&reset=1` (start over in this browser). A visit
without `PROLIFIC_PID` runs as a preview and is flagged `is_preview`.

## Data

Saved by the template's `DataSaver` under `experiments/<EXPERIMENT.id>/participants/...` and
exported with `npm run export -- --experiment <id> --key <key>` from the repository root, as in
the student guide. A reload creates a second participant document (template behaviour); both
carry the same `session_key`, and the report joins them.

---

*Original repository README follows.*

# OATutor

OATutor is an Open-source Adaptive Tutoring System (OAT) based on Intelligent Tutoring System principles. It uses Bayesian Knowledge Tracing for skill mastery estimation and is implemented entirely in React JS with optional logging using [Firebase](https://firebase.google.com/). 
The system can be deployed to git-pages without the use of any backend. For LMS integration, 
a middleware backend is required by Learning Tools Interoperability (LTI). Our [hosted backend server](https://cahlr.github.io/OATutor/#/posts/set-up-canvas-integration) can be used or the middleware can be launched independently. OATutor is Section 508 accessibility [compliant](https://cahlr.github.io/OATutor/static/documents/OATutor_Sec508_WCAG.pdf).

> Jump to our main repository: [CAHLR/OATutor](https://github.com/CAHLR/OATutor)

> [Quick clone and deploy notebook example](https://colab.research.google.com/drive/1jdbTEd7SWoC-rrV1RPPed9MeBoFWewRP?usp=sharing)

## Content 

This GPT Study repository contains the version of OATutor and its problems that were included in our recent experiment focusing on the learning gain differences between ChatGPT and human-tutor generated hints. The content was curated from [OpenStax](https://openstax.org/) with hints and scaffolds authored by the OATutor Project.

> Jump to our website: [OATutor.io](OATutor.io)
>
The questions contained in this repo (in our experiment) come from:
* [Elementary Algebra - Lesson 2.1](https://openstax.org/books/elementary-algebra-2e/pages/2-1-solve-equations-using-the-subtraction-and-addition-properties-of-equality)
* [Intermediate Algebra - Lesson 2.1](https://openstax.org/books/intermediate-algebra-2e/pages/2-1-use-a-general-strategy-to-solve-linear-equations)
* [College Algebra - Lesson 2.2](https://openstax.org/books/college-algebra-2e/pages/2-2-linear-equations-in-one-variable)
* [Statistics - Lesson 3.2](https://openstax.org/books/statistics/pages/3-2-independent-and-mutually-exclusive-events)

## License/Attribution

All content in this repository is made available under the [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) license. Attribution is given within each json file, indicating the authoring organization and license for each hint, scaffold, and problem.





