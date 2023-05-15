variable "project" {
  type = string
}

variable "target_pubsub_id" {
  type        = string
  description = "The Pub/Sub where to send the asset feed"
}
