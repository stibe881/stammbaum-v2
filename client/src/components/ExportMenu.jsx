import { api } from '../services/api';
import { downloadSVG, downloadPNG, downloadPDF } from '../utils/exporter';
import './ExportMenu.css';

export default function ExportMenu() {
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
        // Find the group containing the tree content
        const svgGroup = document.querySelector('.tree-canvas g');
        if (!svgGroup) {
            alert('Kein Stammbaum gefunden.');
            return null;
        }

        // We need to wrap it in an SVG to make it valid standalone
        // We also need to reset the transform to 0,0 for the export
        // and set the viewBox to the bounding box of the content

        const bbox = svgGroup.getBBox();
        const clone = svgGroup.cloneNode(true);

        // Reset transform on the clone
        clone.setAttribute('transform', `translate(${-bbox.x + 50}, ${-bbox.y + 50})`);

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('width', bbox.width + 100);
        svg.setAttribute('height', bbox.height + 100);
        svg.setAttribute('viewBox', `0 0 ${bbox.width + 100} ${bbox.height + 100}`);
        svg.setAttribute('xmlns', "http://www.w3.org/2000/svg");

        // Copy styles if needed (e.g. CSS variables might be missing if not inline)
        // For now, we rely on the fact that we might need to inline some styles or 
        // the exporter handles it. 
        // NOTE: CSS classes won't work well in img.src unless styles are embedded.
        // We might need to append the style block.

        const style = document.createElement('style');
        style.textContent = `
      .node-bg { fill: #fff; stroke: #8d6e63; stroke-width: 2px; }
      .node-name { font-family: sans-serif; font-size: 14px; font-weight: 600; fill: #2c3e50; }
      .node-date { font-size: 12px; fill: #7f8c8d; }
      .gender-dot.male { fill: #3498db; }
      .gender-dot.female { fill: #e91e63; }
      .gender-dot.other { fill: #9b59b6; }
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
    };

    return (
        <div className="export-menu">
            <div className="menu-group">
                <label>Export</label>
                <button onClick={() => handleExport('png')} className="btn-small">PNG</button>
                <button onClick={() => handleExport('pdf')} className="btn-small">PDF</button>
                <button onClick={() => handleExport('svg')} className="btn-small">SVG</button>
                <button onClick={api.exportGedcom} className="btn-small">GEDCOM</button>
            </div>
            <div className="menu-divider"></div>
            <div className="menu-group">
                <label>Import</label>
                <div className="file-input-wrapper">
                    <button className="btn-small">GEDCOM Import</button>
                    <input type="file" accept=".ged" onChange={handleImport} />
                </div>
            </div>
        </div>
    );
}
