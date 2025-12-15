import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- Types ---
interface ContactData {
    id?: number | string;
    name: string;
    email: string;
    phone?: string;
    stage: string;
    channel: string;
    // Add any other fields you want to display
}

// --- List Export ---
export const generateContactsListPDF = (contacts: any[]) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Lista de Contactos", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 30);

    // Table Columns
    const tableColumn = ["Nombre", "Email", "Etapa", "Canal", "Teléfono"];
    const tableRows: any[] = [];

    contacts.forEach((contact) => {
        const contactData = [
            contact.name,
            contact.email,
            contact.stage,
            contact.channel,
            contact.phone || "-",
        ];
        tableRows.push(contactData);
    });

    // Generate Table
    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: "grid",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [139, 92, 246] }, // Purple-600 to match branding
    });

    doc.save("contactos-crm.pdf");
};

// --- Single Contact Export (Card Style) ---
export const generateContactPDF = (contact: ContactData) => {
    const doc = new jsPDF();

    // Card Header
    doc.setFillColor(139, 92, 246); // Purple background
    doc.rect(0, 0, 210, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text(contact.name, 14, 20);

    doc.setFontSize(12);
    doc.text("Perfil de Contacto", 14, 30);

    // Reset Color
    doc.setTextColor(0, 0, 0);

    // Details Section
    let yPos = 60;
    const lineHeight = 12;
    const leftCol = 20;
    const rightCol = 80;

    // Helper to draw a row
    const drawRow = (label: string, value: string) => {
        doc.setFont("helvetica", "bold");
        doc.text(label, leftCol, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(value || "-", rightCol, yPos);
        yPos += lineHeight;

        // Dotted line separator
        doc.setDrawColor(200, 200, 200);
        // @ts-ignore: setLineDash is missing in some type definitions but exists in library
        doc.setLineDash([1, 1], 0);
        doc.line(leftCol, yPos - 8, 190, yPos - 8);
        // @ts-ignore
        doc.setLineDash([], 0); // Reset
    };

    drawRow("Email:", contact.email);
    drawRow("Teléfono:", contact.phone || "-");
    drawRow("Etapa:", contact.stage);
    drawRow("Canal de origen:", contact.channel);
    drawRow("ID de Contacto:", contact.id ? contact.id.toString() : "-");

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
        `Generado por CRM Startup el ${new Date().toLocaleDateString()}`,
        14,
        280
    );

    const safeName = contact.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    doc.save(`contacto_${safeName}.pdf`);
};
