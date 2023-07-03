terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "4.64.0"
    }

    aws = {
      source  = "hashicorp/aws"
      version = "4.67.0"
    }

    azuread = {
      source  = "hashicorp/azuread"
      version = "2.39.0"
    }

    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.58.0"
    }
  }
}

provider "google" {
  credentials = var.google_credentials_path
  project     = var.project
}

provider "aws" {
  region              = var.aws_region
  allowed_account_ids = [var.rti_aws_account]
  profile             = "caa"
}

provider "azuread" {
  tenant_id = var.rti_azure_tenant
}

provider "azurerm" {
  subscription_id = var.rti_azure_subscription
  tenant_id       = var.rti_azure_tenant

  features {}
}

locals {
  aws_integration_role = "RealTimeInventory"
}

# Workload Identity setup for cross-provider access
resource "google_iam_workload_identity_pool" "this" {
  workload_identity_pool_id = "sap-rti-wip-integration-pool"
  display_name              = "Integrations"
  description               = "Identity pool for asset feed integrations"

}

resource "google_iam_workload_identity_pool_provider" "aws" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.this.workload_identity_pool_id
  workload_identity_pool_provider_id = "sap-aws-rti"
  display_name                       = "AWS RTI Identity"
  description                        = "Identity provider for AWS account ${var.rti_aws_account}"

  attribute_mapping = {
    "google.subject"        = "assertion.arn"
    "attribute.aws_account" = "assertion.account"
  }

  attribute_condition = "assertion.arn.startsWith('arn:aws:sts::${var.rti_aws_account}:assumed-role/${local.aws_integration_role}')"

  aws {
    account_id = var.rti_aws_account
  }
}

resource "google_iam_workload_identity_pool_provider" "azure" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.this.workload_identity_pool_id
  workload_identity_pool_provider_id = "sap-azure-rti"
  display_name                       = "Azure RTI Identity"
  description                        = "Identity provider for Azure tenant ${var.rti_azure_tenant}"

  attribute_mapping = {
    "google.subject" = "assertion.sub"
  }

  attribute_condition = "assertion.sub == '${azurerm_user_assigned_identity.this.principal_id}'"

  oidc {
    issuer_uri        = "https://sts.windows.net/${var.rti_azure_tenant}"
    allowed_audiences = azuread_application.this.identifier_uris
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

# Core infrastructure setup
resource "google_pubsub_topic" "inventory" {
  name = "sap-rti-topic-inventory"
}

resource "google_pubsub_topic_iam_member" "collectors" {
  topic  = google_pubsub_topic.inventory.name
  role   = "roles/pubsub.publisher"
  member = "serviceAccount:${google_service_account.this.email}"
}

resource "google_bigquery_dataset" "this" {
  dataset_id    = "rti"
  friendly_name = "rti_dataset"
  description   = "Real-Time Inventory Data Set"
  location      = "EU"
}

resource "google_bigquery_table" "stats" {
  dataset_id = google_bigquery_dataset.this.dataset_id
  table_id   = "stats"

  schema = <<EOF
[
  {
    "name": "assetId",
    "mode": "NULLABLE",
    "type": "STRING"
  },
  {
    "name": "version",
    "mode": "NULLABLE",
    "type": "STRING"
  },
  {
    "name": "operation",
    "mode": "NULLABLE",
    "type": "STRING"
  },
  {
    "name": "changeTime",
    "mode": "NULLABLE",
    "type": "TIMESTAMP"
  },
  {
    "name": "inventoryTime",
    "mode": "NULLABLE",
    "type": "TIMESTAMP"
  },
  {
    "name": "timeToInventoryMs",
    "mode": "NULLABLE",
    "type": "NUMERIC"
  },
  {
    "name": "assetType",
    "mode": "NULLABLE",
    "type": "STRING"
  },
  {
    "name": "provider",
    "mode": "NULLABLE",
    "type": "STRING"
  },
  {
    "name": "region",
    "mode": "NULLABLE",
    "type": "STRING"
  }
]
EOF
}
