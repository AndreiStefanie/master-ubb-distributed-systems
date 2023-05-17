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
}

data "google_project" "this" {}

resource "google_cloud_asset_project_feed" "this" {
  project      = var.project
  feed_id      = "sap-rti-feed-asset-changes"
  content_type = "RESOURCE"

  asset_types = [
    "compute.googleapis.com.*",
    "storage.googleapis.com.*",
    "cloudfunctions.googleapis.com.*",
    "run.googleapis.com.*"
  ]

  feed_output_config {
    pubsub_destination {
      topic = var.target_pubsub_id
    }
  }
}

resource "google_project_service_identity" "ca_sa" {
  provider = google-beta

  project = data.google_project.this.project_id
  service = "cloudasset.googleapis.com"
}
