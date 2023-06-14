terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "4.64.0"
    }
  }
}

provider "google" {
  project               = var.project
  billing_project       = var.project
  user_project_override = true
  region                = var.region
}

module "eval" {
  source = "../modules/gcp-evaluation"

  region         = var.region
  resource_count = var.resource_count
}
