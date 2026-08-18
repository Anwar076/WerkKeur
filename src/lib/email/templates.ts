type DocumentRequestTemplateArgs = {
  organizationName: string;
  contactName: string;
  documents: string[];
  uploadUrl: string;
};

type ExpirationReminderTemplateArgs = {
  contactName: string;
  documentType: string;
  expirationDate: string;
  uploadUrl: string;
};

export function documentRequestTemplate({
  organizationName,
  contactName,
  documents,
  uploadUrl,
}: DocumentRequestTemplateArgs) {
  return {
    subject: `Documenten gevraagd door ${organizationName}`,
    html: `
      <p>Hallo ${contactName},</p>
      <p>${organizationName} gebruikt WerkKeur om documenten van onderaannemers veilig en overzichtelijk te beheren.</p>
      <p>We vragen je om de volgende documenten aan te leveren:</p>
      <ul>${documents.map((document) => `<li>${document}</li>`).join("")}</ul>
      <p><a href="${uploadUrl}" style="background:#0f2747;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">Documenten aanleveren</a></p>
      <p>Je hebt geen account nodig.</p>
    `,
  };
}

export function expirationReminderTemplate({
  contactName,
  documentType,
  expirationDate,
  uploadUrl,
}: ExpirationReminderTemplateArgs) {
  return {
    subject: `Je ${documentType} verloopt binnenkort`,
    html: `
      <p>Hallo ${contactName},</p>
      <p>Je document <strong>${documentType}</strong> verloopt op <strong>${expirationDate}</strong>.</p>
      <p>Lever tijdig een nieuwe versie aan via onderstaande knop.</p>
      <p><a href="${uploadUrl}" style="background:#0f2747;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">Document bijwerken</a></p>
    `,
  };
}
