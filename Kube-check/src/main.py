#!/usr/bin/env python3
"""
Main entry point for kube-bench-python
Enhanced CLI interface compatible with kube-bench patterns
"""
from datetime import datetime, timedelta
import json
import yaml
import csv
import sys
import time
import signal
import pytz
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from io import StringIO

import click
from tabulate import tabulate

from jinja2 import Environment, FileSystemLoader
import pdfkit
from weasyprint import HTML, CSS
from parser import YAMLParser
from executor import CheckExecutor
from utils import Logger, Colors, format_duration, create_progress_bar

class KubeBenchPython:
    """Enhanced main application class with kube-bench compatibility"""
    
    # Class-level constants để tránh duplicate
    SUBSTITUTIONS = {
        '$apiserverconf': '/etc/kubernetes/manifests/kube-apiserver.yaml',
        '$controllermanagerconf': '/etc/kubernetes/manifests/kube-controller-manager.yaml',
        '$schedulerconf': '/etc/kubernetes/manifests/kube-scheduler.yaml',
        '$etcdconf': '/etc/kubernetes/manifests/etcd.yaml',
        '$apiserverbin': 'kube-apiserver',
        '$controllermanagerbin': 'kube-controller-manager',
        '$schedulerbin': 'kube-scheduler',
        '$etcdbin': 'etcd',
        '$kubeletbin': 'kubelet',
        '$etcddatadir': '/var/lib/etcd',
        '$schedulerkubeconfig': '/etc/kubernetes/scheduler.conf',
        '$controllermanagerkubeconfig': '/etc/kubernetes/controller-manager.conf',
        '$kubeletbin': 'kubelet',
        '$kubeletsvc': '/usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf',
        '$kubeletkubeconfig': '/etc/kubernetes/kubelet.conf',
        '$kubeletconf': '/var/lib/kubelet/config.yaml',
        '$kubeletcafile': '/etc/kubernetes/pki/ca.crt',
        '$proxybin': 'kube-proxy',
        '$proxykubeconfig': '/var/lib/kube-proxy/kubeconfig.conf',
        '$proxyconf': '/var/lib/kube-proxy/config.conf'
    }
    
    SECTION_HEADERS = {
        'master': '1 Control Plane Security Configuration',
        'etcd': '2 etcd',
        'controlplane': '3 Control Plane Configuration',
        'node': '4 Worker Nodes',
        'policies': '5 Kubernetes Policies'
    }
    
    def __init__(self, config_path: str, log_level: str = 'INFO', no_color: bool = False, enable_file_logging: bool = False):
        self.logger = Logger(__name__, log_level, enable_file_logging)
        self.no_color = no_color
        self.start_time = time.time()
        self.interrupted = False
        
        # Config file mapping for auto-detection
        self.config_mapping = {
            '1.1': 'config/master.yaml',
            '1.2': 'config/master.yaml',
            '1.3': 'config/master.yaml',
            '1.4': 'config/master.yaml',
            '2.': 'config/etcd.yaml',
            '3.': 'config/controlplane.yaml',
            '4.': 'config/node.yaml',
            '5.': 'config/policies.yaml'
        }
        
        # Setup signal handlers
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        
        try:
            self.parser = YAMLParser(config_path)
            self.executor = CheckExecutor(self.parser.config)
            self.results = []
            
            self.logger.success("KubeBench Python initialized successfully (file-based mode)")
            
            # Show benchmark info
            benchmark_info = self.parser.get_benchmark_info()
            self.logger.info(f"Target Kubernetes version: {benchmark_info['target_version']}")
            self.logger.info(f"CIS Benchmark version: {benchmark_info['cis_version']}")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize KubeBench: {e}")
            sys.exit(1)

    def _get_vietnam_timestamp(self) -> str:
        """Get current timestamp in Vietnam timezone - centralized method"""
        try:
            vietnam_tz = pytz.timezone('Asia/Ho_Chi_Minh')
            return datetime.now(vietnam_tz).strftime("%Y-%m-%d %H:%M:%S %Z")
        except Exception:
            utc_now = datetime.utcnow()
            vietnam_time = utc_now + timedelta(hours=7)
            return vietnam_time.strftime("%Y-%m-%d %H:%M:%S ICT")
    
    def _apply_substitutions(self, text: str) -> str:
        """Apply variable substitutions to text - centralized method"""
        for var, value in self.SUBSTITUTIONS.items():
            text = text.replace(var, value)
        return text.replace('\n', ' ').strip()
    
    def _format_report_lines(self, include_passed: bool = True, include_manual: bool = True, 
                           show_remediation: bool = True) -> Tuple[List[str], List[Dict]]:
        """Centralized report line formatting - eliminates duplicate logic"""
        report_lines = []
        remediation_data = []
        
        if not self.results:
            self.logger.warning("No results found. Did you run checks first?")
            return report_lines, remediation_data
        
        # Group by component type
        grouped_by_component = {}
        for group in self.results:
            component_type = group.get('component_type', 'unknown')
            if component_type not in grouped_by_component:
                grouped_by_component[component_type] = []
            grouped_by_component[component_type].append(group)
        
        # Process each component in order
        component_order = ['master', 'etcd', 'controlplane', 'node', 'policies']
        for component_type in component_order:
            if component_type not in grouped_by_component:
                continue
                
            groups = grouped_by_component[component_type]
            
            # Add section header
            if component_type in self.SECTION_HEADERS:
                report_lines.append(f"[INFO] {self.SECTION_HEADERS[component_type]}")
            
            # Process groups within component
            for group in groups:
                group_id = group.get('group_id', 'Unknown')
                group_text = group.get('group_text', 'Unknown Group')
                report_lines.append(f"[INFO] {group_id} {group_text}")
                
                # Process checks within group
                for ck in group.get('checks', []):
                    status = self._get_check_status(ck)
                    
                    # Apply filters
                    if not include_passed and status == "PASS":
                        continue
                    if not include_manual and status == "WARN":
                        continue
                    
                    # Add check line
                    check_id = ck.get('id', 'unknown')
                    check_text = ck.get('text', 'No description')
                    report_lines.append(f"[{status}] {check_id} {check_text}")
                    
                    # ← SỬA: Collect remediation data cho cả FAIL VÀ WARN
                    if status in ["FAIL", "WARN"] and ck.get("remediation") and show_remediation:
                        remediation_text = self._apply_substitutions(ck['remediation'])
                        remediation_data.append({
                            'id': check_id,
                            'text': remediation_text,
                            'status': status  # Thêm status để phân biệt
                        })
        
        return report_lines, remediation_data
    
    def _generate_total_summary(self) -> List[str]:
        """Generate total summary lines - centralized calculation"""
        agg = self._aggregate_component_stats()
        summary_lines = []
        
        if not agg:
            return summary_lines
        
        # Individual component summaries
        for component_type in ['master', 'etcd', 'controlplane', 'node', 'policies']:
            if component_type not in agg:
                continue
            st = agg[component_type]
            comp_name = self.SECTION_HEADERS.get(component_type, component_type.title())
            summary_lines.append(f"== Summary {comp_name} ==")
            summary_lines.append(f"{st['pass']} checks PASS")
            summary_lines.append(f"{st['fail']} checks FAIL")
            summary_lines.append(f"{st['warn']} checks WARN")
            summary_lines.append(f"{st['info']} checks INFO")
        
        # Calculate totals
        total_pass = sum(st['pass'] for st in agg.values())
        total_fail = sum(st['fail'] for st in agg.values())
        total_warn = sum(st['warn'] for st in agg.values())
        total_info = sum(st['info'] for st in agg.values())
        total_checks = total_pass + total_fail + total_warn + total_info
        
        # Add total summary
        summary_lines.append("== Summary Total ==")
        summary_lines.append(f"{total_pass} checks PASS")
        summary_lines.append(f"{total_fail} checks FAIL")
        summary_lines.append(f"{total_warn} checks WARN")
        summary_lines.append(f"{total_info} checks INFO")
        
        # Add compliance metrics
        if total_checks > 0:
            compliance_rate = round((total_pass / total_checks) * 100, 1)
            summary_lines.append(f"Total: {total_checks} checks")
            summary_lines.append(f"Compliance Rate: {compliance_rate}%")
            
            # Risk assessment
            if compliance_rate >= 90:
                risk_level = "LOW"
            elif compliance_rate >= 70:
                risk_level = "MEDIUM"
            else:
                risk_level = "HIGH"
            summary_lines.append(f"Risk Level: {risk_level}")
        
        return summary_lines
    
    def _generate_output(self, report_lines: List[str], remediation_data: List[Dict], 
                        output_format: str, output_file: Optional[str]) -> bool:
        """Centralized output generation - eliminates duplicate output logic"""
        current_time = self._get_vietnam_timestamp()
        
        if output_format == 'text':
            if output_file:
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write('\n'.join(report_lines))
                self.logger.success(f"Text report generated: {output_file}")
            else:
                print('\n'.join(report_lines))
            return True
        
        elif output_format == 'html':
            try:
                env = Environment(loader=FileSystemLoader('templates'))
                tpl = env.get_template('report.html.j2')
                
                html = tpl.render(
                    report_lines=report_lines,
                    remediation_data=remediation_data,
                    timestamp=current_time
                )
                
                out = output_file or "report.html"
                Path(out).parent.mkdir(parents=True, exist_ok=True)
                with open(out, 'w', encoding='utf-8') as f:
                    f.write(html)
                self.logger.success(f"HTML report generated: {out}")
                return True
                
            except Exception as e:
                self.logger.error(f"Failed to generate HTML report: {e}")
                return False
        
        elif output_format == 'pdf':
            try:
                env = Environment(loader=FileSystemLoader('templates'))
                tpl = env.get_template('report_pdf.html.j2')
                
                html = tpl.render(
                    report_lines=report_lines,
                    remediation_data=remediation_data,
                    timestamp=current_time
                )
                
                out = output_file or "report.pdf"
                Path(out).parent.mkdir(parents=True, exist_ok=True)
                
                HTML(string=html).write_pdf(
                    out,
                    stylesheets=[CSS(string='''
                        @page { 
                            size: A4; 
                            margin: 1.5cm; 
                        }
                        @media print {
                            * { 
                                -webkit-print-color-adjust: exact !important;
                                color-adjust: exact !important;
                            }
                        }
                    ''')]
                )
                
                self.logger.success(f"PDF report generated: {out}")
                return True
                
            except ImportError:
                self.logger.error("WeasyPrint not installed. Run: pip install weasyprint")
                return False
            except Exception as e:
                self.logger.error(f"PDF generation failed: {e}")
                return False
        
        else:
            self.logger.error(f"Unsupported output format: {output_format}")
            return False

    def map_checks_to_configs(self, check_ids: List[str]) -> Dict[str, List[str]]:
        """Map check IDs to their corresponding config files"""
        config_checks = {}
        
        for check_id in check_ids:
            config_file = None
            
            # Find matching config file based on check ID prefix
            for prefix, config in self.config_mapping.items():
                if check_id.startswith(prefix):
                    config_file = config
                    break
            
            if not config_file:
                self.logger.warning(f"No config mapping found for check {check_id}, using master.yaml as default")
                config_file = 'config/master.yaml'
            
            if config_file not in config_checks:
                config_checks[config_file] = []
            config_checks[config_file].append(check_id)
        
        return config_checks

    def execute_auto_remediation_for_failed_checks(self, dry_run: bool = False, 
                                                  require_confirmation: bool = True) -> Dict[str, Any]:
        """Execute auto remediation for all failed checks that have auto remediation available"""
        remediation_results = {
            'total_checks': 0,
            'remediation_available': 0,
            'remediation_executed': 0,
            'remediation_successful': 0,
            'remediation_failed': 0,
            'results': []
        }
        
        if not self.results:
            self.logger.warning("No results found. Did you run checks first?")
            return remediation_results
        
        # Find all failed checks with auto remediation
        for group in self.results:
            for check in group.get('checks', []):
                status = self._get_check_status(check)
                self.logger.debug(f"Check {check.get('id')}: status={status}, has_auto_remediation={bool(check.get('auto_remediation'))}")
                
                if status in ['FAIL', 'WARN'] and check.get('auto_remediation'):
                    remediation_results['total_checks'] += 1
                    remediation_results['remediation_available'] += 1
                    
                    # Execute auto remediation
                    result = self.executor.execute_auto_remediation(
                        check, 
                        dry_run=dry_run,
                        require_confirmation=require_confirmation
                    )
                    
                    remediation_results['results'].append({
                        'check_id': check.get('id'),
                        'check_text': check.get('text'),
                        'status': status,
                        'remediation_result': result
                    })
                    
                    if result.get('executed', False):
                        remediation_results['remediation_executed'] += 1
                        if result.get('success', False):
                            remediation_results['remediation_successful'] += 1
                        else:
                            remediation_results['remediation_failed'] += 1
        
        return remediation_results

    def run_multiple_configs_with_report(self, check_ids: List[str], output_format: str = 'text', 
                                        output_file: Optional[str] = None, **kwargs) -> bool:
        """Simplified version using centralized methods"""
        if not check_ids:
            self.logger.error("No check IDs provided")
            return False
        
        # Map checks to config files
        config_checks = self.map_checks_to_configs(check_ids)
        self.logger.info(f"Running {len(check_ids)} checks across {len(config_checks)} config files")
        
        # Track sections and collect results
        accumulated_results = []
        all_success = True
        
        # Process each config file
        for config_file, specific_checks in config_checks.items():
            if not Path(config_file).exists():
                self.logger.error(f"Config file not found: {config_file}")
                all_success = False
                continue
            
            # Load and execute checks
            try:
                checks_data = self.parser.load_checks(config_file)
                backup_results = self.results.copy()
                
                success = self.run_checks(
                    config_file,
                    component_filter=None,
                    progress=kwargs.get('progress', True),
                    targets=kwargs.get('targets', None),
                    specific_checks=specific_checks
                )
                
                if success:
                    # Collect new results
                    config_results = [group for group in self.results if group not in backup_results]
                    accumulated_results.extend(config_results)
                else:
                    all_success = False
                    self.results = backup_results
                    
            except Exception as e:
                self.logger.error(f"Failed to process {config_file}: {e}")
                all_success = False
                continue
        
        # Set final results
        self.results = accumulated_results
        
        # Generate report using centralized methods
        report_lines, remediation_data = self._format_report_lines(
            include_passed=kwargs.get('include_passed', True),
            include_manual=kwargs.get('include_manual', True),
            show_remediation=kwargs.get('show_remediation', True)
        )
        
        # ← SỬA: Add remediation section với status indicator
        if remediation_data:
            report_lines.append("== Remediations ==")
            for rem in remediation_data:
                # Thêm status indicator để phân biệt FAIL vs WARN
                status_indicator = f" ({rem.get('status', 'UNKNOWN')})" if rem.get('status') else ""
                report_lines.append(f"{rem['id']}{status_indicator} {rem['text']}")
        
        # Add summary
        summary_lines = self._generate_total_summary()
        report_lines.extend(summary_lines)
        
        # Generate output
        return self._generate_output(report_lines, remediation_data, output_format, output_file)
    
    def _signal_handler(self, signum, frame):
        """Handle interrupt signals gracefully"""
        self.interrupted = True
        self.logger.warning("Received interrupt signal, cleaning up...")
        self.executor.cleanup()
        sys.exit(130)
    
    def run_checks(self, check_file: str, component_filter: Optional[str] = None, 
                progress: bool = True, targets: Optional[List[str]] = None,
                specific_checks: Optional[List[str]] = None) -> bool:
        """Enhanced check execution with targets support (like kube-bench)"""
        if self.interrupted:
            return False
            
        self.logger.info(f"Starting security checks from: {check_file}")
        
        # Load checks with proper error handling
        try:
            checks_data = self.parser.load_checks(check_file)
        except FileNotFoundError:
            self.logger.error(f"Check file not found: {check_file}")
            return False
        except yaml.YAMLError as e:
            self.logger.error(f"Invalid YAML format in {check_file}: {e}")
            return False
        except PermissionError:
            self.logger.error(f"Permission denied reading {check_file}")
            return False
        except Exception as e:
            self.logger.error(f"Failed to load checks from {check_file}: {e}")
            return False
        
        if not checks_data:
            self.logger.error("No checks loaded - exiting")
            return False
        
        component_type = checks_data.get('type', 'etcd')
        
        # Apply component filter if specified
        if component_filter and component_type != component_filter:
            self.logger.info(f"Skipping {component_type} checks due to filter: {component_filter}")
            return True
        
        # Apply targets filter if specified (like kube-bench --targets)
        if targets and component_type not in targets:
            self.logger.info(f"Skipping {component_type} checks due to targets filter: {targets}")
            return True
        
        # Show check statistics with error handling
        try:
            stats = self.parser.get_check_statistics(checks_data)
            self.logger.info(f"Running checks for: {checks_data.get('text', 'Unknown')} (Type: {component_type})")
            
            if specific_checks:
                self.logger.info(f"Filtering for specific checks: {', '.join(specific_checks)}")
                self.logger.info(f"Total: {len(specific_checks)} specific checks requested")
            else:
                self.logger.info(f"Total: {stats['total_checks']} checks ({stats['automated_checks']} automated, {stats['manual_checks']} manual)")
        except Exception as e:
            self.logger.warning(f"Failed to get check statistics: {e}")
            stats = {'total_checks': 0, 'automated_checks': 0, 'manual_checks': 0}
        
        # Get component config from files with proper error handling
        file_config = {}
        try:
            file_config = self.executor.get_component_config_from_files(component_type)
            if file_config:
                self.logger.info(f"Read {component_type} config from files: {len(file_config)} parameters")
            else:
                self.logger.warning(f"No {component_type} config found in files")
        except FileNotFoundError:
            self.logger.warning(f"Config files for {component_type} not found")
        except PermissionError:
            self.logger.warning(f"Permission denied reading {component_type} config files")
        except Exception as e:
            self.logger.warning(f"Failed to read {component_type} config from files: {e}")
        
        # Process groups with enhanced progress tracking
        total_groups = len(checks_data.get('groups', []))
        
        # Calculate total checks (filtered if specific_checks provided)
        if specific_checks:
            total_checks = self._count_specific_checks(checks_data, specific_checks)
        else:
            total_checks = stats['total_checks']
        
        current_check = 0
        
        self.logger.info(f"Processing {total_groups} groups with {total_checks} total checks")
        
        # Main execution loop with comprehensive error handling
        for group_idx, group in enumerate(checks_data.get('groups', []), 1):
            if self.interrupted:
                self.logger.info("Execution interrupted by user")
                break
                
            group_name = group.get('text', 'Unknown Group')
            group_id = group.get('id', f'group_{group_idx}')
            
            try:
                self.logger.info(f"Processing group {group_idx}/{total_groups}: {group_id} - {group_name}")
                
                group_results = {
                    'group_id': group_id,
                    'group_text': group_name,
                    'checks': [],
                    'component_type': component_type,
                    'file_config_available': bool(file_config),
                    'group_start_time': time.time()
                }
                
                checks = group.get('checks', [])
                
                for check_idx, check in enumerate(checks, 1):
                    if self.interrupted:
                        self.logger.info("Check execution interrupted by user")
                        break

                    check_id = check.get('id', 'unknown')
                    check_text = check.get('text', 'No description')
                    
                    # Skip check if specific_checks provided and this check not in list
                    if specific_checks and str(check_id).strip() not in specific_checks:
                        continue
                    
                    current_check += 1
                
                    try:
                        # Progress bar
                        if progress and not self.logger.logger.isEnabledFor(10):
                            try:
                                progress_bar = create_progress_bar(current_check, total_checks)
                                print(f"{progress_bar}", flush=True)
                            except (BrokenPipeError, OSError):
                                pass
                            except Exception as e:
                                self.logger.debug(f"Failed to display progress bar: {e}")
                        
                        # Parse check
                        try:
                            parsed_check = self.parser.parse_check(check)
                        except KeyError as e:
                            raise ValueError(f"Missing required field in check definition: {e}")
                        except Exception as e:
                            raise ValueError(f"Failed to parse check definition: {e}")
                        
                        # Execute check
                        try:
                            result = self.executor.execute_check(parsed_check, component_type)
                            
                            # Add auto_remediation info to result
                            if parsed_check.get('auto_remediation'):
                                result['auto_remediation'] = parsed_check['auto_remediation']
                            
                            group_results['checks'].append(result)
                            
                            # Print result
                            status = self._get_check_status(result)
                            color = self._get_status_color(status)
                            
                            try:
                                if not self.no_color:
                                    print(f"[{color}{status}{Colors.RESET}] {check_id} {check_text}", flush=True)
                                else:
                                    print(f"[{status}] {check_id} {check_text}", flush=True)
                            except (BrokenPipeError, OSError):
                                pass
                            
                        except Exception as e:
                            error_msg = f"Check execution failed: {e}"
                            self.logger.error(f"Check {check_id} failed: {error_msg}")
                            self._add_failed_check_result(group_results, check, error_msg)
                            self._print_failed_check(check_id, check_text, error_msg)
                            
                    except Exception as e:
                        error_msg = f"Unexpected error: {e}"
                        self.logger.error(f"Unexpected error in check {check_id}: {error_msg}")
                        self._add_failed_check_result(group_results, check, error_msg)
                        self._print_failed_check(check_id, check_text, error_msg)
                
                # Only add group results if it has checks (after filtering)
                if group_results['checks']:
                    # Calculate group statistics with error handling
                    try:
                        group_results['group_execution_time'] = round(time.time() - group_results['group_start_time'], 3)
                        group_results['group_stats'] = self._calculate_group_stats(group_results['checks'])
                    except Exception as e:
                        self.logger.warning(f"Failed to calculate group statistics: {e}")
                        group_results['group_execution_time'] = 0
                        group_results['group_stats'] = {'total': 0, 'pass': 0, 'fail': 0, 'warn': 0, 'info': 0}
                    
                    self.results.append(group_results)
                    
            except Exception as e:
                self.logger.error(f"Failed to process group {group_id}: {e}")
                continue
        
        # Final cleanup and summary
        try:
            execution_time = time.time() - self.start_time
            if not self.interrupted:
                self.logger.success(f"Completed all checks in {format_duration(execution_time)}")
            else:
                self.logger.warning(f"Execution interrupted after {format_duration(execution_time)}")
        except Exception as e:
            self.logger.error(f"Failed to calculate execution time: {e}")
        
        return not self.interrupted

    def generate_report(self, output_format: str = 'text', output_file: Optional[str] = None,
                       include_passed: bool = True, include_manual: bool = True,
                       show_remediation: bool = True, kube_bench_style: bool = True) -> bool:
        """Simplified version using centralized methods"""
        self.logger.info(f"Generating report in {output_format} format")
        
        try:
            # Generate report using centralized method
            report_lines, remediation_data = self._format_report_lines(
                include_passed=include_passed,
                include_manual=include_manual,
                show_remediation=show_remediation
            )
            
            # ← SỬA: Add remediation section với status indicator
            if show_remediation and remediation_data:
                report_lines.append("== Remediations ==")
                for rem in remediation_data:
                    # Thêm status indicator để phân biệt FAIL vs WARN
                    status_indicator = f" ({rem.get('status', 'UNKNOWN')})" if rem.get('status') else ""
                    report_lines.append(f"{rem['id']}{status_indicator} {rem['text']}")
            
            # Add summary
            summary_lines = self._generate_total_summary()
            report_lines.extend(summary_lines)
            
            # Generate output using centralized method
            return self._generate_output(report_lines, remediation_data, output_format, output_file)
            
        except Exception as e:
            self.logger.error(f"Failed to generate report: {e}")
            import traceback
            self.logger.debug(f"Traceback: {traceback.format_exc()}")
            return False

    def _add_failed_check_result(self, group_results: Dict, check: Dict, error_msg: str):
        """Helper method to add failed check result"""
        try:
            result = {
                'id': check.get('id', 'unknown'),
                'text': check.get('text', 'No description'),
                'passed': False,
                'scored': check.get('scored', True),
                'test_results': [],
                'error': error_msg,
                'type': 'error'
            }
            
            # Add auto_remediation if available
            if check.get('auto_remediation'):
                result['auto_remediation'] = check['auto_remediation']
            
            group_results['checks'].append(result)
        except Exception as e:
            self.logger.error(f"Failed to add failed check result: {e}")

    def _print_failed_check(self, check_id: str, check_text: str, error_msg: str):
        """Helper method to print failed check with error handling"""
        try:
            if not self.no_color:
                print(f"[{Colors.FAIL}FAIL{Colors.RESET}] {check_id} {check_text} - Error: {error_msg}", flush=True)
            else:
                print(f"[FAIL] {check_id} {check_text} - Error: {error_msg}", flush=True)
        except (BrokenPipeError, OSError):
            pass
        except Exception as e:
            self.logger.error(f"Failed to print failed check: {e}")
    
    def _get_check_status(self, result: Dict[str, Any]) -> str:
        """Get human-readable status for a check result with scored logic"""
        scored = result.get('scored', True)  # ← Lấy scored từ result
        passed = result.get('passed')
        check_type = result.get('type', 'automated')
        
        # Manual checks always WARN
        if check_type == 'manual':
            return "WARN"
        
        # Error checks always FAIL
        if result.get('error'):
            return "FAIL"
        
        # ← LOGIC SCORED CHÍNH Ở ĐÂY
        if scored is False:
            # Non-scored checks: fail → WARN
            if passed is False:
                return "WARN"  # scored=false + fail = WARN
            elif passed is True:
                return "PASS"
            else:
                return "WARN"  # For None/unknown
        else:
            # Scored checks: normal logic
            if passed is True:
                return "PASS"
            elif passed is False:
                return "FAIL"  # scored=true + fail = FAIL
            elif passed is None:
                return "WARN"
            else:
                return "WARN"
    
    def _get_status_color(self, status: str) -> str:
        """Get color for status (kube-bench style)"""
        color_map = {
            'PASS': Colors.PASS,
            'FAIL': Colors.FAIL,
            'WARN': Colors.MANUAL,
            'INFO': Colors.INFO
        }
        return color_map.get(status, Colors.RESET)
    
    def _calculate_group_stats(self, checks: List[Dict[str, Any]]) -> Dict[str, int]:
        """Calculate statistics for a group of checks"""
        stats = {
            'total': len(checks),
            'pass': 0,
            'fail': 0,
            'warn': 0,
            'info': 0
        }
        
        for check in checks:
            status = self._get_check_status(check)
            if status == 'PASS':
                stats['pass'] += 1
            elif status == 'FAIL':
                stats['fail'] += 1
            elif status == 'WARN':
                stats['warn'] += 1
            elif status == 'INFO':
                stats['info'] += 1
        
        return stats
    
    def _count_specific_checks(self, checks_data: Dict[str, Any], specific_checks: List[str]) -> int:
        """Count how many specific checks exist in the data"""
        count = 0
        for group in checks_data.get('groups', []):
            for check in group.get('checks', []):
                check_id = check.get('id')
                check_id_str = str(check_id).strip()
                if check_id_str in specific_checks:
                    count += 1
        return count

    def _generate_summary(self) -> Dict[str, Any]:
        """Generate summary statistics"""
        total_checks = 0
        passed_checks = 0
        failed_checks = 0
        warn_checks = 0
        info_checks = 0
        
        for group in self.results:
            stats = group.get('group_stats', {})
            total_checks += stats.get('total', 0)
            passed_checks += stats.get('pass', 0)
            failed_checks += stats.get('fail', 0)
            warn_checks += stats.get('warn', 0)
            info_checks += stats.get('info', 0)
        
        return {
            'total_checks': total_checks,
            'passed_checks': passed_checks,
            'failed_checks': failed_checks,
            'warn_checks': warn_checks,
            'info_checks': info_checks
        }

    def _aggregate_component_stats(self) -> Dict[str, Dict[str, int]]:
        """Gom kết quả các group theo component_type"""
        agg: Dict[str, Dict[str, int]] = {}
        for g in self.results:
            comp = g.get('component_type', 'unknown')
            st = g.get('group_stats', {})
            if comp not in agg:
                agg[comp] = {'pass': 0, 'fail': 0, 'warn': 0, 'info': 0}
            for k in agg[comp]:
                agg[comp][k] += st.get(k, 0)
        return agg

    def _parse_remediation(self, check_id: str, remediation_text: str) -> dict:
        """Parse remediation text để tách các thành phần có thể highlight"""
        import re
        
        file_paths = re.findall(r'/[/\w\-\.]+\.ya?ml', remediation_text)
        etc_paths = re.findall(r'/etc/[/\w\-\.]+', remediation_text)
        parameters = re.findall(r'--[\w\-]+(?:=[\w\-\./]+)?', remediation_text)
        commands = re.findall(r'\b(?:systemctl|chmod|chown|edit|kubectl)\b', remediation_text)
        tls_values = re.findall(r'TLS_[\w_]+', remediation_text)
        kube_files = re.findall(r'kube-[\w\-]+\.yaml?', remediation_text)
        
        return {
            'id': check_id,
            'text': remediation_text,
            'components': {
                'file_paths': file_paths,
                'etc_paths': etc_paths,
                'parameters': parameters,
                'commands': commands,
                'tls_values': tls_values,
                'kube_files': kube_files
            }
        }

    def cleanup(self):
        """Cleanup resources"""
        if hasattr(self, 'executor'):
            self.executor.cleanup()
        self.logger.info("KubeBench cleanup completed")

