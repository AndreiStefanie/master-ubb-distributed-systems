variable "google_credentials_path" {
  type        = string
  description = "The path to the Google credentials key file"
}

variable "project" {
  type = string
}

variable "rti_aws_account" {
  type = string
}

variable "rti_azure_tenant" {
  type = string
}

variable "rti_azure_subscription" {
  type = string
}

variable "integrations_gcp" {
  type = map(object({
    project_id     = string
    project_number = string
  }))
}

variable "monitored_aws_accounts" {
  type        = set(string)
  description = "The monitored AWS accounts"
}

variable "aws_region" {
  type = string
}

variable "lambda_src_path" {
  type        = string
  description = "The directory containing the compiled code for the AWS integration Lambda"
}

variable "monitored_azure_credentials" {
  type = map(object({
    client_id = string
    secret    = string
  }))
  description = "Map with secrets used for reading the resources. The key must be the subscription ID"
}
