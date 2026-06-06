"""站点配置业务逻辑服务"""
from datetime import datetime
from sqlmodel import Session, select
from fastapi import HTTPException, status
from typing import List, Dict

from app.models.site_config import SiteConfig


def get_all_configs(session: Session) -> List[SiteConfig]:
    """获取所有配置项"""
    return session.exec(select(SiteConfig)).all()


def get_config_by_key(session: Session, key: str) -> SiteConfig:
    """根据键名获取配置"""
    config = session.exec(select(SiteConfig).where(SiteConfig.config_key == key)).first()
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"配置项 {key} 不存在"
        )
    return config


def update_config(session: Session, key: str, value: str, user_id: int) -> SiteConfig:
    """更新单个配置项"""
    config = get_config_by_key(session, key)
    config.config_value = value
    config.updated_at = datetime.utcnow()
    config.updated_by = user_id
    session.add(config)
    session.commit()
    session.refresh(config)
    return config


def batch_update_configs(session: Session, configs_dict: Dict[str, str], user_id: int) -> List[SiteConfig]:
    """批量更新配置项"""
    updated_configs = []
    # 首先检查是否所有 key 都存在，避免中途报错导致事务不一致
    for key in configs_dict.keys():
        get_config_by_key(session, key)
        
    for key, value in configs_dict.items():
        config = session.exec(select(SiteConfig).where(SiteConfig.config_key == key)).first()
        if config:
            config.config_value = value
            config.updated_at = datetime.utcnow()
            config.updated_by = user_id
            session.add(config)
            updated_configs.append(config)
            
    session.commit()
    for config in updated_configs:
        session.refresh(config)
    return updated_configs
