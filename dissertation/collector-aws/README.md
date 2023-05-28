# AWS Collector

This is the Lambda function responsible for forwarding the AWS assets to the core infrastructure. It performs the following tasks:

1. Map the Config Item Change data to the core asset model
2. Send the asset as a CloudEvent to the central Pub/Sub topic
