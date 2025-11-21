import { useDesign } from '../context/DesignContext';
import { useTree } from '../context/TreeContext';
import './TreeNode.css';

export default function TreeNode({ node, onClick, onMouseDown, isHovered }) {
    const { nodeStyle } = useDesign();
    const { searchQuery } = useTree();

    const isMatch = searchQuery &&
        (node.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            node.lastName.toLowerCase().includes(searchQuery.toLowerCase()));

    const getShape = () => {
        switch (nodeStyle) {
            case 'leaf':
                return <path d="M-75,0 Q-37.5,-50 0,-40 Q37.5,-50 75,0 Q37.5,50 0,40 Q-37.5,50 -75,0 Z" className="node-bg" />;
            case 'stone':
                return <rect x="-75" y="-40" width="150" height="80" rx="20" ry="30" className="node-bg" />;
            case 'card':
            default:
                return <rect x="-75" y="-40" width="150" height="80" rx="5" className="node-bg" />;
        }
    };

    return (
        <g
            transform={`translate(${node.x}, ${node.y})`}
            onClick={() => onClick(node)}
            onMouseDown={onMouseDown}
            className={`tree-node ${isHovered ? 'is-hovered' : ''} ${isMatch ? 'is-match' : ''} style-${nodeStyle}`}
        >
            {/* Node Background */}
            {getShape()}

            {/* Name */}
            <text x="0" y="-10" textAnchor="middle" className="node-name">
                {node.firstName} {node.lastName}
            </text>

            {/* Dates */}
            <text x="0" y="15" textAnchor="middle" className="node-date">
                {node.birthDate ? new Date(node.birthDate).getFullYear() : '?'}
                {node.deathDate ? ` - ${new Date(node.deathDate).getFullYear()}` : ''}
            </text>

            {/* Gender Indicator */}
            <circle cx="60" cy="-30" r="5" className={`gender-dot ${node.gender}`} />
        </g>
    );
}
