terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.58.0"
    }
  }

  cloud {
    organization = "andreistefanie"

    workspaces {
      name = "monitored-azure-fincorp"
    }
  }
}

provider "azurerm" {
  subscription_id = var.subscription_id

  features {}
}

data "azurerm_subscription" "this" {
  subscription_id = var.subscription_id
}

resource "azurerm_resource_group" "this" {
  name     = "rg-rti-integration"
  location = "West Europe"
}

resource "azurerm_eventgrid_system_topic" "this" {
  name                   = "sap-rti-eg-system-topic"
  resource_group_name    = azurerm_resource_group.this.name
  location               = "Global"
  source_arm_resource_id = data.azurerm_subscription.this.id
  topic_type             = "Microsoft.Resources.Subscriptions"

  identity {
    type = "SystemAssigned"
  }
}

resource "azurerm_eventgrid_system_topic_event_subscription" "this" {
  name                = "sap-rti-egs-subscription-changes"
  system_topic        = azurerm_eventgrid_system_topic.this.name
  resource_group_name = azurerm_resource_group.this.name

  included_event_types = [
    "Microsoft.Resources.ResourceWriteSuccess",
    "Microsoft.Resources.ResourceDeleteSuccess",
  ]

  advanced_filtering_on_arrays_enabled = true
  advanced_filter {
    string_begins_with {
      key = "data.operationName"
      values = [
        "Microsoft.Storage/storageAccounts/",
        "Microsoft.Network/networkSecurityGroups/",
        "Microsoft.Compute/disks/"
      ]
    }
  }

  webhook_endpoint {
    url                               = var.webhook_url
    max_events_per_batch              = 10
    preferred_batch_size_in_kilobytes = 64
  }
}

# Identity federation
resource "azuread_application" "this" {
  display_name = "RealTimeInventory"
  required_resource_access {
    resource_app_id = "797f4846-ba00-4fd7-ba43-dac1f8f63013" # Azure Resource Manager
    resource_access {
      id   = "41094075-9dad-400e-a0bd-54e686782033" # user_impersonation
      type = "Scope"
    }
  }
}

resource "azuread_service_principal" "this" {
  application_id = azuread_application.this.application_id
  description    = "Service principal for Real-Time Inventory integration"
}

resource "azuread_application_password" "secret" {
  application_object_id = azuread_application.this.id
  end_date_relative     = "8760h" # Expire in one year
}

resource "azurerm_role_assignment" "resource_reader" {
  role_definition_name = "Reader"
  scope                = data.azurerm_subscription.this.id
  principal_id         = azuread_service_principal.this.object_id
}

# resource "azuread_application_federated_identity_credential" "rti_integration" {
#   application_object_id = azuread_application.this.object_id
#   display_name          = "rti-integration"
#   description           = "RTI Integration Environment"
#   audiences             = [var.rti_audience]
#   issuer                = "https://login.microsoftonline.com/${var.rti_tenant_id}/v2.0"
#   subject               = var.rti_managed_identity_object_id
# }
