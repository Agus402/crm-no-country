export interface ContactData {
    id?: number | string;
    name: string;
    email: string;
    phone?: string | null;
    stage: string;
    channel: string;
    [key: string]: any;
}

export interface MessageExportData {
    conversationId: number | string;
    channel: string;
    leadName: string;
    sentAt: string;
    author: string;
    direction: 'Enviado' | 'Recibido';
    content: string;
}

const escapeCSV = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return "";
    const stringValue = String(value);
    // If value contains quotes, newlines or commas, enclose in quotes and double internal quotes
    if (/[",\n\r]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
};

export const getContactsCSVContent = (contacts: ContactData[]): string => {
    if (!contacts || contacts.length === 0) {
        return "";
    }

    const headers = [
        "ID",
        "Nombre",
        "Email",
        "Teléfono",
        "Etapa",
        "Canal",
        "Creado"
    ];

    const rows = contacts.map(contact => {
        return [
            escapeCSV(contact.id),
            escapeCSV(contact.name),
            escapeCSV(contact.email),
            escapeCSV(contact.phone),
            escapeCSV(contact.stage),
            escapeCSV(contact.channel),
            escapeCSV(contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : "")
        ].join(",");
    });

    return [headers.join(","), ...rows].join("\n");
};

export const getMessagesCSVContent = (messages: MessageExportData[]): string => {
    if (!messages || messages.length === 0) {
        return "";
    }

    const headers = [
        "Conversación ID",
        "Canal",
        "Lead",
        "Fecha Mensaje",
        "Autor",
        "Dirección",
        "Contenido"
    ];

    const rows = messages.map(msg => {
        return [
            escapeCSV(msg.conversationId),
            escapeCSV(msg.channel),
            escapeCSV(msg.leadName),
            escapeCSV(msg.sentAt),
            escapeCSV(msg.author),
            escapeCSV(msg.direction),
            escapeCSV(msg.content)
        ].join(",");
    });

    return [headers.join(","), ...rows].join("\n");
};

const downloadCSV = (content: string, filenamePrefix: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);

    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `${filenamePrefix}_${dateStr}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const generateContactsCSV = (contacts: ContactData[]) => {
    const content = getContactsCSVContent(contacts);
    if (!content) return;
    downloadCSV(content, "contactos_crm");
};

export const generateMessagesCSV = (messages: MessageExportData[]) => {
    const content = getMessagesCSVContent(messages);
    if (!content) return;
    downloadCSV(content, "mensajes_crm");
};

export const generateAllDataCSV = (contacts: ContactData[], messages: MessageExportData[]) => {
    const contactsContent = getContactsCSVContent(contacts);
    const messagesContent = getMessagesCSVContent(messages);

    const combinedContent = `${contactsContent}\n\n${messagesContent}`;

    downloadCSV(combinedContent, "reporte_completo_crm");
};
