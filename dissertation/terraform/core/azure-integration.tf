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

  api {
    requested_access_token_version = 2
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

  # auth_settings_v2 {
  #   auth_enabled           = true
  #   require_authentication = true
  #   unauthenticated_action = "Return401"
  #   default_provider       = "azureactivedirectory"

  #   active_directory_v2 {
  #     client_id = azuread_application.this.application_id

  #   }
  # }

  app_settings = {
    AzureWebJobsFeatureFlags = "EnableWorkerIndexing"
    AZURE_CLIENT_ID          = azurerm_user_assigned_identity.this.client_id
    GOOGLE_CLOUD_PROJECT     = var.project
    RESOURCE_URI             = local.resource_uri
    KEY_VAULT_NAME           = azurerm_key_vault.this.name
  }

  lifecycle {
    ignore_changes = [tags]
  }
}

# Key vault for storing integration secrets
data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "this" {
  name                       = "kv-sap-rti-integration"
  location                   = azurerm_resource_group.this.location
  resource_group_name        = azurerm_resource_group.this.name
  tenant_id                  = var.rti_azure_tenant
  sku_name                   = "standard"
  soft_delete_retention_days = 7

  // Allow management of secrets
  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    secret_permissions = [
      "Set",
      "Get",
      "List",
      "Delete",
      "Purge",
      "Recover"
    ]
  }

  // Allow the function to read the secrets
  access_policy {
    tenant_id = var.rti_azure_tenant
    object_id = azurerm_user_assigned_identity.this.principal_id

    secret_permissions = ["Get"]
  }
}

resource "azurerm_key_vault_secret" "this" {
  for_each = var.monitored_azure_credentials

  name         = each.key
  value        = "${each.value.client_id}:${each.value.secret}"
  key_vault_id = azurerm_key_vault.this.id
}
