provider "google" {
  credentials = "${file("secrets/account.json.plain")}"
  project     = "seandonmooy-1292"
  region      = "us-central1"
}

provider "aws" {
	region = "us-east-1"
}
