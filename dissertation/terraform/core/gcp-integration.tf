# Setup for Google Cloud integrations
resource "google_pubsub_topic" "gcp_feed" {
  name = "sap-rti-topic-gcp-feed"
}

resource "google_pubsub_topic_iam_member" "gcp" {
  for_each = var.integrations_gcp

  topic  = google_pubsub_topic.gcp_feed.name
  role   = "roles/pubsub.publisher"
  member = "serviceAccount:service-${each.value.project_number}@gcp-sa-cloudasset.iam.gserviceaccount.com"
}
