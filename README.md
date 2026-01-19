# Foop - B2B Automation SaaS

## Usage Analytics Backend

This project includes a comprehensive usage analytics backend for tracking:

- **Workflow Runs**: Track execution of automation workflows with success/failure rates and execution times
- **API Usage**: Monitor API endpoint usage, latency, and error rates
- **Daily Metrics**: Pre-aggregated daily statistics for fast dashboard queries

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database URL
   ```

3. Generate Prisma client and push schema:
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

### API Endpoints

#### Workflow Runs

**POST /api/analytics/runs** - Log workflow runs

```json
// Start a run
{ "action": "start", "workflowId": "...", "organizationId": "..." }

// Complete a run
{ "action": "complete", "runId": "...", "status": "SUCCESS" | "FAILURE" }

// Log complete run in one call
{ "action": "log", "workflowId": "...", "organizationId": "...", "status": "SUCCESS", "duration": 1234 }
```

**GET /api/analytics/runs?organizationId=...** - Get workflow statistics and recent runs

#### API Usage

**POST /api/analytics/api-usage** - Log API calls

```json
{
  "organizationId": "...",
  "endpoint": "/api/workflows",
  "method": "GET",
  "statusCode": 200,
  "duration": 150
}
```

**GET /api/analytics/api-usage?organizationId=...** - Get API usage statistics

#### Dashboard

**GET /api/analytics/dashboard?organizationId=...** - Get complete dashboard metrics

Returns:
- Workflow stats (total runs, success rate, avg duration)
- API usage stats (total calls, avg latency, error rate)
- Recent workflow runs
- Daily trends

#### Aggregation (Cron)

**POST /api/analytics/aggregate** - Aggregate daily metrics

Typically called by a cron job to pre-compute daily statistics. Secure with `CRON_SECRET` environment variable.

### Database Schema

Key models:

- `WorkflowRun` - Individual workflow execution records
- `ApiUsageLog` - API call logs
- `DailyMetrics` - Pre-aggregated daily statistics

See `prisma/schema.prisma` for the complete schema.
