
import { useState } from 'react';
import EntryForm from "./components/EntryForm";
import Dashboard from "./components/Dashboard";
import './App.css';

export default function App() {
    const [view, setView] = useState('form');

    return (
        <div className="App">
            <header className="App-header">
                <h1>University of Winchester</h1>
                <h2>Fire Warden Log</h2>
                <nav>
                    <button className={view === 'form' ? 'active' : ''}
                            onClick={() => setView('form')}>
                        Check In
                    </button>
                    <button className={view === 'dashboard' ? 'active' : ''}
                            onClick={() => setView('dashboard')}>
                        H&S Dashboard
                    </button>
                </nav>
            </header>

            <main>
                {view === 'form' ? <EntryForm /> : <Dashboard />}
            </main>
        </div>
    );
}