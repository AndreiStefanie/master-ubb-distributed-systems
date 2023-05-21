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
  allowed_account_ids = ["201157465182"]
}

# AWS Config Setup
data "aws_iam_policy_document" "config" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["config.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "config" {
  name                = "AWSConfigRole"
  assume_role_policy  = data.aws_iam_policy_document.config.json
  managed_policy_arns = ["arn:aws:iam::aws:policy/service-role/AWS_ConfigRole"]
}

resource "aws_config_configuration_recorder" "this" {
  name     = "RealTimeInventory"
  role_arn = aws_iam_role.config.arn

  recording_group {
    all_supported  = false
    resource_types = ["AWS::EC2::Instance", "AWS::S3::Bucket", "AWS::Lambda::Function"]
  }
}

resource "aws_config_delivery_channel" "this" {
  name           = "default"
  s3_bucket_name = aws_s3_bucket.config.bucket
  depends_on     = [aws_config_configuration_recorder.this]
}

resource "aws_s3_bucket" "config" {
  bucket        = "sap-rti-config-bucket"
  force_destroy = true
}

resource "aws_config_configuration_recorder_status" "this" {
  name       = aws_config_configuration_recorder.this.name
  is_enabled = true
  depends_on = [aws_config_delivery_channel.this]
}

data "aws_iam_policy_document" "config_delivery" {
  statement {
    effect  = "Allow"
    actions = ["s3:*"]
    resources = [
      aws_s3_bucket.config.arn,
      "${aws_s3_bucket.config.arn}/*"
    ]
  }
}

resource "aws_iam_role_policy" "config" {
  name   = "ConfigDeliveryToS3"
  role   = aws_iam_role.config.id
  policy = data.aws_iam_policy_document.config_delivery.json
}

# AWS EventBridge feed of change events from AWS Config
data "aws_iam_policy_document" "eventbridge" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "event_bus_invoke_remote_event_bus" {
  name               = "RTIInvokeRemoteEventBus"
  assume_role_policy = data.aws_iam_policy_document.eventbridge.json
}

data "aws_iam_policy_document" "event_bus_invoke_remote_event_bus" {
  statement {
    effect    = "Allow"
    actions   = ["events:PutEvents"]
    resources = [var.rti_eventbridge_arn]
  }
}

resource "aws_iam_policy" "event_bus_invoke_remote_event_bus" {
  name   = "RTIInvokeRemoteEventBus"
  policy = data.aws_iam_policy_document.event_bus_invoke_remote_event_bus.json
}

resource "aws_iam_role_policy_attachment" "event_bus_invoke_remote_event_bus" {
  role       = aws_iam_role.event_bus_invoke_remote_event_bus.name
  policy_arn = aws_iam_policy.event_bus_invoke_remote_event_bus.arn
}

resource "aws_cloudwatch_event_rule" "config" {
  name        = "rti-config-feed"
  description = "Capture AWS Config configuration item changes"

  event_pattern = jsonencode({
    source      = ["aws.config"]
    detail-type = ["Config Configuration Item Change"]
  })
}

resource "aws_cloudwatch_event_target" "rti_eventbridge" {
  rule      = aws_cloudwatch_event_rule.config.name
  target_id = "SendToRTIEventBridge"
  arn       = var.rti_eventbridge_arn
  role_arn  = aws_iam_role.event_bus_invoke_remote_event_bus.arn
}
