import { useState } from 'react';

import './App.css';
import './styles/elements.css';
import './styles/layout.css';
import './styles/home.css';

import EntryForm from './components/EntryForm';
import Dashboard from './components/Dashboard';

function App() {
    const [refreshKey, setRefreshKey] = useState(0);

    function refreshDashboard() {
        setRefreshKey((currentKey) => currentKey + 1);
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
                <h1 className="home-heading">
                    Fire Warden Location Management
                </h1>

                <p className="home-introduction">
                    Enter a staff number to add a new record or review and update an existing one.
                </p>

                <div className="content-grid">
                    <section
                        className="content-card"
                        aria-labelledby="entry-form-heading"
                    >
                        <h2 id="entry-form-heading">Add an entry</h2>

                        <EntryForm
                            onEntriesChanged={refreshDashboard}
                        />
                    </section>

                    <section
                        className="content-card"
                        aria-labelledby="dashboard-heading"
                    >
                        <h2 id="dashboard-heading">Current entries</h2>

                        <Dashboard refreshKey={refreshKey} />
                    </section>
                </div>
            </main>
        </div>
    );
}

export default App;