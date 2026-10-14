import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// Bundle KaTeX's stylesheet (same 0.9.0 version as the library) instead of relying on a CDN.
import 'katex/dist/katex.min.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { initSaver } from './study/saver';

// Connect the template's DataSaver first. It reads the Prolific parameters from the URL,
// and App removes them from the address bar when it starts, so the order matters.
initSaver()
    .catch((e) => console.error("[study] could not start the data saver:", e))
    .finally(() => {
        ReactDOM.render(<App/>, document.getElementById('root'));
    });

serviceWorker.unregister();
