async function mergeDocuments() {
    const doc1Input = document.getElementById('doc1').files[0];
    const doc2Input = document.getElementById('doc2').files[0];

    if (!doc1Input || !doc2Input) {
        alert('Please upload both documents to merge.');
        return;
    }

    const doc = new window.jspdf.jsPDF(); // Create jsPDF instance

    // Read the first PDF
    await appendPdfToDoc(doc, doc1Input);
    // Read the second PDF and append its pages after the first one
    await appendPdfToDoc(doc, doc2Input);

    // Create a Blob URL to display the PDF
    const pdfBlob = doc.output('blob'); // Get the PDF as a Blob
    const pdfUrl = URL.createObjectURL(pdfBlob); // Create a URL for the Blob

    // Display the merged PDF in the iframe
    document.getElementById('pdf-viewer').src = pdfUrl;

    // Show the download button
    document.getElementById('download-btn').style.display = 'block';
}

async function appendPdfToDoc(jsPDFDoc, pdfFile) {
    const pdfData = await pdfFile.arrayBuffer(); // Read PDF file
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise; // Load the PDF with PDF.js

    const totalPages = pdf.numPages; 

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };

        await page.render(renderContext).promise; 

        const imgData = canvas.toDataURL('image/jpeg');
        jsPDFDoc.addImage(imgData, 'JPEG', 0, 0, 210, 297); 

        if (pageNum < totalPages) {
            jsPDFDoc.addPage();
        }
    }
}

function downloadMerged() {
    const iframe = document.getElementById('pdf-viewer');
    const pdfUrl = iframe.src;

    const filename = prompt("Enter a name for the merged file:", "merged_document");

    if (filename) {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${filename}.pdf`;
        link.click();
    } else {
        alert("Please provide a valid filename to save the document.");
    }
}
