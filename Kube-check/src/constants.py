"""
Constants for Kube-check
Centralized place for shared variables and configurations
"""

# Variable substitutions for different components
SUBSTITUTIONS = {
    'etcd': {
        '$etcdbin': 'etcd',
        '$etcdconf': '/etc/kubernetes/manifests/etcd.yaml',
        '$etcddatadir': '/var/lib/etcd'
    },
    'controlplane': {
        '$apiserverbin': 'kube-apiserver',
        '$apiserverconf': '/etc/kubernetes/manifests/kube-apiserver.yaml'
    },
    'master': {
        '$apiserverbin': 'kube-apiserver',
        '$apiserverconf': '/etc/kubernetes/manifests/kube-apiserver.yaml',
        '$controllermanagerbin': 'kube-controller-manager',
        '$controllermanagerconf': '/etc/kubernetes/manifests/kube-controller-manager.yaml',
        '$schedulerbin': 'kube-scheduler',
        '$schedulerconf': '/etc/kubernetes/manifests/kube-scheduler.yaml',
        '$schedulerkubeconfig': '/etc/kubernetes/scheduler.conf',
        '$controllermanagerkubeconfig': '/etc/kubernetes/controller-manager.conf',
        '$etcddatadir': '/var/lib/etcd',
        '$kubeletbin': 'kubelet',
        '$etcdconf': '/etc/kubernetes/manifests/etcd.yaml',
        '$etcdbin': 'etcd',
    },
    'node': {
        '$kubeletbin': 'kubelet',
        '$kubeletsvc': '/usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf',
        '$kubeletkubeconfig': '/etc/kubernetes/kubelet.conf',
        '$kubeletconf': '/var/lib/kubelet/config.yaml',
        '$kubeletcafile': '/etc/kubernetes/pki/ca.crt',
        '$proxybin': 'kube-proxy',
        '$proxykubeconfig': '/var/lib/kube-proxy/kubeconfig.conf',
        '$proxyconf': '/var/lib/kube-proxy/config.conf'
    },
    'policies': {
        # Policies typically use kubectl directly
    }
}

# Flattened substitutions for global use (like in main.py)
GLOBAL_SUBSTITUTIONS = {}
for component, subs in SUBSTITUTIONS.items():
    GLOBAL_SUBSTITUTIONS.update(subs)
