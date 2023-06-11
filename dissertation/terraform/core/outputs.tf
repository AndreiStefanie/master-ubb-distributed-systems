output "gcp_topic_id" {
  value = google_pubsub_topic.gcp_feed.id
}

output "azure_function_url" {
  value = "https://${azurerm_linux_function_app.this.default_hostname}/api/collectorWebhook"
}

output "azure_managed_identity_object_id" {
  value = azurerm_user_assigned_identity.this.principal_id
}

output "azure_resource_uri" {
  value       = local.resource_uri
  description = "The identifier of the application registration. Used as audience"
}