# Enhanced Click CLI interface
@click.group()
@click.option('--config', default='config/config.yaml', help='Configuration file path')
@click.option('--config-dir', help='Configuration directory path (like kube-bench)')
@click.option('--log-level', type=click.Choice(['DEBUG', 'INFO', 'WARNING', 'ERROR']), 
              default='INFO', help='Logging level')
@click.option('--no-color', is_flag=True, help='Disable colored output')
@click.option('--enable-file-logging', is_flag=True, help='Enable file logging (logs/kube-bench.log)')
@click.pass_context
def cli(ctx, config, config_dir, log_level, no_color, enable_file_logging):
    """Kubernetes Security Benchmark Tool for K8s v1.30 (kube-bench compatible)"""
    ctx.ensure_object(dict)
    
    if config_dir:
        config = f"{config_dir}/config.yaml"
    
    ctx.obj['config'] = config
    ctx.obj['log_level'] = log_level
    ctx.obj['no_color'] = no_color
    ctx.obj['enable_file_logging'] = enable_file_logging

@cli.command()
@click.option('--targets', multiple=True, help='Targets to run (like kube-bench --targets)')
@click.option('--benchmark', help='Benchmark version to use')
@click.option('--check', help='Specific checks to run (comma-separated, e.g., 1.2.9,3.1.2,5.1.2)')
@click.option('--group', multiple=True, help='Specific groups to run')
@click.option('--output-format', type=click.Choice(['json', 'yaml', 'text', 'csv', 'table', 'html', 'pdf']),
              default='text', help='Output format')
