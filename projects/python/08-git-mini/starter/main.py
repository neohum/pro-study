# 08-git-mini (starter)
import sys
import hashlib
import zlib

# TODO(step-1): Blob 객체 생성 및 해싱
def hash_blob(data: bytes) -> tuple[str, bytes]:
    return "", b""

# TODO(step-2): Tree 객체 직렬화
def make_tree(entries: list[tuple[str, str]]) -> tuple[str, bytes]:
    return "", b""

# TODO(step-3): Commit 객체 생성
def make_commit(tree_sha: str, message: str) -> tuple[str, bytes]:
    return "", b""

# TODO(step-4): 객체 복원 및 검증
def read_object(raw: bytes) -> tuple[str, bytes]:
    return "", b""

# TODO(step-5): Git CLI 시뮬레이션 명령 처리
def main():
    pass

if __name__ == "__main__":
    main()
