variable "subscription_id" {
  type = string
}

variable "function_id" {
  type        = string
  description = "Format: {function_app.id}/functions/{name}"
}
