export interface BenchmarkItem {
  id: string;
  title: string;
  description: string;
  type: 'Automated' | 'Manual';
  selected: boolean;
}

export interface BenchmarkSection {
  id: string;
  title: string;
  items: BenchmarkItem[];
}

export const benchmarkData: BenchmarkSection[] = [
  {
    id: 'section1',
    title: 'Section 1: Control Plane Components',
    items: [
      {
        id: '1.1.1',
        title: 'API server pod specification file permissions',
        description: 'Ensure that the API server pod specification file permissions are set to 600 or more restrictive',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.1.2',
        title: 'API server pod specification file ownership',
        description: 'Ensure that the API server pod specification file ownership is set to root:root',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.1.3',
        title: 'Controller manager pod specification file permissions',
        description: 'Ensure that the controller manager pod specification file permissions are set to 600 or more restrictive',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.1.4',
        title: 'Controller manager pod specification file ownership',
        description: 'Ensure that the controller manager pod specification file ownership is set to root:root',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.1.5',
        title: 'Scheduler pod specification file permissions',
        description: 'Ensure that the scheduler pod specification file permissions are set to 600 or more restrictive',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.1.6',
        title: 'Scheduler pod specification file ownership',
        description: 'Ensure that the scheduler pod specification file ownership is set to root:root',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.1.7',
        title: 'etcd pod specification file permissions',
        description: 'Ensure that the etcd pod specification file permissions are set to 600 or more restrictive',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.1.8',
        title: 'etcd pod specification file ownership',
        description: 'Ensure that the etcd pod specification file ownership is set to root:root',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.1.9',
        title: 'Container Network Interface file permissions',
        description: 'Ensure that the Container Network Interface file permissions are set to 600 or more restrictive',
        type: 'Manual',
        selected: false
      },
      {
        id: '1.1.10',
        title: 'Container Network Interface file ownership',
        description: 'Ensure that the Container Network Interface file ownership is set to root:root',
        type: 'Manual',
        selected: false
      },
      {
        id: '1.1.11',
        title: 'etcd data directory permissions',
        description: 'Ensure that the etcd data directory permissions are set to 700 or more restrictive',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.1.12',
        title: 'etcd data directory ownership',
        description: 'Ensure that the etcd data directory ownership is set to etcd:etcd',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.1.13',
        title: 'Default administrative credential file permissions',
        description: 'Ensure that the default administrative credential file permissions are set to 600',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.1.14',
        title: 'Default administrative credential file ownership',
        description: 'Ensure that the default administrative credential file ownership is set to root:root',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.1.15',
        title: 'scheduler.conf file permissions',
        description: 'Ensure that the scheduler.conf file permissions are set to 600 or more restrictive',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.1.16',
        title: 'scheduler.conf file ownership',
        description: 'Ensure that the scheduler.conf file ownership is set to root:root',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.1.17',
        title: 'controller-manager.conf file permissions',
        description: 'Ensure that the controller-manager.conf file permissions are set to 600 or more restrictive',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.1.18',
        title: 'controller-manager.conf file ownership',
        description: 'Ensure that the controller-manager.conf file ownership is set to root:root',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.1.19',
        title: 'Kubernetes PKI directory and file ownership',
        description: 'Ensure that the Kubernetes PKI directory and file ownership is set to root:root',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.1.20',
        title: 'Kubernetes PKI certificate file permissions',
        description: 'Ensure that the Kubernetes PKI certificate file permissions are set to 600 or more restrictive',
        type: 'Manual',
        selected: false
      },
      {
        id: '1.1.21',
        title: 'Kubernetes PKI key file permissions',
        description: 'Ensure that the Kubernetes PKI key file permissions are set to 600',
        type: 'Manual',
        selected: false
      },
      {
        id: '1.2.1',
        title: 'anonymous-auth argument',
        description: 'Ensure that the --anonymous-auth argument is set to false',
        type: 'Manual',
        selected: false
      },
      {
        id: '1.2.2',
        title: 'token-auth-file parameter',
        description: 'Ensure that the --token-auth-file parameter is not set',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.2.3',
        title: 'DenyServiceExternalIPs',
        description: 'Ensure that the DenyServiceExternalIPs is set',
        type: 'Manual',
        selected: false
      },
      {
        id: '1.2.4',
        title: 'kubelet-client-certificate and kubelet-client-key arguments',
        description: 'Ensure that the --kubelet-client-certificate and --kubelet-client-key arguments are set as appropriate',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.2.5',
        title: 'kubelet-certificate-authority argument',
        description: 'Ensure that the --kubelet-certificate-authority argument is set as appropriate',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.2.6',
        title: 'authorization-mode argument not AlwaysAllow',
        description: 'Ensure that the --authorization-mode argument is not set to AlwaysAllow',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.2.7',
        title: 'authorization-mode includes Node',
        description: 'Ensure that the --authorization-mode argument includes Node',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.2.8',
        title: 'authorization-mode includes RBAC',
        description: 'Ensure that the --authorization-mode argument includes RBAC',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.2.9',
        title: 'EventRateLimit admission control plugin',
        description: 'Ensure that the admission control plugin EventRateLimit is set',
        type: 'Manual',
        selected: false
      },
      {
        id: '1.2.10',
        title: 'AlwaysAdmit admission control plugin',
        description: 'Ensure that the admission control plugin AlwaysAdmit is not set',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.2.11',
        title: 'AlwaysPullImages admission control plugin',
        description: 'Ensure that the admission control plugin AlwaysPullImages is set',
        type: 'Manual',
        selected: false
      },
      {
        id: '1.2.12',
        title: 'ServiceAccount admission control plugin',
        description: 'Ensure that the admission control plugin ServiceAccount is set',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.2.13',
        title: 'NamespaceLifecycle admission control plugin',
        description: 'Ensure that the admission control plugin NamespaceLifecycle is set',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.2.14',
        title: 'NodeRestriction admission control plugin',
        description: 'Ensure that the admission control plugin NodeRestriction is set',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.2.15',
        title: 'profiling argument',
        description: 'Ensure that the --profiling argument is set to false',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.2.16',
        title: 'audit-log-path argument',
        description: 'Ensure that the --audit-log-path argument is set',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.2.17',
        title: 'audit-log-maxage argument',
        description: 'Ensure that the --audit-log-maxage argument is set to 30 or as appropriate',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.2.18',
        title: 'audit-log-maxbackup argument',
        description: 'Ensure that the --audit-log-maxbackup argument is set to 10 or as appropriate',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.2.19',
        title: 'audit-log-maxsize argument',
        description: 'Ensure that the --audit-log-maxsize argument is set to 100 or as appropriate',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.2.20',
        title: 'request-timeout argument',
        description: 'Ensure that the --request-timeout argument is set as appropriate',
        type: 'Manual',
        selected: false
      },
      {
        id: '1.2.21',
        title: 'service-account-lookup argument',
        description: 'Ensure that the --service-account-lookup argument is set to true',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.2.22',
        title: 'service-account-key-file argument',
        description: 'Ensure that the --service-account-key-file argument is set as appropriate',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.2.23',
        title: 'etcd-certfile and etcd-keyfile arguments',
        description: 'Ensure that the --etcd-certfile and --etcd-keyfile arguments are set as appropriate',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.2.24',
        title: 'tls-cert-file and tls-private-key-file arguments',
        description: 'Ensure that the --tls-cert-file and --tls-private-key-file arguments are set as appropriate',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.2.25',
        title: 'client-ca-file argument',
        description: 'Ensure that the --client-ca-file argument is set as appropriate',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.2.26',
        title: 'etcd-cafile argument',
        description: 'Ensure that the --etcd-cafile argument is set as appropriate',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.2.27',
        title: 'encryption-provider-config argument',
        description: 'Ensure that the --encryption-provider-config argument is set as appropriate',
        type: 'Manual',
        selected: false
      },
      {
        id: '1.2.28',
        title: 'Encryption providers configuration',
        description: 'Ensure that encryption providers are appropriately configured',
        type: 'Manual',
        selected: false
      },
      {
        id: '1.2.29',
        title: 'Strong Cryptographic Ciphers',
        description: 'Ensure that the API Server only makes use of Strong Cryptographic Ciphers',
        type: 'Manual',
        selected: false
      },
      {
        id: '1.3.1',
        title: 'terminated-pod-gc-threshold argument',
        description: 'Ensure that the --terminated-pod-gc-threshold argument is set as appropriate',
        type: 'Manual',
        selected: false
      },
      {
        id: '1.3.2',
        title: 'Controller Manager profiling argument',
        description: 'Ensure that the --profiling argument is set to false',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.3.3',
        title: 'use-service-account-credentials argument',
        description: 'Ensure that the --use-service-account-credentials argument is set to true',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.3.4',
        title: 'service-account-private-key-file argument',
        description: 'Ensure that the --service-account-private-key-file argument is set as appropriate',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.3.5',
        title: 'root-ca-file argument',
        description: 'Ensure that the --root-ca-file argument is set as appropriate',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.3.6',
        title: 'RotateKubeletServerCertificate argument',
        description: 'Ensure that the RotateKubeletServerCertificate argument is set to true',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.3.7',
        title: 'Controller Manager bind-address argument',
        description: 'Ensure that the --bind-address argument is set to 127.0.0.1',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.4.1',
        title: 'Scheduler profiling argument',
        description: 'Ensure that the --profiling argument is set to false',
        type: 'Automated',
        selected: false
      },
      {
        id: '1.4.2',
        title: 'Scheduler bind-address argument',
        description: 'Ensure that the --bind-address argument is set to 127.0.0.1',
        type: 'Automated',
        selected: false
      }
    ]
  },
  {
    id: 'section2',
    title: 'Section 2: etcd',
    items: [
      {
        id: '2.1',
        title: 'cert-file and key-file arguments',
        description: 'Ensure that the --cert-file and --key-file arguments are set as appropriate',
        type: 'Automated',
        selected: false
      },
      {
        id: '2.2',
        title: 'client-cert-auth argument',
        description: 'Ensure that the --client-cert-auth argument is set to true',
        type: 'Automated',
        selected: false
      },
      {
        id: '2.3',
        title: 'auto-tls argument',
        description: 'Ensure that the --auto-tls argument is not set to true',
        type: 'Automated',
        selected: false
      },
      {
        id: '2.4',
        title: 'peer-cert-file and peer-key-file arguments',
        description: 'Ensure that the --peer-cert-file and --peer-key-file arguments are set as appropriate',
        type: 'Automated',
        selected: false
      },
      {
        id: '2.5',
        title: 'peer-client-cert-auth argument',
        description: 'Ensure that the --peer-client-cert-auth argument is set to true',
        type: 'Automated',
        selected: false
      },
      {
        id: '2.6',
        title: 'peer-auto-tls argument',
        description: 'Ensure that the --peer-auto-tls argument is not set to true',
        type: 'Automated',
        selected: false
      },
      {
        id: '2.7',
        title: 'Unique Certificate Authority for etcd',
        description: 'Ensure that a unique Certificate Authority is used for etcd',
        type: 'Manual',
        selected: false
      }
    ]
  },
  {
    id: 'section3',
    title: 'Section 3: Control Plane Configuration',
    items: [
      {
        id: '3.1.1',
        title: 'Client certificate authentication',
        description: 'Client certificate authentication should not be used for users',
        type: 'Manual',
        selected: false
      },
      {
        id: '3.1.2',
        title: 'Service account token authentication',
        description: 'Service account token authentication should not be used for users',
        type: 'Manual',
        selected: false
      },
      {
        id: '3.1.3',
        title: 'Bootstrap token authentication',
        description: 'Bootstrap token authentication should not be used for users',
        type: 'Manual',
        selected: false
      },
      {
        id: '3.2.1',
        title: 'Minimal audit policy',
        description: 'Ensure that a minimal audit policy is created',
        type: 'Manual',
        selected: false
      },
      {
        id: '3.2.2',
        title: 'Audit policy security concerns',
        description: 'Ensure that the audit policy covers key security concerns',
        type: 'Manual',
        selected: false
      }
    ]
  },
  {
    id: 'section4',
    title: 'Section 4: Worker Nodes',
    items: [
      {
        id: '4.1.1',
        title: 'kubelet service file permissions',
        description: 'Ensure that the kubelet service file permissions are set to 600 or more restrictive',
        type: 'Automated',
        selected: false
      },
      {
        id: '4.1.2',
        title: 'kubelet service file ownership',
        description: 'Ensure that the kubelet service file ownership is set to root:root',
        type: 'Automated',
        selected: false
      },
      {
        id: '4.1.3',
        title: 'proxy kubeconfig file permissions',
        description: 'If proxy kubeconfig file exists ensure permissions are set to 600 or more restrictive',
        type: 'Manual',
        selected: false
      },
      {
        id: '4.1.4',
        title: 'proxy kubeconfig file ownership',
        description: 'If proxy kubeconfig file exists ensure ownership is set to root:root',
        type: 'Manual',
        selected: false
      },
      {
        id: '4.1.5',
        title: 'kubeconfig kubelet.conf file permissions',
        description: 'Ensure that the --kubeconfig kubelet.conf file permissions are set to 600 or more restrictive',
        type: 'Automated',
        selected: false
      },
      {
        id: '4.1.6',
        title: 'kubeconfig kubelet.conf file ownership',
        description: 'Ensure that the --kubeconfig kubelet.conf file ownership is set to root:root',
        type: 'Automated',
        selected: false
      },
      {
        id: '4.1.7',
        title: 'Certificate authorities file permissions',
        description: 'Ensure that the certificate authorities file permissions are set to 600 or more restrictive',
        type: 'Manual',
        selected: false
      },
      {
        id: '4.1.8',
        title: 'Client certificate authorities file ownership',
        description: 'Ensure that the client certificate authorities file ownership is set to root:root',
        type: 'Manual',
        selected: false
      },
      {
        id: '4.1.9',
        title: 'kubelet --config configuration file permissions',
        description: 'If the kubelet config.yaml configuration file is being used validate permissions set to 600 or more restrictive',
        type: 'Manual',
        selected: false
      },
      {
        id: '4.1.10',
        title: 'kubelet --config configuration file ownership',
        description: 'If the kubelet config.yaml configuration file is being used validate file ownership is set to root:root',
        type: 'Manual',
        selected: false
      },
      {
        id: '4.2.1',
        title: 'Kubelet anonymous-auth argument',
        description: 'Ensure that the --anonymous-auth argument is set to false',
        type: 'Automated',
        selected: false
      },
      {
        id: '4.2.2',
        title: 'Kubelet authorization-mode argument',
        description: 'Ensure that the --authorization-mode argument is not set to AlwaysAllow',
        type: 'Automated',
        selected: false
      },
      {
        id: '4.2.3',
        title: 'Kubelet client-ca-file argument',
        description: 'Ensure that the --client-ca-file argument is set as appropriate',
        type: 'Automated',
        selected: false
      },
      {
        id: '4.2.4',
        title: 'read-only-port argument',
        description: 'Verify that the --read-only-port argument is set to 0',
        type: 'Manual',
        selected: false
      },
      {
        id: '4.2.5',
        title: 'streaming-connection-idle-timeout argument',
        description: 'Ensure that the --streaming-connection-idle-timeout argument is not set to 0',
        type: 'Manual',
        selected: false
      },
      {
        id: '4.2.6',
        title: 'make-iptables-util-chains argument',
        description: 'Ensure that the --make-iptables-util-chains argument is set to true',
        type: 'Automated',
        selected: false
      },
      {
        id: '4.2.7',
        title: 'hostname-override argument',
        description: 'Ensure that the --hostname-override argument is not set',
        type: 'Manual',
        selected: false
      },
      {
        id: '4.2.8',
        title: 'eventRecordQPS argument',
        description: 'Ensure that the eventRecordQPS argument is set to a level which ensures appropriate event capture',
        type: 'Manual',
        selected: false
      },
      {
        id: '4.2.9',
        title: 'tls-cert-file and tls-private-key-file arguments',
        description: 'Ensure that the --tls-cert-file and --tls-private-key-file arguments are set as appropriate',
        type: 'Manual',
        selected: false
      },
      {
        id: '4.2.10',
        title: 'rotate-certificates argument',
        description: 'Ensure that the --rotate-certificates argument is not set to false',
        type: 'Automated',
        selected: false
      },
      {
        id: '4.2.11',
        title: 'RotateKubeletServerCertificate argument',
        description: 'Verify that the RotateKubeletServerCertificate argument is set to true',
        type: 'Manual',
        selected: false
      },
      {
        id: '4.2.12',
        title: 'Strong Cryptographic Ciphers',
        description: 'Ensure that the Kubelet only makes use of Strong Cryptographic Ciphers',
        type: 'Manual',
        selected: false
      },
      {
        id: '4.2.13',
        title: 'Pod PIDs limit',
        description: 'Ensure that a limit is set on pod PIDs',
        type: 'Manual',
        selected: false
      },
      {
        id: '4.3.1',
        title: 'kube-proxy metrics service',
        description: 'Ensure that the kube-proxy metrics service is bound to localhost',
        type: 'Automated',
        selected: false
      }
    ]
  },
  {
    id: 'section5',
    title: 'Section 5: Policies',
    items: [
      {
        id: '5.1.1',
        title: 'cluster-admin role usage',
        description: 'Ensure that the cluster-admin role is only used where required',
        type: 'Automated',
        selected: false
      },
      {
        id: '5.1.2',
        title: 'Minimize access to secrets',
        description: 'Minimize access to secrets',
        type: 'Automated',
        selected: false
      },
      {
        id: '5.1.3',
        title: 'Minimize wildcard use in Roles and ClusterRoles',
        description: 'Minimize wildcard use in Roles and ClusterRoles',
        type: 'Automated',
        selected: false
      },
      {
        id: '5.1.4',
        title: 'Minimize access to create pods',
        description: 'Minimize access to create pods',
        type: 'Automated',
        selected: false
      },
      {
        id: '5.1.5',
        title: 'Default service accounts usage',
        description: 'Ensure that default service accounts are not actively used',
        type: 'Automated',
        selected: false
      },
      {
        id: '5.1.6',
        title: 'Service Account Tokens mounting',
        description: 'Ensure that Service Account Tokens are only mounted where necessary',
        type: 'Automated',
        selected: false
      },
      {
        id: '5.1.7',
        title: 'system:masters group usage',
        description: 'Avoid use of system:masters group',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.1.8',
        title: 'Bind, Impersonate and Escalate permissions',
        description: 'Limit use of the Bind, Impersonate and Escalate permissions in the Kubernetes cluster',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.1.9',
        title: 'Minimize access to create persistent volumes',
        description: 'Minimize access to create persistent volumes',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.1.10',
        title: 'Minimize access to proxy sub-resource of nodes',
        description: 'Minimize access to the proxy sub-resource of nodes',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.1.11',
        title: 'Minimize access to approval sub-resource',
        description: 'Minimize access to the approval sub-resource of certificatesigningrequests objects',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.1.12',
        title: 'Minimize access to webhook configuration objects',
        description: 'Minimize access to webhook configuration objects',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.1.13',
        title: 'Minimize access to service account token creation',
        description: 'Minimize access to the service account token creation',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.2.1',
        title: 'Active policy control mechanism',
        description: 'Ensure that the cluster has at least one active policy control mechanism in place',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.2.2',
        title: 'Minimize admission of privileged containers',
        description: 'Minimize the admission of privileged containers',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.2.3',
        title: 'Minimize admission of containers sharing host process ID namespace',
        description: 'Minimize the admission of containers wishing to share the host process ID namespace',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.2.4',
        title: 'Minimize admission of containers sharing host IPC namespace',
        description: 'Minimize the admission of containers wishing to share the host IPC namespace',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.2.5',
        title: 'Minimize admission of containers sharing host network namespace',
        description: 'Minimize the admission of containers wishing to share the host network namespace',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.2.6',
        title: 'Minimize admission of containers with allowPrivilegeEscalation',
        description: 'Minimize the admission of containers with allowPrivilegeEscalation',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.2.7',
        title: 'Minimize admission of root containers',
        description: 'Minimize the admission of root containers',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.2.8',
        title: 'Minimize admission of containers with NET_RAW capability',
        description: 'Minimize the admission of containers with the NET_RAW capability',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.2.9',
        title: 'Minimize admission of containers with added capabilities',
        description: 'Minimize the admission of containers with added capabilities',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.2.10',
        title: 'Minimize admission of containers with capabilities assigned',
        description: 'Minimize the admission of containers with capabilities assigned',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.2.11',
        title: 'Minimize admission of Windows HostProcess Containers',
        description: 'Minimize the admission of Windows HostProcess Containers',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.2.12',
        title: 'Minimize admission of HostPath volumes',
        description: 'Minimize the admission of HostPath volumes',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.2.13',
        title: 'Minimize admission of containers using HostPorts',
        description: 'Minimize the admission of containers which use HostPorts',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.3.1',
        title: 'CNI supports Network Policies',
        description: 'Ensure that the CNI in use supports Network Policies',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.3.2',
        title: 'All Namespaces have Network Policies defined',
        description: 'Ensure that all Namespaces have Network Policies defined',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.4.1',
        title: 'Prefer secrets as files over environment variables',
        description: 'Prefer using secrets as files over secrets as environment variables',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.4.2',
        title: 'Consider external secret storage',
        description: 'Consider external secret storage',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.5.1',
        title: 'Configure Image Provenance using ImagePolicyWebhook',
        description: 'Configure Image Provenance using ImagePolicyWebhook admission controller',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.7.1',
        title: 'Create administrative boundaries using namespaces',
        description: 'Create administrative boundaries between resources using namespaces',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.7.2',
        title: 'Set seccomp profile to docker/default',
        description: 'Ensure that the seccomp profile is set to docker/default in your pod definitions',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.7.3',
        title: 'Apply Security Context to Pods and Containers',
        description: 'Apply Security Context to Your Pods and Containers',
        type: 'Manual',
        selected: false
      },
      {
        id: '5.7.4',
        title: 'Default namespace should not be used',
        description: 'The default namespace should not be used',
        type: 'Manual',
        selected: false
      }
    ]
  }
];
