export const defaultDocumentTypes = [
  {
    name: "KvK-uittreksel",
    description: "Actueel uittreksel van de Kamer van Koophandel",
    requiresExpirationDate: false,
    defaultValidityMonths: undefined,
    reminderDays: 30,
  },
  {
    name: "VCA",
    description: "Veiligheid, gezondheid en milieu checklist aannemers",
    requiresExpirationDate: true,
    defaultValidityMonths: 36,
    reminderDays: 30,
  },
  {
    name: "AVB-verzekering",
    description: "Aansprakelijkheidsverzekering voor bedrijven",
    requiresExpirationDate: true,
    defaultValidityMonths: 12,
    reminderDays: 30,
  },
  {
    name: "Identiteitsbewijs",
    description: "Geldig identiteitsbewijs van contactpersoon",
    requiresExpirationDate: true,
    defaultValidityMonths: 120,
    reminderDays: 30,
  },
  {
    name: "G-rekeningverklaring",
    description: "Bewijs van G-rekening voor loonheffingen",
    requiresExpirationDate: false,
    defaultValidityMonths: undefined,
    reminderDays: 30,
  },
  {
    name: "BTW-verklaring",
    description: "BTW-gegevens van onderaannemer",
    requiresExpirationDate: false,
    defaultValidityMonths: undefined,
    reminderDays: 30,
  },
] as const;
