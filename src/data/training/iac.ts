import { createConceptQuiz, createModule, createQuest } from './helpers';

const quests = [
  createQuest({
    id: 'iac_tf_lifecycle',
    title: 'Terraform Lifecycle: Init, Plan, Apply',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Initialize a Terraform workspace, inspect plan, and provision resources.',
    skillOutcomes: [
      'Understand provider plugin downloads via terraform init.',
      'Analyze declarative changes via terraform plan.',
      'Deploy real cloud configurations via terraform apply.'
    ],
    commands: [
      {
        title: 'Initialize Directory',
        explanation: 'terraform init downloads required provider plugins (e.g. AWS, Azure) and configures backend storage settings.',
        command: 'terraform init',
        output: 'Initializing the backend...\nInitializing provider plugins...\n- Finding latest version of hashicorp/aws...\n- Installing hashicorp/aws v5.0.0...\nTerraform has been successfully initialized!'
      },
      {
        title: 'Generate Execution Plan',
        explanation: 'terraform plan queries existing cloud APIs to compute the difference between local declarations and live resources.',
        command: 'terraform plan',
        output: 'Terraform will perform the following actions:\n  # aws_instance.web will be created\n  + resource "aws_instance" "web" {\n      + ami           = "ami-0c55b159cbfa"\n      + instance_type = "t2.micro"\n    }\nPlan: 1 to add, 0 to change, 0 to destroy.'
      },
      {
        title: 'Apply Infrastructure changes',
        explanation: 'terraform apply executes the calculated deployment steps to configure resources live.',
        command: 'terraform apply',
        output: 'aws_instance.web: Creating...\naws_instance.web: Creation complete after 15s [id=i-0123456789]\nApply complete! Resources: 1 added, 0 changed, 0 destroyed.'
      }
    ]
  }),
  createQuest({
    id: 'iac_tf_variables_outputs',
    title: 'Variables and Outputs',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Create dynamic inputs and output parameters in Terraform.',
    skillOutcomes: [
      'Write input variables for parameterization.',
      'Expose outputs to bubble up resource metadata.',
      'Configure variables.tf definitions.'
    ],
    commands: [
      {
        title: 'Configure Variable and Output',
        explanation: 'Variables make configurations reusable. Outputs expose computed values (like IPs or DNS names) after application runs.',
        command: 'echo "variable \\"instance_type\\" { default = \\"t2.micro\\" } output \\"public_ip\\" { value = \\"10.0.1.15\\" }" > variables.tf',
        output: 'Wrote variables.tf.'
      }
    ]
  }),
  createQuest({
    id: 'iac_tf_state_drift',
    title: 'State File and Drift',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'List managed resources inside the state file and inspect resource drift.',
    skillOutcomes: [
      'Expose local resource representations via state command.',
      'Recognize live changes bypassing IaC control.',
      'Maintain state as the absolute source of truth.'
    ],
    commands: [
      {
        title: 'List Resources in State',
        explanation: 'Terraform uses a state file (terraform.tfstate) to map configuration definitions to actual resources. Never edit this file by hand.',
        command: 'terraform state list',
        output: 'aws_instance.web\naws_security_group.sg_web\naws_vpc.main_vpc'
      }
    ]
  }),
  createQuest({
    id: 'iac_tf_providers_resources',
    title: 'Providers and Resource Addressing',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Define provider configurations and address resources in manifests.',
    skillOutcomes: [
      'Configure cloud provider bindings.',
      'Understand resource type and local name mappings.',
      'Declare resource arguments.'
    ],
    commands: [
      {
        title: 'Define Provider and Resource',
        explanation: 'Providers translate declarative Terraform resource calls into specific cloud platform API actions.',
        command: 'echo "provider \\"aws\\" { region = \\"us-east-1\\" } resource \\"aws_instance\\" \\"web\\" { ami = \\"ami-0c55b159cbfafe1f0\\" }" > main.tf',
        output: 'Wrote main.tf.'
      }
    ]
  }),
  createQuest({
    id: 'iac_tf_modules',
    title: 'Reusable Modules',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Call a local reusable module to bundle groups of resources.',
    skillOutcomes: [
      'Create reusable module blocks.',
      'Map configuration variables inside module targets.',
      'Explain module source parameters.'
    ],
    commands: [
      {
        title: 'Define Module Reference',
        explanation: 'Modules are containers for multiple resources that are used together, helping structure large codebases into micro components.',
        command: 'echo "module \\"vpc\\" { source = \\"./modules/vpc\\" cidr = \\"10.0.0.0/16\\" }" > modules.tf',
        output: 'Wrote modules.tf.'
      }
    ]
  }),
  createQuest({
    id: 'iac_tf_remote_backend',
    title: 'Remote Backends and Locking',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Configure a remote S3 backend to store state files with locking mechanisms.',
    skillOutcomes: [
      'Configure remote backend definitions.',
      'Enable collaborative state updates.',
      'Explain why state locks prevent parallel execution issues.'
    ],
    commands: [
      {
        title: 'Define Remote Backend',
        explanation: 'A remote backend stores state in shared cloud storage (like S3) instead of local disks, using DB tables (like DynamoDB) to lock files.',
        command: 'echo "terraform { backend \\"s3\\" { bucket = \\"tf-state\\" key = \\"prod/state\\" region = \\"us-east-1\\" } }" > backend.tf',
        output: 'Wrote backend.tf.'
      }
    ]
  }),
  createQuest({
    id: 'iac_tf_import',
    title: 'Importing Existing Infrastructure',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Import a live cloud resource into your local state tracking file.',
    skillOutcomes: [
      'Map real-world IDs to local configuration resources.',
      'Execute terraform import commands.',
      'Generate configurations to match imported state.'
    ],
    commands: [
      {
        title: 'Import Resource',
        explanation: 'terraform import associates existing infrastructure (created via console or script) with a declared Terraform resource address.',
        command: 'terraform import aws_instance.web i-0123456789abcdef0',
        output: 'aws_instance.web: Importing from ID "i-0123456789abcdef0"...\naws_instance.web: Import prepared!\nImport successful!'
      }
    ]
  }),
  createQuest({
    id: 'iac_tf_plan_review',
    title: 'Plan Review and Destructive Changes',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Save plan configurations and inspect details for dangerous resources recreation.',
    skillOutcomes: [
      'Export binary execution plans using -out.',
      'Inspect resource recreate triggers (forces replacement).',
      'Prevent accidental production database drops.'
    ],
    commands: [
      {
        title: 'Save Execution Plan',
        explanation: 'Saving the plan ensures that the exact modifications reviewed are applied, protecting against race conditions.',
        command: 'terraform plan -out=tfplan',
        output: 'Wrote plan output file to: tfplan\nPlan: 0 to add, 1 to change, 0 to destroy.'
      },
      {
        title: 'Inspect Execution Plan',
        explanation: 'Review the binary plan in human-readable formatting using terraform show.',
        command: 'terraform show tfplan',
        output: 'Terraform will perform the following actions:\n  # aws_db_instance.prod (forces replacement)\n  ~ engine_version = "14.1" -> "15.0" # force replacement'
      }
    ]
  }),
  createQuest({
    id: 'iac_ansible_inventory',
    title: 'Ansible Inventory Basics',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Create an Ansible inventory file mapping hosts and server groups.',
    skillOutcomes: [
      'Write INI inventory files.',
      'Group remote servers logically.',
      'Check active inventory targets.'
    ],
    commands: [
      {
        title: 'Create Inventory File',
        explanation: 'Ansible targets remote hosts defined in inventories, allowing ad-hoc commands or playbooks to configure groups.',
        command: 'echo "[web]\nweb1.internal ansible_host=10.0.1.10\n[db]\ndb1.internal ansible_host=10.0.1.20" > hosts',
        output: 'Wrote hosts.'
      },
      {
        title: 'List Inventory Hosts',
        explanation: 'Verify that the hosts are parsed correctly into their groups.',
        command: 'ansible-inventory -i hosts --list',
        output: '{\n  "web": { "hosts": ["web1.internal"] },\n  "db": { "hosts": ["db1.internal"] }\n}'
      }
    ]
  }),
  createQuest({
    id: 'iac_ansible_idempotency',
    title: 'Playbooks and Idempotency',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Write and dry-run an idempotent playbook that ensures Nginx packages are installed.',
    skillOutcomes: [
      'Write YAML playbook declarations.',
      'Understand play tasks and modules.',
      'Run dry-run validations with check-mode.'
    ],
    commands: [
      {
        title: 'Create Nginx Playbook',
        explanation: 'Idempotency means running the playbook multiple times results in the same state, making no changes if Nginx is already installed.',
        command: 'echo "---\n- name: Set up Nginx\n  hosts: web\n  tasks:\n    - name: Ensure nginx packages are installed\n      apt: name=nginx state=present" > site.yml',
        output: 'Wrote site.yml.'
      },
      {
        title: 'Dry Run Playbook',
        explanation: 'Check mode (--check) reports what modifications would happen without editing remote targets.',
        command: 'ansible-playbook -i hosts site.yml --check',
        output: 'PLAY [Set up Nginx] **************************************\nTASK [Ensure nginx packages are installed] ***************\nok: [web1.internal]\nPLAY RECAP ***********************************************\nweb1.internal : ok=1 changed=0 failed=0'
      }
    ]
  }),
  createQuest({
    id: 'iac_secret_handling',
    title: 'Secrets Handling in IaC',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Pass credentials safely using env variables instead of baking secrets into Git repositories.',
    skillOutcomes: [
      'Prevent commit history leaks.',
      'Use TF_VAR_ prefix variable injection.',
      'Decouple operational secrets from infrastructure definitions.'
    ],
    commands: [
      {
        title: 'Inject Secret Variables',
        explanation: 'Setting variable values via shell exports or env files keeps credentials out of the public code state.',
        command: 'echo "TF_VAR_db_password=supersecret" > secret.env',
        output: 'Wrote secret.env.'
      }
    ]
  }),
  createQuest({
    id: 'iac_capstone_drift_fix',
    title: 'Capstone: Detect and Fix Infrastructure Drift',
    tier: 'Capstone',
    difficulty: 'Advanced',
    objective: 'Detect out-of-band configuration changes and apply Terraform to align real resources back to codebase declarations.',
    prerequisites: [
      'iac_tf_lifecycle',
      'iac_tf_state_drift',
      'iac_tf_plan_review'
    ],
    skillOutcomes: [
      'Identify configuration drift via plans.',
      'Trigger state refreshes.',
      'Execute declarative adjustments safely to recover code alignment.'
    ],
    commands: [
      {
        title: 'Run Drift Check Plan',
        explanation: 'Plan compares live resource states (e.g. AWS changed manually) against codebase definitions.',
        command: 'terraform plan',
        output: 'Note: Objects have changed outside Terraform.\nTerraform will perform the following actions:\n  # aws_security_group.sg_web will be updated\n  ~ ingress = [ # manual SSH exposure drift detected!\n      - { port = 22, protocol = "tcp", cidr = "0.0.0.0/0" }\n    ]'
      },
      {
        title: 'Sync State Details',
        explanation: 'Refresh updates state files to accurately represent live resources before choosing modifications.',
        command: 'terraform refresh',
        output: 'aws_security_group.sg_web: Refreshing state... [id=sg-01ab]\nState updated.'
      },
      {
        title: 'Apply Remediation Rollout',
        explanation: 'Apply the configuration, deleting the manual out-of-band SSH exposure to match safe repository code.',
        command: 'terraform apply',
        output: 'aws_security_group.sg_web: Modifying...\naws_security_group.sg_web: Modifications complete.\nApply complete! Resources: 0 added, 1 changed, 0 destroyed.'
      }
    ]
  })
];

