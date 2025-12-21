import './App.css';
import { useState } from 'react';
import { Main } from './components/Main.tsx';
import { DebugModeContext } from './context/DebugModeContext.ts';

const App = () => {
    const [debug_mode, set_debug_mode] = useState(false);

    return (
        <DebugModeContext value={debug_mode}>
            <Main />
            <a className="build-number" href={BUILD_LINK} target={'_blank'}>
                Build #{BUILD_NUM}
            </a>
            {import.meta.env.DEV && (
                <button
                    className="build-number"
                    style={{ right: 0, left: 'unset' }}
                    type={'button'}
                    onClick={() => set_debug_mode((x) => !x)}
                >
                    Debug Mode {debug_mode ? '✅' : '❌'}
                </button>
            )}
        </DebugModeContext>
    );
};

export default App;
