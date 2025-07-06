#!/usr/bin/env python3
"""
Utility functions for kube-bench-python
File-based approach - no Kubernetes API dependency
"""

import os
import sys
import logging
import subprocess
import time
from pathlib import Path
from typing import Dict, List, Any, Optional
from colorama import Fore, Back, Style, init

# Initialize colorama for cross-platform colored output
init(autoreset=True)

class Colors:
    """Color constants for console output"""
    PASS = Fore.GREEN
    FAIL = Fore.RED
    MANUAL = Fore.YELLOW
    ERROR = Fore.MAGENTA
    INFO = Fore.CYAN
    WARN = Fore.YELLOW
    RESET = Style.RESET_ALL
    BOLD = Style.BRIGHT

class Logger:
    """Simple logging utility"""
    
    def __init__(self, name: str, level: str = 'INFO'):
        self.logger = logging.getLogger(name)
        self.setup_logging(level)
    
    def setup_logging(self, level: str):
        """Setup logging with both file and console handlers"""
        log_level = getattr(logging, level.upper(), logging.INFO)
        
        # Clear existing handlers
        self.logger.handlers.clear()
        self.logger.setLevel(log_level)
        
        # Create formatters
        file_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        console_formatter = logging.Formatter(
            '%(levelname)s - %(message)s'
        )
        
        # File handler
        log_file = Path('logs') / 'kube-bench.log'
        log_file.parent.mkdir(exist_ok=True)
        
        file_handler = logging.FileHandler(log_file, mode='a')
        file_handler.setLevel(log_level)
        file_handler.setFormatter(file_formatter)
        
        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(log_level)
        console_handler.setFormatter(console_formatter)
        
        # Add handlers
        self.logger.addHandler(file_handler)
        self.logger.addHandler(console_handler)
    
    def debug(self, message: str):
        self.logger.debug(f"{Colors.INFO}{message}{Colors.RESET}")
    
    def info(self, message: str):
        self.logger.info(f"{Colors.INFO}{message}{Colors.RESET}")
    
    def warning(self, message: str):
        self.logger.warning(f"{Colors.WARN}{message}{Colors.RESET}")
    
    def error(self, message: str):
        self.logger.error(f"{Colors.ERROR}{message}{Colors.RESET}")
    
    def success(self, message: str):
        self.logger.info(f"{Colors.PASS}{message}{Colors.RESET}")

def format_duration(seconds: float) -> str:
    """Format duration in human-readable format"""
    if seconds < 1:
        return f"{seconds*1000:.0f}ms"
    elif seconds < 60:
        return f"{seconds:.1f}s"
    else:
        minutes = int(seconds // 60)
        remaining_seconds = seconds % 60
        return f"{minutes}m{remaining_seconds:.1f}s"

def create_progress_bar(current: int, total: int, width: int = 50) -> str:
    """Create a simple progress bar"""
    if total == 0:
        return "[" + "=" * width + "]"
    
    progress = current / total
    filled = int(width * progress)
    bar = "=" * filled + "-" * (width - filled)
    percentage = progress * 100
    
    return f"[{bar}] {percentage:.1f}% ({current}/{total})"

def safe_file_read(file_path: str, encoding: str = 'utf-8') -> Optional[str]:
    """Safely read file content with error handling"""
    try:
        with open(file_path, 'r', encoding=encoding) as f:
            return f.read()
    except (FileNotFoundError, PermissionError, UnicodeDecodeError):
        return None

def parse_key_value_pairs(text: str) -> Dict[str, str]:
    """Parse key=value pairs from text"""
    pairs = {}
    for line in text.split('\n'):
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            try:
                key, value = line.split('=', 1)
                pairs[key.strip()] = value.strip().strip('"\'')
            except ValueError:
                continue
    return pairs

def find_executable(name: str) -> Optional[str]:
    """Find executable in PATH"""
    try:
        result = subprocess.run(
            ['which', name] if os.name != 'nt' else ['where', name],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            return result.stdout.strip().split('\n')[0]
        return None
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return None

def validate_yaml_structure(data: Dict[str, Any], required_fields: List[str]) -> List[str]:
    """Validate YAML structure and return list of missing fields"""
    missing = []
    for field in required_fields:
        if field not in data:
            missing.append(field)
    return missing

class PerformanceTimer:
    """Simple performance timer context manager"""
    
    def __init__(self, name: str, logger: Optional[Logger] = None):
        self.name = name
        self.logger = logger
        self.start_time = None
        self.end_time = None
    
    def __enter__(self):
        self.start_time = time.time()
        if self.logger:
            self.logger.debug(f"Starting {self.name}")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end_time = time.time()
        duration = self.end_time - self.start_time
        if self.logger:
            self.logger.debug(f"Completed {self.name} in {format_duration(duration)}")
    
    @property
    def duration(self) -> Optional[float]:
        if self.start_time and self.end_time:
            return self.end_time - self.start_time
        return None
