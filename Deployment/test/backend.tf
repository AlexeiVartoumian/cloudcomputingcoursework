terraform {
  backend "gcs" {
    bucket = "cloudcomputing-473914-terraform-state"
    prefix = "terraform/state"
  }
}