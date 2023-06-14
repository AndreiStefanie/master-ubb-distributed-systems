# App Registration
resource "random_uuid" "app_role_id" {}

data "azurerm_subscription" "this" {}

locals {
  resource_uri = "api://real-time-inventory"
}

resource "azuread_application" "this" {
  display_name    = "RealTimeInventory"
  identifier_uris = [local.resource_uri]

  app_role {
    allowed_member_types = ["Application"]
    display_name         = "Collector"
    description          = "Role for pushing the Azure assets"
    enabled              = true
    id                   = random_uuid.app_role_id.result
    value                = "collector"
  }
}

resource "azuread_service_principal" "this" {
  application_id               = azuread_application.this.application_id
  description                  = "Service principal for Real-Time Inventory integration"
  app_role_assignment_required = true
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

resource "azuread_app_role_assignment" "this" {
  app_role_id         = random_uuid.app_role_id.result
  principal_object_id = azurerm_user_assigned_identity.this.principal_id
  resource_object_id  = azuread_service_principal.this.object_id
}

resource "azurerm_role_assignment" "resource_reader" {
  role_definition_name = "Reader"
  scope                = data.azurerm_subscription.this.id
  principal_id         = azurerm_user_assigned_identity.this.principal_id
}

resource "azurerm_storage_account" "this" {
  name                     = "stsaprtifunctions"
  resource_group_name      = azurerm_resource_group.this.name
  location                 = azurerm_resource_group.this.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_role_assignment" "storage_access" {
  role_definition_name = "Storage Account Contributor"
  scope                = azurerm_storage_account.this.id
  principal_id         = azurerm_user_assigned_identity.this.principal_id
}

resource "azurerm_application_insights" "this" {
  name                = "ai-sap-rti-functions"
  location            = azurerm_resource_group.this.location
  resource_group_name = azurerm_resource_group.this.name
  application_type    = "Node.JS"
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

    application_insights_connection_string = azurerm_application_insights.this.connection_string
    application_insights_key               = azurerm_application_insights.this.instrumentation_key
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.this.id]
  }

  app_settings = {
    AzureWebJobsFeatureFlags = "EnableWorkerIndexing"
    AZURE_CLIENT_ID          = azurerm_user_assigned_identity.this.client_id
    GOOGLE_CLOUD_PROJECT     = var.project
    RESOURCE_URI             = local.resource_uri
  }

  lifecycle {
    ignore_changes = [tags]
  }
}
