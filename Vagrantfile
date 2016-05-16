$script = <<SCRIPT
apt update
apt install -y python-pip git libffi-dev libssl-dev
pip install --upgrade pip
pip install paramiko PyYAML Jinja2 httplib2 six pycrypto
git clone git://github.com/ansible/ansible.git --recursive
echo "source /home/vagrant/ansible/hacking/env-setup" >> ~/.bashrc
echo "export PATH=/home/vagrant/ansible/bin/:$PATH" >> ~/.bashrc
ln -s /vagrant ~/erulabs.com
SCRIPT

Vagrant.configure(2) do |config|
  config.vm.box = "box-cutter/ubuntu1604"
  config.vm.provider "virtualbox" do |vb|
    vb.memory = "1024"
    vb.cpus = 2
  end
  config.vm.provision "shell", inline: $script
end
