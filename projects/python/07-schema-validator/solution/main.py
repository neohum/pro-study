# 07-schema-validator (solution)
import sys
import json

def validate(schema: dict, data: dict) -> list[str]:
    errors = []
    for field, expected in schema.items():
        if field not in data:
            errors.append(f"{field}: missing required field")
            continue
        val = data[field]
        if expected == "str" and not isinstance(val, str):
            errors.append(f"{field}: expected str, got {type(val).__name__}")
        elif expected == "int" and (not isinstance(val, int) or isinstance(val, bool)):
            errors.append(f"{field}: expected int, got {type(val).__name__}")
        elif expected == "bool" and not isinstance(val, bool):
            errors.append(f"{field}: expected bool, got {type(val).__name__}")
    return errors

def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        payload = json.loads(line)
        schema = payload.get("schema", {})
        data = payload.get("data", {})
        errs = validate(schema, data)
        if not errs:
            print("VALID")
        else:
            print("INVALID: " + "; ".join(errs))

if __name__ == "__main__":
    main()
