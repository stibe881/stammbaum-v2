import { jsPDF } from "jspdf";

export const downloadSVG = (svgElement, fileName = 'stammbaum.svg') => {
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);

    // Add name spaces.
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+xmlns:xlink="http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    // Add xml declaration
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
};

export const downloadPNG = (svgElement, fileName = 'stammbaum.png') => {
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);

    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);

    img.onload = () => {
        const canvas = document.createElement('canvas');
        // Use the viewBox or getBBox if possible, otherwise clientWidth/Height
        // For better resolution, we can scale up
        const bbox = svgElement.getBBox();
        const scale = 2; // 2x resolution

        // We need to handle the transform/viewbox. 
        // Simplest is to use the current view size, but ideally we want the whole tree.
        // The SVG passed here should ideally be a clone with a viewbox covering all nodes.
        // But for now, let's just capture what's technically in the SVG element's coordinate system.

        // Actually, getting the full tree is tricky because of the pan/zoom transform on the <g>.
        // We should probably export the inner <g> content but wrapped in a new <svg> with proper bounds.

        canvas.width = (bbox.width + 100) * scale; // Add some padding
        canvas.height = (bbox.height + 100) * scale;

        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);

        // Fill white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // We need to draw the image. However, the image src is the whole SVG.
        // If the SVG has a viewBox, it will map to the canvas.
        // We might need to adjust the SVG string to have the correct viewBox matching the bbox.

        ctx.drawImage(img, 0, 0);

        const pngUrl = canvas.toDataURL('image/png');

        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };
};

export const downloadPDF = (svgElement, fileName = 'stammbaum.pdf') => {
    // Similar to PNG, but put into PDF
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);

    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);

    img.onload = () => {
        const canvas = document.createElement('canvas');
        const bbox = svgElement.getBBox();
        const scale = 2;

        canvas.width = (bbox.width + 100) * scale;
        canvas.height = (bbox.height + 100) * scale;

        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const pngData = canvas.toDataURL('image/png');

        // Calculate PDF size (A4 landscape or custom)
        // For simplicity, let's make a PDF that fits the image
        const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'l' : 'p',
            unit: 'px',
            format: [canvas.width, canvas.height] // Custom size matching image
        });

        pdf.addImage(pngData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(fileName);
    };
};
