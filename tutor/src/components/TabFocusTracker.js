import { useEffect } from "react";
import useWindowFocus from "use-window-focus";
import { useLocation } from 'react-router-dom';

export default function TabFocusTracker(props) {
    const { context } = props
    const { firebase } = context
    const windowFocused = useWindowFocus();
    const pathname = useLocation()?.pathname;

    useEffect(() => {
        if (!firebase) return
        ;(async () => {
            // Phase 2: log on every route. The study runs at "/" (or "/study"), so the original
            // "/lessons/" check meant no focus events were ever recorded in Phase 1.
            await firebase.submitFocusChange(windowFocused);
        })()
    }, [windowFocused, firebase, pathname])

    return <></>
}
