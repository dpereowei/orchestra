from kubernetes import client, config

# Load Kubeconfig
def load_kube_client():
    try:
        config.load_incluster_config()  # If running inside Kubernetes
    except:
        config.load_kube_config()  # Local development

    return client.CoreV1Api()

k8s_client = load_kube_client()
