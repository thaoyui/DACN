#!/usr/bin/env python3
"""
YAML Parser for kube-bench-python
Enhanced to support all kube-bench patterns and structures
"""

import yaml
import os
import re
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from utils import Logger, validate_yaml_structure

class YAMLParser:
    """Enhanced YAML parser supporting full kube-bench structure"""
    
    def __init__(self, config_path: str):
        self.config_path = Path(config_path)
        self.logger = Logger(__name__)
        self.config = self._load_config()
        self._validate_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load main configuration file with enhanced error handling"""
        if not self.config_path.exists():
            self.logger.error(f"Configuration file not found: {self.config_path}")
            raise FileNotFoundError(f"Config file not found: {self.config_path}")
        
        try:
            with open(self.config_path, 'r', encoding='utf-8') as file:
                config = yaml.safe_load(file)
                
            if not config:
                self.logger.warning(f"Empty configuration file: {self.config_path}")
                return {}
            
            self.logger.info(f"Successfully loaded configuration from {self.config_path}")
            return config
            
        except yaml.YAMLError as e:
            self.logger.error(f"YAML parsing error in config: {e}")
            raise
        except Exception as e:
            self.logger.error(f"Error loading configuration: {e}")
            raise
    
    def _validate_config(self):
        """Enhanced configuration validation"""
        if not self.config:
            self.logger.warning("Empty configuration loaded")
            return
            
        # Check for basic sections that should exist
        expected_sections = ['variables', 'output']
        missing = validate_yaml_structure(self.config, expected_sections)
        
        if missing:
            self.logger.warning(f"Missing configuration sections: {missing}")
        
        # Validate component configurations
        component_types = ['etcd', 'master', 'controlplane', 'policies', 'node']
        for component in component_types:
            if component in self.config:
                self._validate_component_config(component, self.config[component])
    
    def _validate_component_config(self, component_name: str, component_config: Dict[str, Any]):
        """Validate individual component configuration"""
        if not isinstance(component_config, dict):
            self.logger.warning(f"Component {component_name} config should be a dictionary")
            return
        
        # Check for components list
        if 'components' in component_config:
            components = component_config['components']
            if not isinstance(components, list):
                self.logger.warning(f"Components in {component_name} should be a list")
    
    def load_checks(self, check_file: str) -> Dict[str, Any]:
        """Load and validate security checks with enhanced support"""
        check_path = Path(check_file)
        
        if not check_path.exists():
            self.logger.error(f"Check file not found: {check_path}")
            raise FileNotFoundError(f"Check file not found: {check_path}")
        
        try:
            with open(check_path, 'r', encoding='utf-8') as file:
                checks = yaml.safe_load(file)
            
            if not checks:
                self.logger.warning(f"Empty checks file: {check_path}")
                return {}
            
            # Enhanced validation
            validation_result = self._validate_checks_structure(checks)
            if not validation_result[0]:
                self.logger.error(f"Invalid checks structure: {validation_result[1]}")
                raise ValueError(f"Invalid checks structure: {validation_result[1]}")
            
            # Count and log statistics
            total_groups = len(checks.get('groups', []))
            total_checks = sum(len(group.get('checks', [])) for group in checks.get('groups', []))
            manual_checks = self._count_manual_checks(checks)
            automated_checks = total_checks - manual_checks
            
            self.logger.info(f"Loaded {total_groups} groups with {total_checks} checks ({automated_checks} automated, {manual_checks} manual) from {check_path}")
            return checks
            
        except yaml.YAMLError as e:
            self.logger.error(f"YAML parsing error in {check_path}: {e}")
            raise
        except Exception as e:
            self.logger.error(f"Error loading checks from {check_file}: {e}")
            raise
    
    def _count_manual_checks(self, checks: Dict[str, Any]) -> int:
        """Count manual checks in the structure"""
        manual_count = 0
        for group in checks.get('groups', []):
            for check in group.get('checks', []):
                if check.get('type') == 'manual' or not check.get('audit'):
                    manual_count += 1
        return manual_count
    
    def _validate_checks_structure(self, checks: Dict[str, Any]) -> Tuple[bool, str]:
        """Enhanced validation of checks structure"""
        required_fields = ['id', 'text', 'type', 'groups']
        
        # Check required root fields
        missing = validate_yaml_structure(checks, required_fields)
        if missing:
            return False, f"Missing required root fields: {missing}"
        
        # Validate groups
        groups = checks.get('groups', [])
        if not isinstance(groups, list) or not groups:
            return False, "Groups must be a non-empty list"
        
        # Enhanced group validation
        for group_idx, group in enumerate(groups):
            validation_result = self._validate_group_structure(group, group_idx)
            if not validation_result[0]:
                return validation_result
        
        return True, "Valid structure"
    
    def _validate_group_structure(self, group: Dict[str, Any], group_idx: int) -> Tuple[bool, str]:
        """Validate individual group structure"""
        if not isinstance(group, dict):
            return False, f"Group {group_idx} must be a dictionary"
        
        required_group_fields = ['id', 'text', 'checks']
        missing_group = validate_yaml_structure(group, required_group_fields)
        if missing_group:
            return False, f"Group {group_idx} missing fields: {missing_group}"
        
        # Validate checks in group
        group_checks = group.get('checks', [])
        if not isinstance(group_checks, list):
            return False, f"Checks in group {group_idx} must be a list"
        
        for check_idx, check in enumerate(group_checks):
            validation_result = self._validate_single_check(check, group_idx, check_idx)
            if not validation_result[0]:
                return validation_result
        
        return True, "Valid group"
    
    def _validate_single_check(self, check: Dict[str, Any], group_idx: int, check_idx: int) -> Tuple[bool, str]:
        """Enhanced validation of single check"""
        if not isinstance(check, dict):
            return False, f"Check {group_idx}.{check_idx} must be a dictionary"
        
        required_check_fields = ['id', 'text']
        missing_check = validate_yaml_structure(check, required_check_fields)
        if missing_check:
            return False, f"Check {group_idx}.{check_idx} missing fields: {missing_check}"
        
        # Validate check ID format (supports both numeric and string IDs)
        check_id = check.get('id', '')
        if not re.match(r'^[\d\.]+$', str(check_id)):
            return False, f"Check {group_idx}.{check_idx} has invalid ID format: {check_id}"
        
        # Validate tests structure if present
        if 'tests' in check:
            validation_result = self._validate_tests_structure(check['tests'], check_id)
            if not validation_result[0]:
                return validation_result
        
        # Validate check type
        check_type = check.get('type', 'automated')
        if check_type not in ['automated', 'manual', 'skip']:
            return False, f"Check {check_id} has invalid type: {check_type}"
        
        return True, "Valid check"
    
    def _validate_tests_structure(self, tests: Dict[str, Any], check_id: str) -> Tuple[bool, str]:
        """Enhanced validation of tests structure"""
        if not isinstance(tests, dict):
            return False, f"Tests in check {check_id} must be a dictionary"
        
        if 'test_items' in tests:
            test_items = tests['test_items']
            if not isinstance(test_items, list):
                return False, f"Test items in check {check_id} must be a list"
            
            for item_idx, item in enumerate(test_items):
                validation_result = self._validate_test_item(item, check_id, item_idx)
                if not validation_result[0]:
                    return validation_result
        
        # Validate bin_op if present
        if 'bin_op' in tests:
            bin_op = tests['bin_op']
            if bin_op not in ['and', 'or']:
                return False, f"Invalid bin_op in check {check_id}: {bin_op}"
        
        return True, "Valid tests"
    
    def _validate_test_item(self, item: Dict[str, Any], check_id: str, item_idx: int) -> Tuple[bool, str]:
        """Validate individual test item"""
        if not isinstance(item, dict):
            return False, f"Test item {item_idx} in check {check_id} must be a dictionary"
        
        # Must have at least one of: flag, path, env
        required_fields = ['flag', 'path', 'env']
        if not any(field in item for field in required_fields):
            return False, f"Test item {item_idx} in check {check_id} must have at least one of: {required_fields}"
        
        # Validate compare structure if present
        if 'compare' in item:
            compare = item['compare']
            if not isinstance(compare, dict):
                return False, f"Compare in test item {item_idx} of check {check_id} must be a dictionary"
            
            if 'op' not in compare or 'value' not in compare:
                return False, f"Compare in test item {item_idx} of check {check_id} must have 'op' and 'value'"
            
            # Validate comparison operator
            valid_ops = ['eq', 'noteq', 'has', 'nothave', 'gte', 'lte', 'gt', 'lt', 'bitmask', 'regex', 'valid_elements']
            if compare['op'] not in valid_ops:
                return False, f"Invalid comparison operator in check {check_id}: {compare['op']}"
        
        return True, "Valid test item"
    
    def parse_check(self, check: Dict[str, Any]) -> Dict[str, Any]:
        """Enhanced check parsing supporting all kube-bench patterns"""
        parsed = {
            'id': str(check.get('id', 'unknown')),
            'text': check.get('text', 'No description provided'),
            'audit': check.get('audit'),
            'audit_config': check.get('audit_config'),  # Support for config file checks
            'audit_env': check.get('audit_env'),        # Support for environment variable checks
            'tests': check.get('tests', {}),
            'remediation': check.get('remediation', 'No remediation provided'),
            'scored': check.get('scored', True),
            'type': check.get('type', 'automated'),
            'use_multiple_values': check.get('use_multiple_values', False)
        }
        
        # Normalize tests structure
        if parsed['tests']:
            parsed['tests'] = self._normalize_tests(parsed['tests'])
        
        # Handle special cases for manual checks
        if parsed['type'] == 'manual':
            parsed['scored'] = False  # Manual checks are typically not scored
        
        return parsed
    
    def _normalize_tests(self, tests: Dict[str, Any]) -> Dict[str, Any]:
        """Enhanced tests normalization"""
        normalized = {
            'bin_op': tests.get('bin_op', 'and'),
            'test_items': tests.get('test_items', [])
        }
        
        # Ensure bin_op is valid
        if normalized['bin_op'] not in ['and', 'or']:
            self.logger.warning(f"Invalid bin_op '{normalized['bin_op']}', defaulting to 'and'")
            normalized['bin_op'] = 'and'
        
        # Enhanced test items normalization
        normalized_items = []
        for item in normalized['test_items']:
            if isinstance(item, dict):
                normalized_item = {
                    'flag': item.get('flag'),
                    'path': item.get('path'),      # Support for config path checks
                    'env': item.get('env'),
                    'set': item.get('set'),
                    'compare': item.get('compare')
                }
                
                # Remove None values
                normalized_item = {k: v for k, v in normalized_item.items() if v is not None}
                
                # Ensure at least one check type is present
                if any(k in normalized_item for k in ['flag', 'path', 'env']):
                    normalized_items.append(normalized_item)
                else:
                    self.logger.warning(f"Test item missing required fields: {item}")
        
        normalized['test_items'] = normalized_items
        return normalized
    
    def get_variable(self, var_name: str, default: str = "") -> str:
        """Enhanced variable retrieval with substitution support"""
        variables = self.config.get('variables', {})
        value = variables.get(var_name, default)
        
        # Support variable substitution (e.g., ${HOME}/config)
        if isinstance(value, str) and '${' in value:
            value = os.path.expandvars(value)
        
        return value
    
    def get_component_config(self, component_type: str) -> Dict[str, Any]:
        """Enhanced component configuration retrieval"""
        component_config = self.config.get(component_type, {})
        
        if not component_config:
            self.logger.warning(f"No configuration found for component type: {component_type}")
            return {}
        
        # Add default values if missing
        if 'components' not in component_config:
            component_config['components'] = []
        
        return component_config
    
    def get_paths_for_component(self, component_type: str, component_name: str, path_type: str) -> List[str]:
        """Get file paths for specific component and path type"""
        component_config = self.get_component_config(component_type)
        
        if component_name not in component_config:
            return []
        
        component_data = component_config[component_name]
        paths = component_data.get(path_type, [])
        
        if isinstance(paths, str):
            paths = [paths]
        
        # Expand variables in paths
        expanded_paths = []
        for path in paths:
            if isinstance(path, str):
                expanded_path = os.path.expandvars(path)
                expanded_paths.append(expanded_path)
        
        return expanded_paths
    
    def get_default_path(self, component_type: str, component_name: str, path_type: str) -> Optional[str]:
        """Get default path for component"""
        component_config = self.get_component_config(component_type)
        
        if component_name not in component_config:
            return None
        
        component_data = component_config[component_name]
        default_key = f"default{path_type}"
        
        default_path = component_data.get(default_key)
        if default_path:
            return os.path.expandvars(default_path)
        
        return None
    
    def get_benchmark_info(self) -> Dict[str, str]:
        """Enhanced benchmark version information"""
        version_config = self.config.get('version_config', {})
        
        benchmark_info = {
            'target_version': version_config.get('target_version', '1.30'),
            'cis_version': version_config.get('cis_version', 'cis-1.10'),
            'benchmark_version': version_config.get('benchmark_version', '1.30'),
            'tool_version': '1.0.0',
            'approach': 'file-based'
        }
        
        return benchmark_info
    
    def export_config(self, output_path: str) -> bool:
        """Export current configuration to file"""
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                yaml.dump(self.config, f, default_flow_style=False, allow_unicode=True)
            
            self.logger.info(f"Configuration exported to {output_path}")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to export configuration: {e}")
            return False
    
    def get_check_statistics(self, checks_data: Dict[str, Any]) -> Dict[str, int]:
        """Get statistics about checks in the file"""
        stats = {
            'total_groups': len(checks_data.get('groups', [])),
            'total_checks': 0,
            'automated_checks': 0,
            'manual_checks': 0,
            'scored_checks': 0,
            'unscored_checks': 0
        }
        
        for group in checks_data.get('groups', []):
            for check in group.get('checks', []):
                stats['total_checks'] += 1
                
                if check.get('type') == 'manual':
                    stats['manual_checks'] += 1
                else:
                    stats['automated_checks'] += 1
                
                if check.get('scored', True):
                    stats['scored_checks'] += 1
                else:
                    stats['unscored_checks'] += 1
        
        return stats
