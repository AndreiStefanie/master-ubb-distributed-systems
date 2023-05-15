variable "google_credentials_path" {
  type        = string
  description = "The path to the Google credentials key file"
}

variable "project" {
  type = string
}

variable "integrations_aws" {
  type = map(object({
    account_id = string
  }))
}

variable "integrations_azure" {
  type = map(object({
    tenand_id = string
  }))
}

variable "integrations_gcp" {
  type = map(object({
    project_id     = string
    project_number = string
  }))
}
