# WerkKeur

WerkKeur is een Nederlandse B2B SaaS-oplossing voor documentbeheer van onderaannemers.

**Kernbelofte:** _Iedere onderaannemer. Altijd op orde._

Met WerkKeur beheren bedrijven alle vereiste documenten (zoals VCA, KvK en AVB) centraal, ontvangen onderaannemers veilige uploadlinks zonder account, en ziet het team direct of leveranciers compliant zijn.

---

## Tech stack

- **Next.js** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS**
- **shadcn/ui**
- **Lucide icons**
- **PostgreSQL**
- **Prisma ORM**
- **Auth.js / NextAuth**
- **React Hook Form + Zod**
- **date-fns**
- **Vitest** (business logic tests)

---

## Hoofdfunctionaliteit (MVP)

- Multi-tenant architectuur (organisatie-isolatie)
- Rollen: `OWNER`, `ADMIN`, `EMPLOYEE`
- Registratie + inloggen + uitloggen + wachtwoord-reset architectuur
- Onboarding flow
- Dashboard met live KPI’s en statusberekeningen
- Onderaannemer CRUD + detailpagina
- Documenttypes per organisatie
- Secure document uploads (PDF/JPG/JPEG/PNG, max 10 MB)
- Private bestandsopslag (geen publieke document-URL’s)
- Documentstatus-engine (`MISSING`, `EXPIRING`, `EXPIRED`, etc.)
- Documentverzoeken met veilige publieke uploadtokens (`/aanleveren/[token]`)
- Verzoeken-overzicht + herinneringen + intrekken
- Meldingen en activity logging
- Teambeheer basis + uitnodigingsarchitectuur
- Marketing site + prijzen + privacy/voorwaarden/beveiliging
- SEO basis (metadata, sitemap, robots)

---

## Vereisten

- Node.js 20+
- npm 10+
- PostgreSQL 14+

---

## Installatie

```bash
npm install
```

Kopieer environment-variabelen:

```bash
cp .env.example .env
```

Pas daarna `.env` aan.

---

## Environment variables

Zie `.env.example`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/werkkeur?schema=public"
AUTH_SECRET="vervang-dit-met-een-lange-geheime-sleutel-minimaal-32-tekens"
APP_URL="http://localhost:3000"
STORAGE_DIR="./.storage"
EMAIL_PROVIDER="console"
EMAIL_FROM="noreply@werkkeur.nl"
# RESEND_API_KEY=""
```

---

## Database setup

1. Maak een PostgreSQL database aan, bijvoorbeeld `werkkeur`.
2. Zet `DATABASE_URL` correct in `.env`.
3. Draai migraties:

```bash
npm run prisma:migrate
```

4. (Optioneel, development) Seed demo data:

```bash
npm run prisma:seed
```

Demo inlog na seeden:

- **E-mail:** `owner@werkkeur-demo.nl`
- **Wachtwoord:** `WerkKeurDemo123!`

---

## Ontwikkelcommando’s

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
```

Prisma:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

---

## Productie build

```bash
npm run build
npm run start
```

---

## E-mailarchitectuur

WerkKeur gebruikt een e-mailabstractielaag:

- `EMAIL_PROVIDER=console` voor lokale ontwikkeling (logt mails)
- voorbereid op providerkoppeling (zoals Resend) via `RESEND_API_KEY`

Templates aanwezig voor:

- documentverzoek
- herinnering vervaldatum

---

## Opslagarchitectuur

- Bestanden worden server-side gevalideerd op MIME-type en grootte.
- Bestanden worden opgeslagen met veilige unieke storage keys.
- Opslag gebeurt buiten publieke statische folders.
- Download verloopt via geautoriseerde API-routes.
- Architectuur is voorbereid op S3-compatibele object storage.

---

## Security overwegingen

- Tenant isolatie op organisatie-id
- Server-side autorisatiechecks op API-routes
- Role-based access control
- Auth.js sessies + secret via env
- Uploadtoken hashing + vervaltijd + revoke support
- Basis rate-limiting architectuur op gevoelige endpoints
- Geen logging van documentinhoud of wachtwoorden
- Inputvalidatie met Zod

> Let op: juridische claims/certificeringen alleen communiceren na formele audit.

---

## Tests

Kritieke business logica getest met Vitest:

- documentstatus berekeningen
- subcontractor compliance status
- permissies
- tokenvalidatie (expired/revoked)
- tenant access checks

Run:

```bash
npm run test
```