@click.option('--output-file', help='Output file path')
@click.option('--no-passed', is_flag=True, help='Exclude passed checks from output')
@click.option('--no-manual', is_flag=True, help='Exclude manual checks from output')
@click.option('--no-remediation', is_flag=True, help='Exclude remediation from output')
@click.option('--no-progress', is_flag=True, help='Disable progress bar')
@click.option('--auto-config', is_flag=True, default=True, help='Automatically map checks to config files (default: True)')
@click.option('--auto-remediate', is_flag=True, help='Automatically execute remediation for failed checks')
@click.option('--dry-run', is_flag=True, help='Show what would be executed without actually running commands (for auto-remediation)')
@click.option('--yes', is_flag=True, help='Skip confirmation prompts (for auto-remediation)')
@click.argument('check_files', nargs=-1)
@click.pass_context
def run(ctx, targets, benchmark, check, group, output_format, output_file, 
        no_passed, no_manual, no_remediation, no_progress, auto_config, auto_remediate, dry_run, yes, check_files):
    """Run security checks (kube-bench compatible with auto-config mapping)"""
    
    # Parse check IDs từ comma-separated string
    check_ids = []
    if check:
        check_ids = [check_id.strip() for check_id in check.split(',') if check_id.strip()]
        click.echo(f"Running specific checks: {', '.join(check_ids)}")
    
    try:
        # Initialize KubeBench
        kube_bench = KubeBenchPython(
            ctx.obj['config'], 
            ctx.obj['log_level'], 
            ctx.obj['no_color'],
            ctx.obj['enable_file_logging']
        )
        
        # If specific checks are provided, use auto-mapping
        if check_ids:
            click.echo(f"Auto-mapping {len(check_ids)} checks to appropriate config files...")
            
            success = kube_bench.run_multiple_configs_with_report(
                check_ids,
                output_format=output_format,
                output_file=output_file,
                progress=not no_progress,
                targets=list(targets) if targets else None,
                include_passed=not no_passed,
                include_manual=not no_manual,
                show_remediation=not no_remediation
            )
            
            if not success:
                click.echo("Failed to complete auto-mapped checks", err=True)
                sys.exit(1)
            
            return
        else:
            # Original behavior: use provided check files or defaults
            if not check_files:
                check_files = ['config/etcd.yaml', 'config/controlplane.yaml']
            
            # Run checks for each file
            for check_file in check_files:
                if not Path(check_file).exists():
                    click.echo(f"Check file not found: {check_file}", err=True)
                    continue
                
                success = kube_bench.run_checks(
                    check_file, 
                    component_filter=None, 
                    progress=not no_progress,
                    targets=list(targets) if targets else None,
                    specific_checks=check_ids if check_ids else None
                )
                
                if not success:
                    click.echo(f"Failed to complete checks for {check_file}", err=True)
        
        # Generate report
        report_success = kube_bench.generate_report(
            output_format=output_format,
            output_file=output_file,
            include_passed=not no_passed,
            include_manual=not no_manual,
            show_remediation=not no_remediation,
            kube_bench_style=True
        )
        
        if not report_success:
            click.echo("Failed to generate report", err=True)
            sys.exit(1)
        
        # Execute auto remediation if requested
        if auto_remediate:
            click.echo("\n=== Auto Remediation ===")
            remediation_results = kube_bench.execute_auto_remediation_for_failed_checks(
                dry_run=dry_run,
                require_confirmation=not yes
            )
            
            # Display remediation summary
            click.echo(f"Remediation available: {remediation_results['remediation_available']}")
            click.echo(f"Remediation executed: {remediation_results['remediation_executed']}")
            click.echo(f"Remediation successful: {remediation_results['remediation_successful']}")
            click.echo(f"Remediation failed: {remediation_results['remediation_failed']}")
            
            # Show detailed results for each remediation
            for result in remediation_results['results']:
                remediation_result = result['remediation_result']
                status = "SUCCESS" if remediation_result.get('success') else "FAILED"
                click.echo(f"Check {result['check_id']}: {status}")
                if not remediation_result.get('success'):
                    click.echo(f"  Error: {remediation_result.get('error', 'Unknown error')}")
                click.echo(f"  Command: {remediation_result.get('command', 'N/A')}")
        
        # Check for failures and exit accordingly (like kube-bench)
        summary = kube_bench._generate_summary()
        if summary.get('failed_checks', 0) > 0:
            sys.exit(1)
            
    except KeyboardInterrupt:
        click.echo("\nOperation cancelled by user", err=True)
        sys.exit(130)
    except Exception as e:
        click.echo(f"Fatal error: {e}", err=True)
        sys.exit(1)

