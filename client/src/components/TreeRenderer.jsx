import { useMemo, useState, useRef } from 'react';
import { useTree } from '../context/TreeContext';
import { calculateLayout } from '../utils/layout';
import TreeNode from './TreeNode';
import TreeConnection from './TreeConnection';
import RelationDialog from './RelationDialog';
import './TreeRenderer.css';

export default function TreeRenderer() {
    const { persons, relations, addRelation } = useTree();
    const [view, setView] = useState({ x: window.innerWidth / 2, y: 100, zoom: 1 });

    // Dragging state
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    const [draggingNode, setDraggingNode] = useState(null);
    const [dragPos, setDragPos] = useState(null); // Current mouse pos in tree coords
    const [hoveredNode, setHoveredNode] = useState(null);

    const [relationDialog, setRelationDialog] = useState(null); // { source, target }

    // Recalculate layout when data changes
    const { nodes, links } = useMemo(() => {
        return calculateLayout(persons, relations);
    }, [persons, relations]);

    // Convert screen to tree coordinates
    const toTreeCoords = (clientX, clientY) => {
        return {
            x: (clientX - view.x) / view.zoom,
            y: (clientY - view.y) / view.zoom
        };
    };

    const handleMouseDown = (e) => {
        // Only pan if not clicking a node (handled in node)
        if (e.target.closest('.tree-node')) return;

        setIsPanning(true);
        setPanStart({ x: e.clientX - view.x, y: e.clientY - view.y });
    };

    const handleNodeMouseDown = (e, node) => {
        e.stopPropagation();
        setDraggingNode(node);
        const coords = toTreeCoords(e.clientX, e.clientY);
        setDragPos(coords);
    };

    const handleMouseMove = (e) => {
        if (isPanning) {
            setView(prev => ({
                ...prev,
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y
            }));
        } else if (draggingNode) {
            const coords = toTreeCoords(e.clientX, e.clientY);
            setDragPos(coords);

            // Check for hover
            // Simple distance check or elementFromPoint could work, but elementFromPoint is easier
            // We need to temporarily hide the dragged element or ignore it, but since we are drawing a line, 
            // we can just check proximity to other nodes in 'nodes' array
            const threshold = 100; // Distance to snap
            const target = nodes.find(n =>
                n.id !== draggingNode.id &&
                Math.abs(n.x - coords.x) < 80 &&
                Math.abs(n.y - coords.y) < 50
            );
            setHoveredNode(target || null);
        }
    };

    const handleMouseUp = () => {
        if (draggingNode && hoveredNode) {
            // Open dialog
            setRelationDialog({ source: draggingNode, target: hoveredNode });
        }

        setIsPanning(false);
        setDraggingNode(null);
        setDragPos(null);
        setHoveredNode(null);
    };

    const handleWheel = (e) => {
        e.preventDefault();
        const scale = e.deltaY > 0 ? 0.9 : 1.1;
        setView(prev => ({ ...prev, zoom: prev.zoom * scale }));
    };

    const handleRelationConfirm = async (type, subType) => {
        if (!relationDialog) return;
        try {
            await addRelation({
                person1Id: relationDialog.source.id,
                person2Id: relationDialog.target.id,
                type,
                subType
            });
        } catch (err) {
            alert(err.message);
        }
        setRelationDialog(null);
    };

    return (
        <div className="tree-container">
            <svg
                className="tree-canvas"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            >
                <g transform={`translate(${view.x}, ${view.y}) scale(${view.zoom})`}>
                    {links.map(link => (
                        <TreeConnection key={link.id} link={link} nodes={nodes} />
                    ))}

                    {/* Drag Line */}
                    {draggingNode && dragPos && (
                        <line
                            x1={draggingNode.x} y1={draggingNode.y}
                            x2={dragPos.x} y2={dragPos.y}
                            stroke="#e67e22" strokeWidth="2" strokeDasharray="5,5"
                        />
                    )}

                    {nodes.map(node => (
                        <TreeNode
                            key={node.id}
                            node={node}
                            onClick={(n) => console.log('Clicked', n)}
                            onMouseDown={(e) => handleNodeMouseDown(e, node)}
                            isHovered={hoveredNode?.id === node.id}
                        />
                    ))}
                </g>
            </svg>

            <div className="zoom-controls">
                <button onClick={() => setView(v => ({ ...v, zoom: v.zoom * 1.2 }))}>+</button>
                <button onClick={() => setView(v => ({ ...v, zoom: v.zoom / 1.2 }))}>-</button>
                <button onClick={() => setView(v => ({ ...v, x: window.innerWidth / 2, y: 100, zoom: 1 }))}>Reset</button>
            </div>

            {relationDialog && (
                <RelationDialog
                    sourcePerson={relationDialog.source}
                    targetPerson={relationDialog.target}
                    onClose={() => setRelationDialog(null)}
                    onConfirm={handleRelationConfirm}
                />
            )}
        </div>
    );
}
