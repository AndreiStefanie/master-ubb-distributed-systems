terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region              = var.region
  allowed_account_ids = [var.monitored_account]
}

module "eval" {
  source = "../modules/aws-evaluation"

  region         = var.region
  resource_count = var.resource_count
}