@cli.command()
@click.option('--dry-run', is_flag=True, help='Show what would be executed without actually running commands')
@click.option('--yes', is_flag=True, help='Skip confirmation prompts')
@click.option('--check', help='Specific check ID to remediate (e.g., 1.1.1)')
@click.option('--output-format', type=click.Choice(['text', 'json', 'yaml']), 
              default='text', help='Output format for remediation results')
@click.option('--output-file', help='Output file path for remediation results')
@click.pass_context
def remediate(ctx, dry_run, yes, check, output_format, output_file):
    """Execute auto remediation for failed checks"""
    
    try:
        # Initialize KubeBench
        kube_bench = KubeBenchPython(
            ctx.obj['config'], 
            ctx.obj['log_level'], 
            ctx.obj['no_color'],
            ctx.obj['enable_file_logging']
        )
        
        # If specific check is provided, run only that check first
        if check:
            click.echo(f"Running check {check} first...")
            success = kube_bench.run_multiple_configs_with_report(
                [check],
                output_format='text',
                progress=True
            )
            if not success:
                click.echo(f"Failed to run check {check}", err=True)
                sys.exit(1)
        else:
            # Run all checks first
            click.echo("Running all checks first...")
            success = kube_bench.run_multiple_configs_with_report(
                [],
                output_format='text',
                progress=True
            )
            if not success:
                click.echo("Failed to run checks", err=True)
                sys.exit(1)
        
        # Execute auto remediation
        click.echo(f"\nExecuting auto remediation (dry_run={dry_run})...")
        remediation_results = kube_bench.execute_auto_remediation_for_failed_checks(
            dry_run=dry_run,
            require_confirmation=not yes
        )
        
        # Display results
        if output_format == 'json':
            import json
            output = json.dumps(remediation_results, indent=2)
        elif output_format == 'yaml':
            import yaml
            output = yaml.dump(remediation_results, default_flow_style=False)
        else:
            # Text format
            output_lines = []
            output_lines.append("=== Auto Remediation Results ===")
            output_lines.append(f"Total checks: {remediation_results['total_checks']}")
            output_lines.append(f"Remediation available: {remediation_results['remediation_available']}")
            output_lines.append(f"Remediation executed: {remediation_results['remediation_executed']}")
            output_lines.append(f"Remediation successful: {remediation_results['remediation_successful']}")
            output_lines.append(f"Remediation failed: {remediation_results['remediation_failed']}")
            output_lines.append("")
            
            for result in remediation_results['results']:
                output_lines.append(f"Check: {result['check_id']} - {result['check_text']}")
                output_lines.append(f"Status: {result['status']}")
                remediation_result = result['remediation_result']
                if remediation_result.get('success'):
                    output_lines.append("Remediation: SUCCESS")
                else:
                    output_lines.append(f"Remediation: FAILED - {remediation_result.get('error', 'Unknown error')}")
                output_lines.append(f"Command: {remediation_result.get('command', 'N/A')}")
                output_lines.append("")
            
            output = '\n'.join(output_lines)
        
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(output)
            click.echo(f"Remediation results saved to: {output_file}")
        else:
            click.echo(output)
        
        # Exit with error code if any remediation failed
        if remediation_results['remediation_failed'] > 0:
            sys.exit(1)
            
    except KeyboardInterrupt:
        click.echo("\nOperation cancelled by user", err=True)
        sys.exit(130)
    except Exception as e:
        click.echo(f"Fatal error: {e}", err=True)
        sys.exit(1)

@cli.command()
@click.pass_context
def version(ctx):
    """Show version information (kube-bench compatible)"""
    click.echo("kube-bench-python version 1.0.0")
    click.echo("File-based approach - compatible with kube-bench YAML configs")

def main():
    """Main entry point for command line usage"""
    cli()

if __name__ == '__main__':
    main()
