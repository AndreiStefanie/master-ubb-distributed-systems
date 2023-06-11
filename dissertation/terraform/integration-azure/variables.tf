variable "subscription_id" {
  type = string
}

variable "webhook_url" {
  type = string
}

variable "rti_tenant_id" {
  type = string
}

variable "rti_managed_identity_object_id" {
  type        = string
  description = "The object ID of the user-assigned managed identity of the collector"
}

variable "rti_audience" {
  type = string
}

# variable "rti_app_id" {
#   type        = string
#   description = "The ID of the application registration that will be used for generating tokens"
# }
