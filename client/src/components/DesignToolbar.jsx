import { useDesign } from '../context/DesignContext';
import './DesignToolbar.css';

export default function DesignToolbar() {
    const { theme, setTheme, nodeStyle, setNodeStyle, lineStyle, setLineStyle } = useDesign();

    return (
        <div className="design-toolbar">
            <div className="toolbar-group">
                <label>Thema</label>
                <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                    <option value="vintage">Vintage (Papier)</option>
                    <option value="modern">Modern (Dunkel)</option>
                    <option value="blueprint">Blaupause</option>
                </select>
            </div>

            <div className="toolbar-group">
                <label>Knoten-Stil</label>
                <select value={nodeStyle} onChange={(e) => setNodeStyle(e.target.value)}>
                    <option value="card">Karte</option>
                    <option value="leaf">Blatt</option>
                    <option value="stone">Stein</option>
                </select>
            </div>

            <div className="toolbar-group">
                <label>Linien</label>
                <select value={lineStyle} onChange={(e) => setLineStyle(e.target.value)}>
                    <option value="curved">Geschwungen</option>
                    <option value="straight">Gerade</option>
                    <option value="orthogonal">Eckig</option>
                </select>
            </div>
        </div>
    );
}
