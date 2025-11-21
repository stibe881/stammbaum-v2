import { useState, useEffect } from 'react'
import { TreeProvider, useTree } from './context/TreeContext';
import { DesignProvider } from './context/DesignContext';
import PersonForm from './components/PersonForm';
import TreeRenderer from './components/TreeRenderer';
import DesignToolbar from './components/DesignToolbar';
import ExportMenu from './components/ExportMenu';
import SearchPanel from './components/SearchPanel';
import './themes.css';
import './App.css'

function TreeApp() {
  const { persons, loading, error } = useTree();
  const [showForm, setShowForm] = useState(false);

  if (loading) return <div>Lade Stammbaum...</div>;
  if (error) return <div>Fehler: {error}</div>;

  return (
    <div className="app-container">
      <DesignToolbar />
      <ExportMenu />
      <SearchPanel />
      <header className="app-header">
        <h1>Stammbaum Creator</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Person hinzufügen
          </button>
        </div>
      </header>

      <main className="main-content">
        {persons.length === 0 ? (
          <div className="empty-state">
            <p>Noch keine Personen im Stammbaum.</p>
            <p>Beginnen Sie, indem Sie eine Person hinzufügen.</p>
          </div>
        ) : (
          <TreeRenderer />
        )}
      </main>

      {showForm && <PersonForm onClose={() => setShowForm(false)} />}
    </div>
  );
}

function App() {
  return (
    <DesignProvider>
      <TreeProvider>
        <TreeApp />
      </TreeProvider>
    </DesignProvider>
  )
}

export default App
