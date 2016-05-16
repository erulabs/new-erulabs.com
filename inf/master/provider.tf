provider "google" {
  credentials = "${file("secrets/account.secret.json")}"
  project     = "seandonmooy-1292"
  region      = "us-central1"
}

provider "aws" {
	region = "us-east-1"
}
