job "consul" {
  datacenters = ["dcl"]

  //default type service

  group "consul" {
    count=1

    task "consul" {
      driver = "exec"

      config {
        command = "consul"
        args = ["agent", "-dev"]
      }

      artifact {
        source = "https://releases.hashicorp.com/consul/1.9.3/consul_1.9.3_darwin_amd64.zip"
      }
    }
  }

}