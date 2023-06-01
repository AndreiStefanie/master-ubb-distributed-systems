terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.58.0"
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
    string_contains {
      key = "subject"
      values = [
        "/providers/Microsoft.Storage/storageAccounts/",
        "/providers/Microsoft.Compute/virtualMachines/",
      ]
    }
  }

  azure_function_endpoint {
    function_id                       = var.function_id
    max_events_per_batch              = 100
    preferred_batch_size_in_kilobytes = 64
  }

  # webhook_endpoint {
  #   url                               = "https://sap-as-event-grid-viewer.azurewebsites.net/api/updates/"
  #   max_events_per_batch              = 10
  #   preferred_batch_size_in_kilobytes = 64
  # }
}
