# EventBridge
resource "aws_cloudwatch_event_bus" "integrations" {
  name = "sap-rti-eventbus-aws-feed"
}

data "aws_iam_policy_document" "allow_integrations" {
  statement {
    sid       = "allow_integrations_to_put_events"
    effect    = "Allow"
    actions   = ["events:PutEvents"]
    resources = [aws_cloudwatch_event_bus.integrations.arn]

    principals {
      type        = "AWS"
      identifiers = var.aws_accounts
    }
  }
}

resource "aws_cloudwatch_event_bus_policy" "allow_integrations" {
  policy         = data.aws_iam_policy_document.allow_integrations.json
  event_bus_name = aws_cloudwatch_event_bus.integrations.name
}

resource "aws_cloudwatch_event_rule" "collector" {
  name           = "sap-rti-eventbus-aws-feed-collector"
  description    = "Capture item changes from the monitored AWS accounts"
  event_bus_name = aws_cloudwatch_event_bus.integrations.name

  event_pattern = jsonencode({
    account = var.aws_accounts
  })
}

resource "aws_cloudwatch_event_target" "collector" {
  arn            = aws_lambda_function.aws_collector.arn
  rule           = aws_cloudwatch_event_rule.collector.name
  event_bus_name = aws_cloudwatch_event_bus.integrations.name
}

# The IAM Role for sending the inventory item to Google Cloud Pub/Sub
resource "aws_iam_role" "inventory" {
  name = local.aws_integration_role

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "basic" {
  role       = aws_iam_role.inventory.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda function collector
data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = var.lambda_src_path
  output_path = "aws-collector.zip"
}

resource "aws_lambda_function" "aws_collector" {
  filename         = data.archive_file.lambda.output_path
  function_name    = "sap-rti-aws-collector"
  role             = aws_iam_role.inventory.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.lambda.output_base64sha256
  runtime          = "nodejs18.x"
  timeout          = 10

  environment {
    variables = {
      GOOGLE_APPLICATION_CREDENTIALS = "./creds-config.json"
      GOOGLE_CLOUD_PROJECT           = var.project
    }
  }
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.aws_collector.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.collector.arn
}
