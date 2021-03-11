job "gateway" {
  datacenters = ["dc1"]

  type = "service"

  group "gateway" {
    count = 1
    
    task "gateway" {
      driver = "docker"
      config {
        image = "gateway:local"
        ports = ["http"]
      }

      resources {
        network {
          port "http" {
            to = 80
          }
        }

        cpu    = 200 #200MHz
        memory = 128 #128MB
      }

      service {
        name = "gateway"
        tags = ["global", "gateway"]
        port = "http"

        check {
          type = "http"
          path = "/"
          interval = "5s"
          timeout = "2s"
        }
      }

      env {
        PGUSER = "invoicify_dev"
        PGPASSWORD = "password"
        PGDATABASE = "invoicify_dev"
        JWT_SECRET = "vinfkltnglkdnll"
        PORT = "80"
        WAIT_HOSTS = "pg:5432,jwt-maker:80"
        WAIT_HOSTS_TIMEOUT = 60
      }
    }
  }
}