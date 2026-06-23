# app/core/validation_exception.py

from typing import Any

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel


ERROR_MESSAGE_TEMPLATES = {
    "missing": "{field}不能为空",
    "string_type": "{field}必须是字符串",
    "string_too_short": "{field}长度不能少于{min_length}个字符",
    "string_too_long": "{field}长度不能超过{max_length}个字符",
    "int_type": "{field}必须是整数",
    "int_parsing": "{field}必须是整数",
    "float_type": "{field}必须是数字",
    "float_parsing": "{field}必须是数字",
    "bool_type": "{field}必须是布尔值",
}


def get_body_model(request: Request) -> type[BaseModel] | None:
    """尝试从当前路由中获取请求体对应的 Pydantic Model"""

    route = request.scope.get("route")
    body_field = getattr(route, "body_field", None)

    if body_field is None:
        return None

    model = getattr(body_field, "type_", None)

    if isinstance(model, type) and issubclass(model, BaseModel):
        return model

    return None


def get_field_name(error: dict[str, Any]) -> str:
    loc = error.get("loc") or []

    # 常见 loc: ("body", "password")
    if len(loc) >= 2 and loc[0] == "body":
        return str(loc[-1])

    return str(loc[-1]) if loc else "参数"


def get_field_label(model: type[BaseModel] | None, field_name: str) -> str:
    if model is None:
        return field_name

    field = model.model_fields.get(field_name)

    if field is None:
        return field_name

    return field.title or field.description or field_name


def format_validation_error(
    error: dict[str, Any],
    model: type[BaseModel] | None,
) -> dict[str, Any]:
    error_type = error.get("type")
    ctx = error.get("ctx") or {}

    field_name = get_field_name(error)
    field_label = get_field_label(model, field_name)

    # min_length = 1 的场景，通常更希望提示"不能为空"
    if error_type == "string_too_short" and ctx.get("min_length") == 1:
        message = f"{field_label}不能为空"
    else:
        template = ERROR_MESSAGE_TEMPLATES.get(error_type)
        message = (
            template.format(field=field_label, **ctx)
            if template
            else f"{field_label}参数格式不正确"
        )

    return {
        "field": field_name,
        "message": message,
        "type": error_type,
    }


async def validation_exception_handler(
    request: Request,
    exc: Exception,
):
    if not isinstance(exc, RequestValidationError):
        return JSONResponse(
            status_code=500,
            content={"code": 500, "message": "未知错误", "errors": []},
        )
    
    model = get_body_model(request)

    errors = [
        format_validation_error(error, model)
        for error in exc.errors()
    ]

    return JSONResponse(
        status_code=422,
        content={
            "code": 422,
            "message": errors[0]["message"] if errors else "参数校验失败",
            "errors": errors,
        },
    )
