# Smart Parking Ansible Deployment

This playbook provisions an Ubuntu EC2 host and deploys the existing Docker Compose application.

## Run from WSL/Ubuntu

```bash
cd /path/to/smart-parking-devops
cp ansible/group_vars/all.example.yml ansible/group_vars/all.yml
# Update ansible/inventory.ini with the current EC2 IP and private-key path.
ansible-galaxy collection install -r ansible/requirements.yml
ansible all -i ansible/inventory.ini -m ansible.builtin.ping
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml
```

The playbook installs Docker, Git, and the Compose plugin, clones the repository, starts the existing Compose stack, and checks `http://localhost:5000/api/health` on the EC2 host.

The private key and `all.yml` are intentionally ignored. Store application secrets through a secret manager or a protected CI/CD credential store rather than in Git.
