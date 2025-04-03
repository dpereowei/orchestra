from flask import Flask, jsonify, render_template
from kubernetes_client import k8s_client

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/namespaces")
def list_namespaces():
    namespaces = k8s_client.list_namespace()
    return [ns.metadata.name for ns in namespaces.items]

@app.route("/api/pods/<namespace>")
def list_pods(namespace: str):
    pods = k8s_client.list_namespaced_pod(namespace)
    return [pod.metadata.name for pod in pods.items]

@app.route("/api/pods/containers/<namespace>/<pod>")
def list_containers(namespace: str, pod: str):
    """Fetch all containers within a specific pod."""
    try:
        pod_details = k8s_client.read_namespaced_pod(name=pod, namespace=namespace)
        return [container.name for container in pod_details.spec.containers]
    except Exception as e:
        return {"error": str(e)}
    
@app.route("/api/logs/<namespace>/<pod>/<container>")
def get_logs(namespace: str, pod: str, container: str = None, tail: int = 100):
    try:
        logs = k8s_client.read_namespaced_pod_log(
            name=pod, namespace=namespace, container=container, timestamps=True, tail_lines=tail
        )

        # Parse logs with timestamps
        log_entries = []
        for line in logs.split("\n"):
            if line.strip():
                parts = line.split(" ", 1)
                if len(parts) == 2:
                    timestamp, message = parts
                    log_entries.append({"timestamp": timestamp, "message": message})
                else:
                    log_entries.append({"timestamp": None, "message": line})  # Fallback if no timestamp

        return log_entries

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)