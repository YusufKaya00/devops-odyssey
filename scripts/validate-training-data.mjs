import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'src/data/training/types.ts',
  'src/data/training/helpers.ts',
  'src/data/training/index.ts',
  'src/data/training/git.ts',
  'src/data/training/programming.ts',
  'src/data/training/linux.ts',
  'src/data/training/networking.ts',
  'src/data/training/serverManagement.ts',
  'src/data/training/containers.ts',
  'src/data/training/kubernetes.ts',
  'src/data/training/iac.ts',
  'src/data/training/cicd.ts',
  'src/data/training/observability.ts',
  'src/data/training/cloud.ts',
  'src/data/training/softwarePractices.ts'
];

const missing = requiredFiles.filter(file => !fs.existsSync(path.join(root, file)));

if (missing.length > 0) {
  console.error('Missing training files:');
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

const typesSource = fs.readFileSync(path.join(root, 'src/data/training/types.ts'), 'utf8');
const requiredTypeNames = [
  'ScenarioTier',
  'ScenarioQuest',
  'ScenarioModule',
  'ScenarioStep',
  'ScenarioQuizQuestion',
  'CommandExpectation'
];

const missingTypes = requiredTypeNames.filter(name => !typesSource.includes(name));
if (missingTypes.length > 0) {
  console.error(`Missing training type exports: ${missingTypes.join(', ')}`);
  process.exit(1);
}

const helpersSource = fs.readFileSync(path.join(root, 'src/data/training/helpers.ts'), 'utf8');
for (const helper of ['createQuest', 'createConceptQuiz']) {
  if (!helpersSource.includes(helper)) {
    console.error(`Missing helper: ${helper}`);
    process.exit(1);
  }
}

const programmingSource = fs.readFileSync(path.join(root, 'src/data/training/programming.ts'), 'utf8');
const programmingQuestIds = [
  'prog_cli_exit_codes',
  'prog_log_parser',
  'prog_json_health_report',
  'prog_yaml_validator',
  'prog_http_retry_checker',
  'prog_config_drift',
  'prog_concurrent_checker',
  'prog_deploy_report',
  'prog_script_unit_tests',
  'prog_incident_triage_capstone'
];

const missingProgrammingQuests = programmingQuestIds.filter(id => !programmingSource.includes(id));
if (missingProgrammingQuests.length > 0) {
  console.error('Missing programming quests:');
  for (const id of missingProgrammingQuests) {
    console.error(`- ${id}`);
  }
  process.exit(1);
}

const programmingQuestionCount = (programmingSource.match(/question:/g) || []).length;
if (programmingQuestionCount < 8) {
  console.error(`Programming module needs at least 8 quiz questions, found ${programmingQuestionCount}.`);
  process.exit(1);
}

const linuxSource = fs.readFileSync(path.join(root, 'src/data/training/linux.ts'), 'utf8');
const linuxQuestIds = [
  'linux_paths_filesystem',
  'linux_permissions_deep',
  'linux_process_triage',
  'linux_disk_memory',
  'linux_text_pipeline',
  'linux_bash_strict_mode',
  'linux_cron_logs',
  'linux_systemd_unit',
  'linux_ssh_keys',
  'linux_backup_restore',
  'linux_failure_modes',
  'linux_service_capstone'
];

const missingLinuxQuests = linuxQuestIds.filter(id => !linuxSource.includes(id));
if (missingLinuxQuests.length > 0) {
  console.error('Missing Linux quests:');
  for (const id of missingLinuxQuests) {
    console.error(`- ${id}`);
  }
  process.exit(1);
}

const linuxQuestionCount = (linuxSource.match(/question:/g) || []).length;
if (linuxQuestionCount < 8) {
  console.error(`Linux module needs at least 8 quiz questions, found ${linuxQuestionCount}.`);
  process.exit(1);
}

const networkingSource = fs.readFileSync(path.join(root, 'src/data/training/networking.ts'), 'utf8');
const networkingQuestIds = [
  'net_osi_diagnostic_map',
  'net_dns_lookup',
  'net_http_headers',
  'net_tls_certificate',
  'net_ports_sockets',
  'net_firewall_rules',
  'net_cidr_subnets',
  'net_lb_health_checks',
  'net_dns_https_failure',
  'net_exposure_baseline',
  'net_service_path_capstone'
];

const missingNetworkingQuests = networkingQuestIds.filter(id => !networkingSource.includes(id));
if (missingNetworkingQuests.length > 0) {
  console.error('Missing networking quests:');
  for (const id of missingNetworkingQuests) {
    console.error(`- ${id}`);
  }
  process.exit(1);
}

const networkingQuestionCount = (networkingSource.match(/question:/g) || []).length;
if (networkingQuestionCount < 8) {
  console.error(`Networking module needs at least 8 quiz questions, found ${networkingQuestionCount}.`);
  process.exit(1);
}

const serverManagementSource = fs.readFileSync(path.join(root, 'src/data/training/serverManagement.ts'), 'utf8');
const serverManagementQuestIds = [
  'server_nginx_static',
  'server_reverse_proxy',
  'server_upstream_lb',
  'server_cache_compression',
  'server_log_reading',
  'server_reload_restart',
  'server_blue_green',
  'server_rate_limit_hardening',
  'server_cert_renewal',
  'server_proxy_capstone'
];

const missingServerManagementQuests = serverManagementQuestIds.filter(id => !serverManagementSource.includes(id));
if (missingServerManagementQuests.length > 0) {
  console.error('Missing server management quests:');
  for (const id of missingServerManagementQuests) {
    console.error(`- ${id}`);
  }
  process.exit(1);
}

const serverManagementQuestionCount = (serverManagementSource.match(/question:/g) || []).length;
if (serverManagementQuestionCount < 8) {
  console.error(`Server Management module needs at least 8 quiz questions, found ${serverManagementQuestionCount}.`);
  process.exit(1);
}

const containersSource = fs.readFileSync(path.join(root, 'src/data/training/containers.ts'), 'utf8');
const containersQuestIds = [
  'docker_run_inspect',
  'docker_layers_dockerfile',
  'docker_build_tag',
  'docker_env_config',
  'docker_volumes',
  'docker_networks',
  'docker_compose_stack',
  'docker_logs_exec',
  'docker_healthcheck',
  'docker_image_optimization',
  'docker_registry_mock',
  'docker_stack_capstone'
];

const missingContainersQuests = containersQuestIds.filter(id => !containersSource.includes(id));
if (missingContainersQuests.length > 0) {
  console.error('Missing containers quests:');
  for (const id of missingContainersQuests) {
    console.error(`- ${id}`);
  }
  process.exit(1);
}

const containersQuestionCount = (containersSource.match(/question:/g) || []).length;
if (containersQuestionCount < 8) {
  console.error(`Containers module needs at least 8 quiz questions, found ${containersQuestionCount}.`);
  process.exit(1);
}

const kubernetesSource = fs.readFileSync(path.join(root, 'src/data/training/kubernetes.ts'), 'utf8');
const kubernetesQuestIds = [
  'k8s_kubeconfig_cluster',
  'k8s_pods_describe_logs',
  'k8s_deployments_replicasets',
  'k8s_rollout_undo',
  'k8s_services_types',
  'k8s_configmaps_secrets',
  'k8s_resources_limits',
  'k8s_probes',
  'k8s_ingress',
  'k8s_pvc_storage',
  'k8s_jobs_cronjobs',
  'k8s_helm_release',
  'k8s_failure_modes',
  'k8s_capstone_rollout_recovery'
];

const missingKubernetesQuests = kubernetesQuestIds.filter(id => !kubernetesSource.includes(id));
if (missingKubernetesQuests.length > 0) {
  console.error('Missing Kubernetes quests:');
  for (const id of missingKubernetesQuests) {
    console.error(`- ${id}`);
  }
  process.exit(1);
}

const kubernetesQuestionCount = (kubernetesSource.match(/question:/g) || []).length;
if (kubernetesQuestionCount < 8) {
  console.error(`Kubernetes module needs at least 8 quiz questions, found ${kubernetesQuestionCount}.`);
  process.exit(1);
}

const iacSource = fs.readFileSync(path.join(root, 'src/data/training/iac.ts'), 'utf8');
const iacQuestIds = [
  'iac_tf_lifecycle',
  'iac_tf_variables_outputs',
  'iac_tf_state_drift',
  'iac_tf_providers_resources',
  'iac_tf_modules',
  'iac_tf_remote_backend',
  'iac_tf_import',
  'iac_tf_plan_review',
  'iac_ansible_inventory',
  'iac_ansible_idempotency',
  'iac_secret_handling',
  'iac_capstone_drift_fix'
];

const missingIacQuests = iacQuestIds.filter(id => !iacSource.includes(id));
if (missingIacQuests.length > 0) {
  console.error('Missing IaC quests:');
  for (const id of missingIacQuests) {
    console.error(`- ${id}`);
  }
  process.exit(1);
}

const iacQuestionCount = (iacSource.match(/question:/g) || []).length;
if (iacQuestionCount < 8) {
  console.error(`IaC module needs at least 8 quiz questions, found ${iacQuestionCount}.`);
  process.exit(1);
}

const cicdSource = fs.readFileSync(path.join(root, 'src/data/training/cicd.ts'), 'utf8');
const cicdQuestIds = [
  'cicd_pipeline_anatomy',
  'cicd_build_stage',
  'cicd_test_gate',
  'cicd_artifacts',
  'cicd_dependency_cache',
  'cicd_env_secrets',
  'cicd_matrix_jobs',
  'cicd_manual_approval',
  'cicd_staging_deploy',
  'cicd_rollback',
  'cicd_security_scan',
  'cicd_capstone_full_pipeline'
];

const missingCicdQuests = cicdQuestIds.filter(id => !cicdSource.includes(id));
if (missingCicdQuests.length > 0) {
  console.error('Missing CI/CD quests:');
  for (const id of missingCicdQuests) {
    console.error(`- ${id}`);
  }
  process.exit(1);
}

const cicdQuestionCount = (cicdSource.match(/question:/g) || []).length;
if (cicdQuestionCount < 8) {
  console.error(`CI/CD module needs at least 8 quiz questions, found ${cicdQuestionCount}.`);
  process.exit(1);
}

const observabilitySource = fs.readFileSync(path.join(root, 'src/data/training/observability.ts'), 'utf8');
const observabilityQuestIds = [
  'obs_signals_metrics_logs_traces',
  'obs_prometheus_scrape',
  'obs_promql_queries',
  'obs_alert_rule',
  'obs_grafana_dashboard',
  'obs_log_correlation',
  'obs_slo_error_budget',
  'obs_alert_routing',
  'obs_runbook',
  'obs_dashboard_improvement',
  'obs_capstone_error_investigation'
];

const missingObservabilityQuests = observabilityQuestIds.filter(id => !observabilitySource.includes(id));
if (missingObservabilityQuests.length > 0) {
  console.error('Missing Observability quests:');
  for (const id of missingObservabilityQuests) {
    console.error(`- ${id}`);
  }
  process.exit(1);
}

const observabilityQuestionCount = (observabilitySource.match(/question:/g) || []).length;
if (observabilityQuestionCount < 8) {
  console.error(`Observability module needs at least 8 quiz questions, found ${observabilityQuestionCount}.`);
  process.exit(1);
}

console.log('Training data scaffolding validation passed.');

