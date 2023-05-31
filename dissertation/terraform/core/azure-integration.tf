# App Registration
resource "azuread_application" "this" {
  display_name    = "RealTimeInventory"
  identifier_uris = ["api://real-time-inventory"]
}

resource "azuread_service_principal" "this" {
  application_id = azuread_application.this.application_id
  description    = "Service principal for Real-Time Inventory integration"
  # app_role_assignment_required = true # TODO
}

resource "azurerm_resource_group" "this" {
  name     = "rg-rti"
  location = "West Europe"
}

resource "azurerm_user_assigned_identity" "this" {
  location            = azurerm_resource_group.this.location
  name                = "id-sap-rti-integration"
  resource_group_name = azurerm_resource_group.this.name
}

resource "azurerm_storage_account" "this" {
  name                     = "stsaprtifunctions"
  resource_group_name      = azurerm_resource_group.this.name
  location                 = azurerm_resource_group.this.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

}

resource "azurerm_role_assignment" "this" {
  role_definition_name = "Storage Account Contributor"
  scope                = azurerm_storage_account.this.id
  principal_id         = azurerm_user_assigned_identity.this.principal_id
}

resource "azurerm_service_plan" "this" {
  name                = "asp-sap-rti-westeu-consumption"
  resource_group_name = azurerm_resource_group.this.name
  location            = azurerm_resource_group.this.location
  os_type             = "Linux"
  sku_name            = "Y1"
}

resource "azurerm_linux_function_app" "this" {
  name                = "func-sap-rti-collector"
  resource_group_name = azurerm_resource_group.this.name
  location            = azurerm_resource_group.this.location

  storage_account_name       = azurerm_storage_account.this.name
  storage_account_access_key = azurerm_storage_account.this.primary_access_key
  service_plan_id            = azurerm_service_plan.this.id

  site_config {
    application_stack {
      node_version = 18
    }
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.this.id]
  }

  app_settings = {
    AzureWebJobsFeatureFlags       = "EnableWorkerIndexing"
    GOOGLE_CLOUD_PROJECT           = var.project
    GOOGLE_APPLICATION_CREDENTIALS = "./creds-config.json"
  }
}
