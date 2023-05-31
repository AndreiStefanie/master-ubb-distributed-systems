output "gcp_topic_id" {
  value = google_pubsub_topic.gcp_feed.id
}

output "azure_function_id" {
  value = "${azurerm_linux_function_app.this.id}/functions/collector"
}
