from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.repositories import HealthRuleRepository, AppHealthRuleRepository
from app.models import HealthRule


class RuleService:
    def __init__(self, db: Session):
        self.db = db
        self.rule_repo = HealthRuleRepository(db)
        self.app_rule_repo = AppHealthRuleRepository(db)

    def list_rules(self, enabled_only: bool = False) -> List[Dict[str, Any]]:
        if enabled_only:
            rules = self.rule_repo.get_enabled()
        else:
            rules = self.rule_repo.get_all()
        return [self._serialize_rule(r) for r in rules]

    def get_rule(self, rule_id: str) -> Optional[Dict[str, Any]]:
        rule = self.rule_repo.get(rule_id)
        if not rule:
            return None
        return self._serialize_rule(rule)

    def create_rule(self, data: Dict[str, Any]) -> Dict[str, Any]:
        rule = HealthRule(**data)
        created = self.rule_repo.create(rule)
        return self._serialize_rule(created)

    def update_rule(self, rule_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        rule = self.rule_repo.get(rule_id)
        if not rule:
            return None
        updated = self.rule_repo.update(rule, data)
        return self._serialize_rule(updated)

    def delete_rule(self, rule_id: str) -> bool:
        rule = self.rule_repo.get(rule_id)
        if not rule:
            return False
        return self.rule_repo.delete(rule)

    def get_rules_for_app(self, app_id: str) -> List[Dict[str, Any]]:
        app_rules = self.app_rule_repo.get_by_app(app_id)
        if app_rules:
            rules = [ar.rule for ar in app_rules]
        else:
            rules = self.rule_repo.get_all(limit=5)
        return [self._serialize_rule(r) for r in rules]

    def _serialize_rule(self, r: HealthRule) -> Dict[str, Any]:
        return {
            "id": r.id,
            "name": r.name,
            "metric": r.metric,
            "operator": r.operator,
            "threshold": r.threshold,
            "severity": r.severity,
            "enabled": r.enabled,
            "scope": r.scope,
            "trigger_count": r.trigger_count,
            "tags": r.tags,
            "version": r.version,
            "last_triggered": r.last_triggered,
            "description": r.description,
        }
