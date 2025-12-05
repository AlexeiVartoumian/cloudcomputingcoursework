

resource "google_compute_firewall" "firewall" {
  name    = var.name
  network = var.network_name

  allow {
    protocol = "icmp"
  }
  
  allow {
    protocol = "tcp"
    ports    = var.ports
  }

  source_ranges = var.source_ranges
  target_tags   = var.target_tags
}