from abc import ABC, abstractmethod
from typing import Any


class BaseConnector(ABC):
    name: str = ""
    category: str = ""

    def __init__(self, config: dict):
        self.config = config

    @abstractmethod
    def validate_config(self) -> bool:
        pass

    @abstractmethod
    def test_connection(self) -> dict:
        pass

    @abstractmethod
    def list_capabilities(self) -> list[str]:
        pass

    @abstractmethod
    def execute_metric(self, metric_name: str, params: dict) -> Any:
        pass


class ConnectorRegistry:
    _registry: dict[str, type[BaseConnector]] = {}

    @classmethod
    def register(cls, connector_id: str, connector_class: type[BaseConnector]):
        cls._registry[connector_id] = connector_class

    @classmethod
    def get(cls, connector_id: str) -> type[BaseConnector] | None:
        return cls._registry.get(connector_id)

    @classmethod
    def list_registered(cls) -> list[str]:
        return list(cls._registry.keys())


registry = ConnectorRegistry()
