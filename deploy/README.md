# Kube-Check Architecture & Deployment Guide

## 1. Architecture Overview (Cloud & Production Ready)

Để tích hợp Kube-check thành một service production-ready chạy trên Kubernetes (bao gồm cả Cloud như EKS, AKS, GKE hoặc On-premise), chúng ta sử dụng kiến trúc **DaemonSet Privileged**.

### Tại sao lại là DaemonSet?
- **DaemonSet** đảm bảo một Agent chạy trên **mỗi node** trong cluster.
- **Privileged Mode**: Container được cấp quyền `privileged: true` và mount các host path như `/etc/kubernetes`, `/var/lib/etcd`. Điều này cho phép ứng dụng truy cập và sửa đổi file cấu hình của host **mà không cần SSH hay mật khẩu sudo từng máy**.
- **HostPID**: Cho phép Agent chạy lệnh `ps` để kiểm tra các process đang chạy trên node host (như `kube-apiserver`).

## 2. Các thành phần

1.  **Agent (DaemonSet)**:
    -   Chạy backend logic (Python scripts).
    -   Thực hiện Scan & Remediate trực tiếp trên từng node.
    -   Giao tiếp với Dashboard trung tâm.
2.  **Dashboard (Deployment)**:
    -   Giao diện Web (ReactJS) để người dùng thao tác.
    -   Tổng hợp kết quả từ các Agent.

## 3. Deployment Steps

### Bước 1: Build Docker Images
Bạn cần đóng gói Backend và Frontend thành Docker images.

```bash
# Build Backend Agent
docker build -t your-registry/kube-check-agent:v1 -f Backend/Dockerfile .

# Build Frontend
docker build -t your-registry/kube-check-web:v1 -f Frontend/Dockerfile .
```

### Bước 2: Deploy lên Kubernetes
Sử dụng các file manifest trong thư mục `deploy/k8s/`:

```bash
# 1. Tạo Namespace và RBAC
kubectl apply -f deploy/k8s/01-rbac.yaml

# 2. Deploy Agent (DaemonSet) - Đây là phần quan trọng nhất để fix lỗi "cần mật khẩu"
kubectl apply -f deploy/k8s/02-daemonset.yaml

# 3. Deploy Web Interface
kubectl apply -f deploy/k8s/03-web.yaml
```

## 4. Giải quyết vấn đề "Cần mật khẩu cho từng máy"
Trong file `02-daemonset.yaml`, chúng ta sử dụng cấu hình sau để bypass authentication thủ công:

```yaml
securityContext:
  privileged: true
volumes:
  - name: etc-kubernetes
    hostPath:
      path: /etc/kubernetes
```

Khi container chạy với `privileged: true` và mount `/etc/kubernetes`, user `root` bên trong container chính là `root` của Host đối với thư mục đó. Do đó, script Python có thể :
- Đọc file `admin.conf`
- Sửa `manifests/*.yaml`
- Restart static pods
**Mà không cần lệnh `sudo` pass.**

## 5. Lưu ý cho Cloud (Managed K8s)
Trên các hệ thống Managed như AWS EKS hoặc Google GKE:
- **Master Node (Control Plane)** được quản lý bởi Cloud Provider. Bạn **không thể** scan hoặc sửa file trên Master node (ví dụ: `kube-apiserver` của EKS không nằm trong tầm kiểm soát của bạn).
- **Worker Node**: Bạn hoàn toàn có thể dùng kiến trúc trên để scan và harden các Worker Node.
- Với Managed K8s, trách nhiệm bảo mật Control Plane thuộc về nhà cung cấp (Shared Responsibility Model). Bạn chỉ cần tập trung vào Worker Nodes.
