terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.60.0"
    }
  }
}

provider "azurerm" {
  subscription_id = var.subscription_id

  features {}
}

module "eval" {
  source = "../modules/azure-evaluation"

  region         = var.region
  resource_count = var.resource_count
}
