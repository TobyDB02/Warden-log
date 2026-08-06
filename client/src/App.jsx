import {
    useEffect,
    useState
} from 'react';

import './App.css';
import './styles/elements.css';
import './styles/layout.css';
import './styles/home.css';

import {
    checkDatabaseHealth,
    checkServerHealth,
    getEntryByStaffNumber
} from './api/entriesAPI';

import Dashboard from './components/Dashboard';
import EntryForm from './components/EntryForm';

function App() {
    const [view, setView] = useState('connecting');
    const [refreshKey, setRefreshKey] = useState(0);
    const [connectionSeconds, setConnectionSeconds] = useState(0);
    const [connectionStatus, setConnectionStatus] = useState(
        'Checking application server...'
    );
    const [staffNumber, setStaffNumber] = useState('');
    const [confirmedStaffNumber, setConfirmedStaffNumber] = useState('');
    const [activeStaffNumber, setActiveStaffNumber] = useState('');
    const [existingEntry, setExistingEntry] = useState(null);
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        let retryTimeout;

        const secondsInterval = window.setInterval(() => {
            setConnectionSeconds((currentSeconds) =>
                currentSeconds + 1
            );
        }, 1000);

        async function connect() {
            try {
                setConnectionStatus(
                    'Checking application server...'
                );

                await checkServerHealth();

                if (cancelled) return;

                setConnectionStatus(
                    'Waiting for database...'
                );

                await checkDatabaseHealth();

                if (!cancelled) {
                    window.clearInterval(secondsInterval);
                    setView('login');
                }
            } catch {
                if (!cancelled) {
                    retryTimeout = window.setTimeout(
                        connect,
                        2000
                    );
                }
            }
        }

        connect();

        return () => {
            cancelled = true;
            window.clearInterval(secondsInterval);
            window.clearTimeout(retryTimeout);
        };
    }, []);

    function refreshDashboard() {
        setRefreshKey((currentKey) =>
            currentKey + 1
        );
    }

    function logOut() {
        setStaffNumber('');
        setConfirmedStaffNumber('');
        setActiveStaffNumber('');
        setExistingEntry(null);
        setLoginError('');
        setLoginLoading(false);
        setView('login');
    }

    async function handleLogin(event) {
        event.preventDefault();

        const firstStaffNumber =
            staffNumber.trim();

        const secondStaffNumber =
            confirmedStaffNumber.trim();

        setLoginError('');

        if (!firstStaffNumber && !secondStaffNumber) {
            setView('health-and-safety');
            return;
        }

        if (
            !firstStaffNumber ||
            !secondStaffNumber ||
            firstStaffNumber !== secondStaffNumber
        ) {
            setLoginError(
                'Please make sure your details match'
            );
            return;
        }

        setLoginLoading(true);

        try {
            const entry =
                await getEntryByStaffNumber(
                    firstStaffNumber
                );

            setActiveStaffNumber(firstStaffNumber);
            setExistingEntry(entry);

            setStaffNumber('');
            setConfirmedStaffNumber('');

            setView('warden');
        } catch (error) {
            setLoginError(error.message);
        } finally {
            setLoginLoading(false);
        }
    }

    function renderConnectingView() {
        return (
            <section
                className="connection-screen"
                aria-live="polite"
            >
                <h1>Connecting...</h1>

                <p>{connectionStatus}</p>

                <p>
                    ({connectionSeconds}
                    {connectionSeconds === 1
                        ? ' second'
                        : ' seconds'})
                </p>
            </section>
        );
    }

    function renderLoginView() {
        return (
            <section
                className="login-screen"
                aria-labelledby="login-heading"
            >
                <h1 id="login-heading">
                    Fire Warden Location Management
                </h1>

                <p className="home-introduction">
                    Enter and confirm your staff number to continue.
                    Leave both fields blank to open the Health &amp;
                    Safety dashboard.
                </p>

                <form
                    className="login-form"
                    onSubmit={handleLogin}
                >
                    <div className="field-group">
                        <label htmlFor="staffNumber">
                            Staff Number:
                        </label>

                        <input
                            id="staffNumber"
                            type="text"
                            value={staffNumber}
                            onChange={(event) =>
                                setStaffNumber(
                                    event.target.value
                                )
                            }
                            disabled={loginLoading}
                            autoComplete="off"
                        />
                    </div>

                    <div className="field-group">
                        <label htmlFor="confirmedStaffNumber">
                            Confirm Staff Number:
                        </label>

                        <input
                            id="confirmedStaffNumber"
                            type="text"
                            value={confirmedStaffNumber}
                            onChange={(event) =>
                                setConfirmedStaffNumber(
                                    event.target.value
                                )
                            }
                            disabled={loginLoading}
                            autoComplete="off"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loginLoading}
                    >
                        {loginLoading
                            ? 'Checking...'
                            : 'Continue'}
                    </button>
                </form>

                {loginError && (
                    <p
                        role="alert"
                        className="status-message error"
                    >
                        {loginError}
                    </p>
                )}
            </section>
        );
    }

    function renderWardenView() {
        return (
            <>
                <div className="page-navigation">
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={logOut}
                    >
                        Log out
                    </button>
                </div>

                <section aria-labelledby="warden-heading">
                    <h1 id="warden-heading">
                        Fire Warden Check-in
                    </h1>

                    <p className="active-staff-number">
                        Staff Number: {activeStaffNumber}
                    </p>

                    <EntryForm
                        staffNumber={activeStaffNumber}
                        initialEntry={existingEntry}
                        onEntriesChanged={refreshDashboard}
                    />
                </section>
            </>
        );
    }

    function renderDashboardView() {
        return (
            <>
                <div className="page-navigation">
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={logOut}
                    >
                        Log out
                    </button>
                </div>

                <section aria-labelledby="dashboard-heading">
                    <h1 id="dashboard-heading">
                        Health &amp; Safety Dashboard
                    </h1>

                    <Dashboard
                        refreshKey={refreshKey}
                    />
                </section>
            </>
        );
    }

    function renderCurrentView() {
        if (view === 'connecting') {
            return renderConnectingView();
        }

        if (view === 'warden') {
            return renderWardenView();
        }

        if (view === 'health-and-safety') {
            return renderDashboardView();
        }

        return renderLoginView();
    }

    return (
        <div className="App">
            <header className="site-header">
                <div className="site-header__inner">
                    <img
                        className="uow-logo"
                        src="/images/UoW_Logo_Landscape.png"
                        alt="University of Winchester"
                    />
                </div>
            </header>

            <main className="page-container">
                {renderCurrentView()}
            </main>
        </div>
    );
}

export default App;