# Foop - B2B Automation SaaS

A Next.js application with Google Sheets integration for importing and exporting data.

## Features

- Google Sheets OAuth 2.0 authentication
- Spreadsheet and sheet/tab selection
- Column mapping with data transformations
- Read and write operations
- Data preview

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and configure your Google OAuth credentials:
   ```bash
   cp .env.example .env.local
   ```

3. Create Google OAuth credentials at https://console.cloud.google.com/apis/credentials
   - Add `http://localhost:3000/api/google-sheets/callback` as an authorized redirect URI
   - Enable the Google Sheets API and Google Drive API

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000/dashboard/integrations/google-sheets

## API Endpoints

- `GET /api/google-sheets/auth` - Initiate OAuth flow
- `GET /api/google-sheets/callback` - OAuth callback handler
- `GET /api/google-sheets/status` - Check connection status
- `POST /api/google-sheets/disconnect` - Disconnect account
- `GET /api/google-sheets/spreadsheets` - List spreadsheets
- `POST /api/google-sheets/spreadsheets` - Create spreadsheet
- `GET /api/google-sheets/spreadsheets/[id]` - Get spreadsheet details
- `POST /api/google-sheets/spreadsheets/[id]/sheets` - Add sheet
- `GET /api/google-sheets/spreadsheets/[id]/sheets/[title]/columns` - Get columns
- `GET /api/google-sheets/spreadsheets/[id]/sheets/[title]/data` - Read data
- `POST /api/google-sheets/spreadsheets/[id]/sheets/[title]/data` - Append rows
- `PUT /api/google-sheets/spreadsheets/[id]/sheets/[title]/data` - Write data
- `DELETE /api/google-sheets/spreadsheets/[id]/sheets/[title]/data` - Clear data
