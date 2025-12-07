
import subprocess
import sys

def check_flag(output, flag):
    print(f"Checking for flag: {flag}")
    for line in output.strip().splitlines():
        if flag not in line:
            continue
        
        tokens = line.strip().split()
        for tok in tokens:
            if tok.startswith(flag + "="):
                value = tok.split("=", 1)[1]
                print(f"Found flag with value: {value}")
                return True, value
            if tok == flag:
                print("Found flag (boolean)")
                return True, "true"
    print("Flag not found")
    return False, None

def run_audit():
    cmd = "/bin/ps -ef | grep kube-apiserver | grep -v grep"
    print(f"Running command: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    print(f"Return code: {result.returncode}")
    print(f"Output length: {len(result.stdout)}")
    print(f"Output snippet: {result.stdout[:200]}...")
    
    return result.stdout

if __name__ == "__main__":
    output = run_audit()
    check_flag(output, "--kubelet-certificate-authority")
