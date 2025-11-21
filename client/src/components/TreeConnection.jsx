import { useDesign } from '../context/DesignContext';

export default function TreeConnection({ link, nodes }) {
    const { lineStyle } = useDesign();
    const source = nodes.find(n => n.id === link.person1Id);
    const target = nodes.find(n => n.id === link.person2Id);

    if (!source || !target) return null;

    // Simple straight line for now, or bezier
    // Adjust start/end points to be at edges of rect
    const startX = source.x;
    const startY = source.y + 40; // bottom of source
    const endX = target.x;
    const endY = target.y - 40; // top of target

    // If partner, draw horizontal line
    if (link.type === 'partner') {
        return (
            <line
                x1={source.x + 75} y1={source.y}
                x2={target.x - 75} y2={target.y}
                stroke="var(--line-color)"
                strokeWidth="2"
                strokeDasharray="5,5"
            />
        );
    }

    // Parent-Child: Bezier
    let d = '';
    const midY = (startY + endY) / 2;

    switch (lineStyle) {
        case 'straight':
            d = `M ${startX} ${startY} L ${endX} ${endY}`;
            break;
        case 'orthogonal':
            d = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
            break;
        case 'curved':
        default:
            d = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
            break;
    }

    return (
        <path
            d={d}
            fill="none"
            stroke="var(--line-color)"
            strokeWidth="2"
        />
    );
}
