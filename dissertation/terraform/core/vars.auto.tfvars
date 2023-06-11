google_credentials_path = "/Users/andrei/Documents/Keys/sap-rti-terraform.json"

project = "sap-real-time-inventory-core"

rti_aws_account        = "026709880083"
rti_azure_subscription = "ced525b8-ae72-4ebe-b640-45c46e4f7d15"
rti_azure_tenant       = "0d5964ac-4c8f-4916-8325-8956793a5be4"

integrations_gcp = {
  "test" = {
    project_id     = "sap-real-time-inventory"
    project_number = "790021612593"
  }
}

monitored_aws_accounts = ["201157465182"]
aws_region             = "eu-west-1"

lambda_src_path = "/Users/andrei/Projects/master-ubb-distributed-systems/dissertation/collector-aws/.aws-sam/build/AWSCollectorFunction"

monitored_azure_credentials = {
  "6df41622-41b3-4bc3-bc18-8debd3d2820b" = {
    client_id = "cac5c835-d6d5-43d3-a3db-5ddf2a8a5be7"
    secret    = "YRD8Q~S8dg0Ih6R2zXGzAMT7c2Dw6gdbajpjAa1i"
  }
}
