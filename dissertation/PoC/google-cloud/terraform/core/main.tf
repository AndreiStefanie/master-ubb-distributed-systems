terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "4.64.0"
    }
  }
}

provider "google" {
  credentials = var.google_credentials_path
  project     = var.project
}

# Workload Identity setup for cross-provider access
resource "google_iam_workload_identity_pool" "this" {
  workload_identity_pool_id = "sap-rti-wip-integration-pool"
  display_name              = "Integrations"
  description               = "Identity pool for asset feed integrations"

}

resource "google_iam_workload_identity_pool_provider" "aws" {
  for_each = var.integrations_aws

  workload_identity_pool_id          = google_iam_workload_identity_pool.this.workload_identity_pool_id
  workload_identity_pool_provider_id = "sap-aws-${each.key}"
  display_name                       = "AWS ${each.key}"
  description                        = "Identity provider for AWS account ${each.value.account_id}"
  attribute_condition                = "assertion.arn.startsWith('arn:aws:sts::${each.value.account_id}:assumed-role/RealTimeInventory')"
  attribute_mapping = {
    "google.subject"        = "assertion.arn"
    "attribute.aws_account" = "assertion.account"
  }
  aws {
    account_id = each.value.account_id
  }
}

resource "google_iam_workload_identity_pool_provider" "azure" {
  for_each = var.integrations_azure

  workload_identity_pool_id          = google_iam_workload_identity_pool.this.workload_identity_pool_id
  workload_identity_pool_provider_id = "sap-az-${each.key}"
  display_name                       = "Azure ${each.key}"
  description                        = "Identity provider for Azure tenand ${each.value.tenand_id}"
  attribute_mapping = {
    "google.subject" = "assertion.sub"
  }
  oidc {
    issuer_uri = "https://sts.windows.net/${each.value.tenand_id}"
  }
}

resource "google_service_account" "this" {
  account_id   = "collectors"
  display_name = "SA allowing collectors to push to Pub/Sub"
}

resource "google_service_account_iam_binding" "impersonation" {
  service_account_id = google_service_account.this.name
  role               = "roles/iam.workloadIdentityUser"

  members = [
    "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.this.name}/*",
  ]
}

# Setup for Google Cloud integrations
resource "google_pubsub_topic" "gcp_feed" {
  name = "sap-rti-topic-gcp-feed"
}

resource "google_pubsub_topic_iam_member" "gcp" {
  for_each = var.integrations_gcp

  topic  = google_pubsub_topic.gcp_feed.name
  role   = "roles/pubsub.publisher"
  member = "serviceAccount:service-${each.value.project_number}@gcp-sa-cloudasset.iam.gserviceaccount.com"
}

# Core infrastructure setup
resource "google_pubsub_topic" "inventory" {
  name = "sap-rti-topic-inventory"
}

resource "google_pubsub_topic_iam_member" "collectors" {
  topic  = google_pubsub_topic.inventory.name
  role   = "roles/pubsub.publisher"
  member = "serviceAccount:${google_service_account.this.email}"
}
