# Nutrifit WhatsApp sales bot — preview rollout

## Goal

Create a Portuguese-language WhatsApp assistant for sales and customer support. This first slice uses deterministic replies (no LLM and no order-writing permissions) so the initial behavior is predictable.

## What is implemented

- app/api/whatsapp/webhook/route.ts:
  - GET verifies Meta's webhook challenge using WHATSAPP_VERIFY_TOKEN.
  - POST validates X-Hub-Signature-256 with HMAC-SHA256 and WHATSAPP_APP_SECRET.
  - Replies to text messages with a small menu for prices, combos, delivery questions, and human support.
  - Sends no message unless WHATSAPP_BOT_ENABLED=true and VERCEL_ENV=preview.
  - Does not log message bodies, customer phone numbers, or access tokens.
- The bot does not create orders, collect payment details, promise delivery availability, or edit prices.
- Non-text messages are ignored in this first version.

## Required setup — Preview only

Create these environment variables in Vercel Preview only. Do not add them to Production. Scope them to the feature/whatsapp-sales-bot-preview Git branch when configuring branch-specific Preview variables.

| Variable | Purpose | Secret? |
|---|---|---|
| WHATSAPP_BOT_ENABLED | Set to true only for a controlled test | No |
| WHATSAPP_VERIFY_TOKEN | Random, long token chosen by Nutrifit and entered in Meta webhook settings | Yes |
| WHATSAPP_APP_SECRET | Meta app secret used to validate webhook signatures | Yes |
| WHATSAPP_ACCESS_TOKEN | WhatsApp Cloud API bearer token | Yes |
| WHATSAPP_PHONE_NUMBER_ID | Meta test phone-number ID | Treat as configuration |
| WHATSAPP_GRAPH_API_VERSION | Explicit Graph API version supported by the Meta app | No |

Do not put secrets in source control, screenshots, chat messages, or client-side variables. Use the Meta test number first. Do not connect the production business number during this phase.

## Setup sequence

1. In Meta for Developers, create/select an app with the WhatsApp product and use the provided test phone number.
2. Configure the Preview webhook URL: https://<preview-deployment-host>/api/whatsapp/webhook.
3. Set a random WHATSAPP_VERIFY_TOKEN in Vercel Preview and use the same value in Meta's webhook configuration.
4. Add WHATSAPP_APP_SECRET, WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, and WHATSAPP_GRAPH_API_VERSION as Preview variables only.
5. Verify the webhook and send test messages from an allowed test recipient.
6. Keep WHATSAPP_BOT_ENABLED=false until verification succeeds. Then enable it for this Preview branch only.
7. Check menu accuracy and human handoff; remove or correct any prices before live use if the Nutrifit menu has changed.

## Safety gates before production

- Add durable message-ID deduplication. Meta may retry webhook deliveries; this initial scaffold does not yet persist processed message IDs.
- Add a real human handoff queue/notification and a defined support response process. The current reply asks for details but does not itself alert staff.
- Reconcile all prices, delivery rules, and product availability against the authoritative Nutrifit catalog before advertising them.
- Review LGPD notice, purpose, retention, access controls, and customer-data handling.
- Test signature failures, malformed payloads, provider errors, repeated webhook delivery, non-text messages, and the 24-hour customer-service window.
- Do not connect order creation, payment, stock mutation, or production credentials until explicitly approved.

## Current status

Code scaffold only. No Meta app or WhatsApp number has been connected; no Vercel environment variables have been created; the bot is not sending messages. This branch must be deployed to Preview and validated before any merge or production release.
