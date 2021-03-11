job "pg" {
  datacenters = ["dc1"]

  type = "service"

  group "pg" {
    count = 1
    
    task "pg" {
      driver = "docker"
      config {
        image = "pg:local"
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
        name = "pg"
        tags = ["global", "pg"]
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
        WAIT_HOSTS = "pg:5432,pg:80"
        WAIT_HOSTS_TIMEOUT = 60
      }
    }
  }
}