export const iacModule = createModule({
  id: 8,
  title: 'Infrastructure as Code',
  icon: 'layers',
  description: 'Provision, review, and repair infrastructure through declarative code.',
  detailedInfo: 'Infrastructure as Code makes environments repeatable, reviewable, and auditable.',
  outcomes: [
    'Review Terraform plans before apply.',
    'Understand state, drift, variables, modules, and providers.',
    'Use Ansible-style configuration automation concepts.',
    'Isolate out-of-band drift and secure pipeline secrets.'
  ],
  resources: [
    { name: 'Terraform Tutorials', url: 'https://developer.hashicorp.com/terraform/tutorials', free: true },
    { name: 'Ansible Getting Started', url: 'https://docs.ansible.com/ansible/latest/getting_started/', free: true }
  ],
  quests,
  quiz: createConceptQuiz('Infrastructure as Code', [
    {
      question: 'What does terraform init accomplish?',
      options: [
        'Downloads the necessary provider plugins and configures backend state files',
        'Deletes cloud resources',
        'Directly deploys VMs',
        'Generates Git credentials'
      ],
      answerIndex: 0,
      explanation: 'Init initializes working directories, download plugins, and loads configuration states.'
    },
    {
      question: 'Why is the Terraform state file critical?',
      options: [
        'It maps declared configurations to live resources in the cloud API',
        'It compiles code into executable binaries',
        'It contains your Git commit logs',
        'It runs on the cloud host directly'
      ],
      answerIndex: 0,
      explanation: 'Terraform utilizes state files to monitor metadata mapping resource addresses to live provider systems.'
    },
    {
      question: 'What is infrastructure drift?',
      options: [
        'When resources are modified manually outside of IaC declarations',
        'When cloud host servers physically move locations',
        'When git logs grow too large',
        'When the code compiler updates versions'
      ],
      answerIndex: 0,
      explanation: 'Drift occurs when changes (updates or exposure) bypass IaC tooling, making live settings mismatch codebase declarations.'
    },
    {
      question: 'Why configure state locking?',
      options: [
        'To prevent multiple pipeline runs from corrupting state simultaneously',
        'To encrypt passwords in Git',
        'To speed up download of images',
        'To restrict SSH login access'
      ],
      answerIndex: 0,
      explanation: 'Locking prevents parallel apply processes from writing to the state file at the same time, avoiding corruption.'
    },
    {
      question: 'In Ansible, what does inventory represent?',
      options: ['A definition file listing host groups and node addresses', 'A package installer', 'A YAML syntax guide', 'A list of docker images'],
      answerIndex: 0,
      explanation: 'Inventories define the managed host nodes and logical groups that Ansible targets during playbook execution.'
    },
    {
      question: 'What is configuration management idempotency?',
      options: [
        'Running the configuration multiple times leaves the system in the same target state without redundant changes',
        'Creating random resource backups',
        'Exposing ports dynamically',
        'Deleting target images after execution'
      ],
      answerIndex: 0,
      explanation: 'Idempotency guarantees that tasks check target state first, skipping execution if the node already meets requirements.'
    },
    {
      question: 'Why use -out with terraform plan?',
      options: [
        'To save the exact execution plan so it can be applied securely without race conditions',
        'To build local Dockerfiles',
        'To check syntax rules only',
        'To print outputs to screen'
      ],
      answerIndex: 0,
      explanation: 'Saving the plan guarantees that only the precise changes approved by reviewers are applied, blocking external API drifts during apply.'
    },
    {
      question: 'How should passwords and API tokens be fed to Terraform scripts?',
      options: [
        'Using environment variables or local secret managers, never committing them to repositories',
        'Written directly in main.tf variables',
        'Saved in public GitHub readmes',
        'Created randomly during build times'
      ],
      answerIndex: 0,
      explanation: 'Passwords must stay out of git histories, injected via environment variables (like TF_VAR_pwd) or vault lookups.'
    }
  ])
});
