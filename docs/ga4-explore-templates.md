# GA4 Explore Templates

Template ini mengikuti taxonomy event yang sudah dinormalisasi di aplikasi.

## 1) Funnel CTA ke Contact
- Exploration type: Funnel exploration
- Date range: Last 30 days
- Steps:
  - Step 1: eventName exactly matches lead_cta_click
  - Step 2: eventName exactly matches lead_contact_click
- Breakdown dimension: UI Location
  - custom dimension: ui_location
- Tujuan:
  - Melihat rasio konversi CTA ke contact.

## 2) Top Social Platform
- Exploration type: Free form
- Rows: social_platform
- Values: Event count
- Filter:
  - eventName exactly matches engagement_social_click
- Sort: Event count descending
- Tujuan:
  - Mengetahui channel social paling efektif.

## 3) Top Project Action
- Exploration type: Free form
- Rows: project_action
- Values: Event count
- Filter:
  - eventName exactly matches portfolio_project_click
- Sort: Event count descending
- Tujuan:
  - Mengetahui aksi dominan user pada section portfolio.

## 4) Dashboard Usage
- Exploration type: Free form
- Rows:
  - action_name
  - ui_location
- Values: Event count
- Filter:
  - eventName exactly matches admin_dashboard_action
- Sort: Event count descending
- Tujuan:
  - Mengukur aktivitas admin panel secara detail.

## 5) Command otomatis report pack
Jalankan dari root project:

node scripts/run-ga4-report-pack.mjs

Output JSON:
- reports/ga4-report-pack.json

Catatan:
- Custom definitions baru bisa butuh waktu propagasi di GA4 sebelum muncul penuh di Explore.
