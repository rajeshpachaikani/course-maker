import type { CredentialKey } from "@/lib/credentials";

export type CredentialGuide = {
  shortHint: string;
  docUrl?: string;
  dashboardUrl?: string;
  steps: Array<string>;
  warning?: string;
};

export const CREDENTIAL_GUIDES: Partial<Record<CredentialKey, CredentialGuide>> =
  {
    stripe_secret: {
      shortHint: "Stripe Dashboard → Developers → API keys → Secret key.",
      dashboardUrl: "https://dashboard.stripe.com/apikeys",
      docUrl: "https://docs.stripe.com/keys",
      steps: [
        "Sign in to the Stripe Dashboard.",
        "Click Developers in the top nav, then API keys.",
        "Under Standard keys, find Secret key. Toggle Test mode on if you want a sk_test_ key.",
        "Click Reveal test key (or Create restricted key for production).",
        "Copy the value that starts with sk_live_ or sk_test_ and paste it here.",
      ],
      warning:
        "Secret keys grant full API access. Never paste them into frontend code or commit them to git.",
    },
    stripe_webhook_secret: {
      shortHint: "Developers → Webhooks → Endpoint → Signing secret (whsec_…).",
      dashboardUrl: "https://dashboard.stripe.com/webhooks",
      docUrl: "https://docs.stripe.com/webhooks",
      steps: [
        "Open Stripe Dashboard → Developers → Webhooks.",
        "Click Add endpoint. Set the URL to https://YOUR_DOMAIN/api/stripe/webhook.",
        "Select the events you need (at minimum checkout.session.completed).",
        "After creating, click the endpoint → Click Reveal under Signing secret.",
        "Copy the whsec_… value and paste it here.",
      ],
    },
    stripe_publishable: {
      shortHint: "Developers → API keys → Publishable key (pk_…). Safe for browser.",
      dashboardUrl: "https://dashboard.stripe.com/apikeys",
      docUrl: "https://docs.stripe.com/keys",
      steps: [
        "Open Stripe Dashboard → Developers → API keys.",
        "Copy Publishable key (pk_live_ or pk_test_).",
        "Paste it here. This one is safe to expose to the browser.",
      ],
    },
    bunny_api_key: {
      shortHint: "bunny.net → Account Settings → API → Account API key.",
      dashboardUrl: "https://dash.bunny.net/account/api-key",
      docUrl: "https://docs.bunny.net/reference/bunnynet-api-overview",
      steps: [
        "Sign in to dash.bunny.net.",
        "Click your profile in the top right → Account Settings.",
        "Go to the API tab.",
        "Under API Access Key, click Show or Copy.",
        "Paste it here. This is the account-wide key used to manage resources.",
      ],
      warning: "Account API key has full control over your Bunny account. Guard it.",
    },
    bunny_stream_library_id: {
      shortHint: "Stream → your library → Library ID (numeric).",
      dashboardUrl: "https://dash.bunny.net/stream",
      docUrl: "https://docs.bunny.net/reference/video_list",
      steps: [
        "Open dash.bunny.net → Stream in the sidebar.",
        "Click the video library you want to use (or create one).",
        "The Library ID is the number shown in the URL and on the overview page.",
        "Copy that number and paste it here.",
      ],
    },
    bunny_stream_cdn_hostname: {
      shortHint: "Stream library → API tab → CDN hostname (vz-…b-cdn.net).",
      dashboardUrl: "https://dash.bunny.net/stream",
      docUrl: "https://docs.bunny.net/docs/stream-playing-videos",
      steps: [
        "Open your Bunny Stream video library.",
        "Click API in the left menu (inside the library).",
        "Find CDN Hostname. It looks like vz-xxxxxxxx.b-cdn.net.",
        "Copy the hostname only (no https://) and paste it here.",
      ],
    },
    bunny_storage_zone: {
      shortHint: "Storage → pick your zone → zone name (lowercase, no spaces).",
      dashboardUrl: "https://dash.bunny.net/storage",
      docUrl: "https://docs.bunny.net/reference/storage-api",
      steps: [
        "Sign in to dash.bunny.net and open Storage.",
        "Click the storage zone you want to use (or create one).",
        "Copy the zone name exactly as shown in the header.",
        "Paste it here.",
      ],
    },
    bunny_storage_key: {
      shortHint: "Storage zone → FTP & API Access → Password (Primary or Read/Write).",
      dashboardUrl: "https://dash.bunny.net/storage",
      docUrl: "https://docs.bunny.net/reference/storage-api",
      steps: [
        "Open Storage → your zone → FTP & API Access.",
        "Under Password, click the eye icon next to the Read & Write password (or generate one).",
        "Copy the value and paste it here.",
      ],
      warning:
        "This key can upload and delete files in the storage zone. Use a read/write password, never your account API key.",
    },
    smtp_host: {
      shortHint:
        "Oracle Cloud → Email Delivery → SMTP settings → Public Endpoint (Region-specific).",
      dashboardUrl: "https://cloud.oracle.com/email-delivery",
      docUrl:
        "https://docs.oracle.com/en-us/iaas/Content/Email/Tasks/configuresmtpconnection.htm",
      steps: [
        "Open OCI Console → Developer Services → Application Integration → Email Delivery.",
        "In the left menu, click Email Configuration → SMTP Connection Configuration.",
        "Copy the Public Endpoint host shown (e.g. smtp.email.eu-frankfurt-1.oci.oraclecloud.com).",
        "Paste the host only (no port, no scheme) here.",
      ],
    },
    smtp_port: {
      shortHint: "Use 587 for STARTTLS (recommended) or 465 for implicit SSL.",
      docUrl:
        "https://docs.oracle.com/en-us/iaas/Content/Email/Tasks/configuresmtpconnection.htm",
      steps: [
        "Oracle Email Delivery supports 587 (STARTTLS) and 25.",
        "Enter 587 unless your provider requires another port.",
        "If you switch to 465, also set SMTP secure to true.",
      ],
    },
    smtp_user: {
      shortHint:
        "Identity → Users → your user → SMTP Credentials → Generate → copy Username.",
      dashboardUrl: "https://cloud.oracle.com/identity/users",
      docUrl:
        "https://docs.oracle.com/en-us/iaas/Content/Email/Tasks/generatesmtpcredentials.htm",
      steps: [
        "OCI Console → Identity & Security → Users → pick (or create) the user that will send mail.",
        "Resources panel → SMTP Credentials → Generate SMTP Credentials.",
        "Give it a description (e.g. CourseForge prod) → Generate.",
        "Copy the Username shown (looks like ocid1.user.oc1..….@ocid.….com) and paste here.",
      ],
      warning:
        "The username is NOT your console email. It is the generated SMTP username from this panel.",
    },
    smtp_password: {
      shortHint:
        "Same SMTP Credentials panel — copy the Password shown once at creation.",
      dashboardUrl: "https://cloud.oracle.com/identity/users",
      docUrl:
        "https://docs.oracle.com/en-us/iaas/Content/Email/Tasks/generatesmtpcredentials.htm",
      steps: [
        "Right after you click Generate SMTP Credentials, OCI displays the Password once.",
        "Copy it immediately and paste here.",
        "If you lost it, delete that credential and generate a new one.",
      ],
      warning: "Oracle only shows the SMTP password once. Store it here or rotate.",
    },
    smtp_from_email: {
      shortHint:
        "Email Delivery → Approved Senders → add the address, then paste it here.",
      dashboardUrl: "https://cloud.oracle.com/email-delivery/approved-senders",
      docUrl:
        "https://docs.oracle.com/en-us/iaas/Content/Email/Tasks/managingapprovedsenders.htm",
      steps: [
        "OCI Console → Email Delivery → Approved Senders → Create Approved Sender.",
        "Enter the full address (e.g. no-reply@yourdomain.com) and create it.",
        "Ensure SPF/DKIM DNS records for that domain are published (see OCI docs).",
        "Paste the exact address here — mail from any other address will be rejected.",
      ],
    },
    smtp_secure: {
      shortHint: "true = implicit TLS (port 465). false = STARTTLS (port 587).",
      steps: [
        "Enter true if SMTP port is 465 (implicit SSL/TLS).",
        "Enter false for port 587 — STARTTLS will be negotiated automatically.",
        "Leave matching your port choice. Wrong combination will fail to connect.",
      ],
    },
    google_oauth_client_id: {
      shortHint:
        "Google Cloud Console → APIs & Services → Credentials → OAuth client ID.",
      dashboardUrl: "https://console.cloud.google.com/apis/credentials",
      docUrl: "https://developers.google.com/identity/protocols/oauth2",
      steps: [
        "Open console.cloud.google.com and select (or create) a project.",
        "Go to APIs & Services → OAuth consent screen. Configure it (External, fill app name, support email, scopes: email, profile, openid).",
        "Publish the consent screen or keep it in testing with your email added.",
        "Go to APIs & Services → Credentials → Create Credentials → OAuth client ID.",
        "Application type: Web application. Add Authorized redirect URI: https://YOUR_DOMAIN/api/auth/callback/google (and http://localhost:3000/api/auth/callback/google for dev).",
        "Click Create. Copy the Client ID shown and paste it here.",
      ],
    },
    google_oauth_client_secret: {
      shortHint:
        "Same OAuth client as the Client ID — copy the Client secret value.",
      dashboardUrl: "https://console.cloud.google.com/apis/credentials",
      docUrl: "https://developers.google.com/identity/protocols/oauth2",
      steps: [
        "Open the OAuth client you created for CourseForge in Google Cloud Console → Credentials.",
        "Click the client name to open its detail page.",
        "Under Additional information (or the Client secrets section), copy Client secret.",
        "Paste it here.",
      ],
      warning: "If the secret is ever exposed, rotate it from the same panel.",
    },
  };
