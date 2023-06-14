resource "azurerm_resource_group" "this" {
  name     = "rg-rti-${var.region}-evaluation"
  location = var.region
}

resource "azurerm_managed_disk" "this" {
  count = var.resource_count

  name                 = "disk-sap-rti-${var.region}-evaluation-${count.index}"
  location             = azurerm_resource_group.this.location
  resource_group_name  = azurerm_resource_group.this.name
  storage_account_type = "Standard_LRS"
  create_option        = "Empty"
  disk_size_gb         = "1"

  tags = {
    project = "rti"
  }
}

resource "azurerm_storage_account" "this" {
  count = var.resource_count

  name                     = "strtieval${var.region}${count.index}"
  resource_group_name      = azurerm_resource_group.this.name
  location                 = azurerm_resource_group.this.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = {
    project = "rti"
  }
}

resource "azurerm_network_security_group" "this" {
  count = var.resource_count

  name                = "nsg-sap-rti-evaluation-${var.region}-${count.index}"
  location            = azurerm_resource_group.this.location
  resource_group_name = azurerm_resource_group.this.name

  security_rule {
    name                       = "Everything"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  tags = {
    project = "rti"
  }
}
