import { useMemo, useState, useRef } from 'react';
import { useTree } from '../context/TreeContext';
import { calculateLayout } from '../utils/layout';
import TreeNode from './TreeNode';
import TreeConnection from './TreeConnection';
import RelationDialog from './RelationDialog';
import './TreeRenderer.css';

export default function TreeRenderer() {
    const { persons, relations, addRelation, deletePerson } = useTree();
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [draggingNode, setDraggingNode] = useState(null);
    const [dragPos, setDragPos] = useState(null);
    const [hoveredNode, setHoveredNode] = useState(null);
    const [showRelationDialog, setShowRelationDialog] = useState(false);
    const [selectedRelation, setSelectedRelation] = useState(null);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

    const svgRef = useRef(null);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    const layout = useMemo(() => calculateLayout(persons, relations), [persons, relations]);

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

    const handleNodeMouseDown = (e, node) => {
        e.stopPropagation();
        setDraggingNode(node);
        setDragPos({ x: node.x, y: node.y });
        setShowContextMenu(false);
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
            const rect = svgRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left - transform.x) / transform.scale;
            const y = (e.clientY - rect.top - transform.y) / transform.scale;
            setDragPos({ x, y });

            const target = layout.nodes.find(n =>
                n.id !== draggingNode.id &&
                Math.abs(n.x - x) < 80 &&
                Math.abs(n.y - y) < 50
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
    };

    const handleMouseDown = (e) => {
        if (e.target.closest('.tree-node')) return;
        setShowContextMenu(false);
        setIsPanning(true);
        setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    };

    const handleWheel = (e) => {
        e.preventDefault();
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
            >
                <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
                    {layout.connections.map((conn, i) => (
                        <TreeConnection key={i} connection={conn} />
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
                    <button onClick={handleDelete} style={{ display: 'block', width: '100%', padding: '8px 16px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}>
                        Löschen
                    </button>
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
