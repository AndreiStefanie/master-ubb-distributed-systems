
data "google_compute_zones" "available" {}

locals {
  zones = data.google_compute_zones.available.names
}

resource "google_compute_disk" "this" {
  count = var.resource_count

  name  = "disk-sap-rti-${var.region}-eval-${count.index}"
  type  = "pd-ssd"
  zone  = local.zones[count.index % length(local.zones)]
  image = "debian-11-bullseye-v20220719"
  size  = 10

  labels = {
    project = "rti"
  }
}

resource "google_storage_bucket" "this" {
  count = var.resource_count

  name          = "bucket-sap-rti-${var.region}-eval-${count.index}"
  location      = var.region
  force_destroy = true

  uniform_bucket_level_access = true

  labels = {
    project = "rti"
  }
}

data "google_compute_network" "default" {
  name = "default"
}


resource "google_compute_firewall" "this" {
  count = var.resource_count

  name    = "fw-sap-rti-evaluation-${var.region}-${count.index}"
  network = data.google_compute_network.default.name

  allow {
    protocol = "tcp"
    ports    = ["443"]
  }

  source_ranges = ["0.0.0.0/0"]
}
