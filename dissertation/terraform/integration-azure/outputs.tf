output "secret" {
  value     = azuread_application_password.secret.value
  sensitive = true
}
