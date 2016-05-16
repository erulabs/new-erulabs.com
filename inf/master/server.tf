resource "google_compute_instance" "default" {
  name         = "test"
  machine_type = "n1-standard-1"
  zone         = "us-central1-a"

  disk {
    image = "ubuntu-1604-xenial-v20160429"
  }

  disk {
    type = "pd-standard"
  }

  network_interface {
    network = "default"
    access_config {
      // Ephemeral IP#
    }
  }

  metadata_startup_script = "echo hi > /test.txt"

  service_account {
    scopes = ["userinfo-email", "compute-ro", "storage-ro"]
  }
}
