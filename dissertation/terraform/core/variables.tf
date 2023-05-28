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

variable "integrations_gcp" {
  type = map(object({
    project_id     = string
    project_number = string
  }))
}

variable "aws_accounts" {
  type        = set(string)
  description = "The monitored AWS accounts"
}

variable "integrations_azure" {
  type = map(object({
    tenand_id = string
  }))
}

variable "aws_region" {
  type = string
}

variable "lambda_src_path" {
  type        = string
  description = "The directory containing the compiled code for the AWS integration Lambda"
}
