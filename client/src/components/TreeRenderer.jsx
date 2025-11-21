import { useMemo, useState, useRef, useEffect } from 'react';
import { useTree } from '../context/TreeContext';
import { calculateLayout } from '../utils/layout';
import TreeNode from './TreeNode';
import TreeConnection from './TreeConnection';
import RelationDialog from './RelationDialog';
import { api } from '../services/api';
import './TreeRenderer.css';

export default function TreeRenderer() {
    const { persons, relations, addRelation, deletePerson } = useTree();
    const [transform, setTransform] = useState({ x: window.innerWidth / 2, y: 100, scale: 1 });
    const [draggingNode, setDraggingNode] = useState(null);
    const [dragPos, setDragPos] = useState(null);
    const [hoveredNode, setHoveredNode] = useState(null);
    const [showRelationDialog, setShowRelationDialog] = useState(false);
    const [selectedRelation, setSelectedRelation] = useState(null);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
    const [selectedLinkToDelete, setSelectedLinkToDelete] = useState(null);

    const svgRef = useRef(null);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const isDraggingRef = useRef(false); // Track if node drag is in progress

    const layout = useMemo(() => calculateLayout(persons, relations), [persons, relations]);

    // Zentriere Baum beim ersten Laden
    useEffect(() => {
        if (svgRef.current && persons.length > 0) {
            const rect = svgRef.current.getBoundingClientRect();
            setTransform(prev => ({
                ...prev,
                x: rect.width / 2,
                y: 100
            }));
        }
    }, [persons.length]);

    const handleNodeClick = (node, event) => {
        if (draggingNode) return;

        const rect = svgRef.current.getBoundingClientRect();
        setContextMenuPos({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        });
        setSelectedPerson(node);
        setShowContextMenu(true);
    };

    const handleDelete = async () => {
        if (!confirm(`${selectedPerson.firstName} ${selectedPerson.lastName} wirklich löschen?`)) {
            setShowContextMenu(false);
            return;
        }

        try {
            await deletePerson(selectedPerson.id);
            setShowContextMenu(false);
        } catch (err) {
            alert('Fehler beim Löschen: ' + err.message);
        }
    };

    const handleLineClick = (link, event) => {
        event.stopPropagation();
        const rect = svgRef.current.getBoundingClientRect();
        setContextMenuPos({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        });
        setSelectedLinkToDelete(link);
        setSelectedPerson(null);
        setShowContextMenu(true);
    };

    const handleDeleteRelation = async () => {
        if (!confirm('Beziehung wirklich löschen?')) {
            setShowContextMenu(false);
            return;
        }

        try {
            await api.deleteRelation(selectedLinkToDelete.id);
            window.location.reload();
        } catch (err) {
            alert('Fehler beim Löschen: ' + err.message);
        }
    };

    const handleNodeMouseDown = (e, node) => {
        e.stopPropagation();
        isDraggingRef.current = true; // Mark that node drag started
        setDraggingNode(node);
        setDragPos({ x: node.x, y: node.y });
        setShowContextMenu(false);
    };

    const toTreeCoords = (clientX, clientY) => {
        const rect = svgRef.current.getBoundingClientRect();
        return {
            x: (clientX - rect.left - transform.x) / transform.scale,
            y: (clientY - rect.top - transform.y) / transform.scale
        };
    };

    const handleMouseMove = (e) => {
        if (!svgRef.current) return;

        if (isPanning) {
            setTransform(prev => ({
                ...prev,
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y
            }));
        } else if (draggingNode) {
            const coords = toTreeCoords(e.clientX, e.clientY);
            setDragPos(coords);

            const target = layout.nodes.find(n =>
                n.id !== draggingNode.id &&
                Math.abs(n.x - coords.x) < 80 &&
                Math.abs(n.y - coords.y) < 50
            );
            setHoveredNode(target || null);
        }
    };

    const handleMouseUp = () => {
        if (draggingNode && hoveredNode) {
            setSelectedRelation({ source: draggingNode, target: hoveredNode });
            setShowRelationDialog(true);
        }

        setIsPanning(false);
        setDraggingNode(null);
        setDragPos(null);
        setHoveredNode(null);
        isDraggingRef.current = false; // Reset drag flag
    };

    const handleMouseDown = (e) => {
        // Don't start panning if node drag just started
        if (isDraggingRef.current) return;

        setShowContextMenu(false);
        setIsPanning(true);
        setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    };

    const handleWheel = (e) => {
        const scale = e.deltaY > 0 ? 0.9 : 1.1;
        setTransform(prev => ({ ...prev, scale: prev.scale * scale }));
    };

    const handleRelationConfirm = async (type, subType) => {
        if (!selectedRelation) return;
        try {
            await addRelation({
                person1Id: selectedRelation.source.id,
                person2Id: selectedRelation.target.id,
                type,
                subType
            });
            setShowRelationDialog(false);
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="tree-container">
            <svg
                ref={svgRef}
                className="tree-canvas"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                style={{ touchAction: 'none' }}
            >
                <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
                    {layout.links.map((link, i) => (
                        <TreeConnection
                            key={i}
                            link={link}
                            nodes={layout.nodes}
                            onClick={(e) => handleLineClick(link, e)}
                        />
                    ))}

                    {draggingNode && dragPos && (
                        <line
                            x1={draggingNode.x} y1={draggingNode.y}
                            x2={dragPos.x} y2={dragPos.y}
                            stroke="#e67e22" strokeWidth="2" strokeDasharray="5,5"
                        />
                    )}

                    {layout.nodes.map(node => (
                        <TreeNode
                            key={node.id}
                            node={node}
                            onClick={(n, e) => handleNodeClick(n, e)}
                            onMouseDown={(e) => handleNodeMouseDown(e, node)}
                            isHovered={hoveredNode?.id === node.id}
                        />
                    ))}
                </g>
            </svg>

            <div className="zoom-controls">
                <button onClick={() => setTransform(v => ({ ...v, scale: v.scale * 1.2 }))}>+</button>
                <button onClick={() => setTransform(v => ({ ...v, scale: v.scale / 1.2 }))}>-</button>
                <button onClick={() => setTransform({ x: window.innerWidth / 2, y: 100, scale: 1 })}>Reset</button>
            </div>

            {showContextMenu && (
                <div
                    className="context-menu"
                    style={{
                        position: 'absolute',
                        left: contextMenuPos.x,
                        top: contextMenuPos.y,
                        background: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '5px 0',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        zIndex: 1000
                    }}
                >
                    {selectedPerson && (
                        <button onClick={handleDelete} style={{ display: 'block', width: '100%', padding: '8px 16px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}>
                            Person löschen
                        </button>
                    )}
                    {selectedLinkToDelete && (
                        <button onClick={handleDeleteRelation} style={{ display: 'block', width: '100%', padding: '8px 16px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}>
                            Beziehung löschen
                        </button>
                    )}
                </div>
            )}

            {showRelationDialog && (
                <RelationDialog
                    sourcePerson={selectedRelation.source}
                    targetPerson={selectedRelation.target}
                    onClose={() => setShowRelationDialog(false)}
                    onConfirm={handleRelationConfirm}
                />
            )}
        </div>
    );
}
