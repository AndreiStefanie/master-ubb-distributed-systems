google_credentials_path = "/Users/andrei/Documents/Keys/sap-rti-terraform.json"

project = "sap-real-time-inventory-core"

rti_aws_account = "026709880083"

integrations_azure = {
  "cyscale" = {
    tenand_id = "0982f0f2-e325-49dd-93e1-cf43c4f0e590"
  }
}

integrations_gcp = {
  "test" = {
    project_id     = "sap-real-time-inventory"
    project_number = "790021612593"
  }
}

aws_accounts = ["201157465182"]

aws_region = "eu-west-1"

lambda_src_path = "/Users/andrei/Projects/master-ubb-distributed-systems/dissertation/collector-aws/.aws-sam/build/AWSCollectorFunction"
