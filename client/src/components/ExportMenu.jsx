import { useState } from 'react';
import { api } from '../services/api';
import { downloadSVG, downloadPNG, downloadPDF } from '../utils/exporter';
import './ExportMenu.css';

export default function ExportMenu() {
    const [isOpen, setIsOpen] = useState(false);

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const res = await api.importGedcom(file);
            alert(res.message || 'Import erfolgreich!');
            window.location.reload();
        } catch (err) {
            alert('Import fehlgeschlagen: ' + err.message);
        }
    };

    const getSvgContent = () => {
        const svgGroup = document.querySelector('.tree-canvas g');
        if (!svgGroup) {
            alert('Kein Stammbaum gefunden.');
            return null;
        }

        const bbox = svgGroup.getBBox();
        const clone = svgGroup.cloneNode(true);
        clone.setAttribute('transform', `translate(${-bbox.x + 50}, ${-bbox.y + 50})`);

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('width', bbox.width + 100);
        svg.setAttribute('height', bbox.height + 100);
        svg.setAttribute('viewBox', `0 0 ${bbox.width + 100} ${bbox.height + 100}`);
        svg.setAttribute('xmlns', "http://www.w3.org/2000/svg");

        const style = document.createElement('style');
        style.textContent = `
      .node-bg { fill: #fff; stroke: #8d6e63; stroke-width: 2px; }
      .node-name { font-family: sans-serif; font-size: 14px; font-weight: 600; fill: #2c3e50; }
      .node-date { font-size: 12px; fill: #7f8c8d; }
      path, line { stroke: #8d6e63; fill: none; }
    `;
        svg.appendChild(style);
        svg.appendChild(clone);

        return svg;
    };

    const handleExport = (type) => {
        const svg = getSvgContent();
        if (!svg) return;

        if (type === 'svg') downloadSVG(svg);
        if (type === 'png') downloadPNG(svg);
        if (type === 'pdf') downloadPDF(svg);
        setIsOpen(false);
    };

    return (
        <div className="export-dropdown">
            <button onClick={() => setIsOpen(!isOpen)} className="btn-secondary">
                Export/Import
            </button>
            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-section">
                        <span className="dropdown-label">Export als:</span>
                        <button onClick={() => handleExport('png')}>PNG</button>
                        <button onClick={() => handleExport('pdf')}>PDF</button>
                        <button onClick={() => handleExport('svg')}>SVG</button>
                        <button onClick={() => { api.exportGedcom(); setIsOpen(false); }}>GEDCOM</button>
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-section">
                        <span className="dropdown-label">Import:</span>
                        <label className="file-upload-btn">
                            GEDCOM Import
                            <input type="file" accept=".ged" onChange={handleImport} style={{ display: 'none' }} />
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
}
