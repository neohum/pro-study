# 07-schema-validator (starter)
import sys
import json

# TODO(step-1): 타입 매핑 및 검증 함수
def check_type(val, expected_type: str) -> bool:
    return True

# TODO(step-2): 필드별 스키마 검증
def validate_field(key: str, val, spec) -> list[str]:
    return []

# TODO(step-3): 복합 객체 스키마 검증기
def validate_schema(data: dict, schema: dict) -> list[str]:
    return []

# TODO(step-4): 에러 포맷팅
def format_result(errors: list[str]) -> str:
    return "VALID" if not errors else "INVALID"

# TODO(step-5): REPL 파이프라인
def main():
    pass

if __name__ == "__main__":
    main()
