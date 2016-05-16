resource "google_compute_address" "erulabs" {
  name = "erulabs"
}

resource "google_compute_instance" "erulabs" {
  name         = "erulabs"
  machine_type = "n1-standard-1"
  zone         = "us-central1-a"

  disk {
    image = "ubuntu-1604-xenial-v20160429"
    type = "pd-standard"
    size = 30
  }

  network_interface {
    network = "default"
    access_config {
      nat_ip = "${google_compute_address.erulabs.address}"
    }
  }

  metadata_startup_script = "echo hi > /test.txt"

  service_account {
    scopes = ["userinfo-email", "compute-ro", "storage-ro"]
  }
}
