// Define which columns are visible to clients
export const CLIENT_VISIBLE_COLUMNS = [
  "id",
  "company",
  "owner",
  "mobile",
  "personal_email",
  "company_email",
  "industry",
  "company_phone",
  "address",
  "city",
  "state",
  "zip_code",
  "website",
  "company_linkedin",
  "job_title",
  "work_phone",
  "personal_linkedin",
]

// Define which columns are included in downloads
export const DOWNLOADABLE_COLUMNS = [
  "company",
  "owner",
  "mobile",
  "personal_email",
  "company_email",
  "industry",
  "company_phone",
  "address",
  "city",
  "state",
  "zip_code",
  "website",
]

// Define which columns are visible to admins (all columns)
export const ADMIN_VISIBLE_COLUMNS = [
  ...CLIENT_VISIBLE_COLUMNS,
  "annual_revenue",
  "employees",
  "naics_code",
  "sic_code",
  "datapoint_1",
  "score_1",
  "datapoint_2",
  "score_2",
  "report_date",
  "batch_date",
  "invoice_number",
  "client_id",
]

// Helper function to get visible columns based on user role
export function getVisibleColumns(role: string): string[] {
  return role === "admin" ? ADMIN_VISIBLE_COLUMNS : CLIENT_VISIBLE_COLUMNS
}

// Helper function to get downloadable columns based on user role
export function getDownloadableColumns(role: string): string[] {
  return role === "admin" ? ADMIN_VISIBLE_COLUMNS : DOWNLOADABLE_COLUMNS
}
