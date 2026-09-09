package catalog

import (
	"errors"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// ErrOutside는 base 밖을 가리키는 상대 경로를 거부할 때 돌려준다.
var ErrOutside = errors.New("경로가 허용 범위를 벗어났습니다")

// 파일 트리에서 숨기는 이름. 빌드 산출물과 VCS 메타데이터는 학습 대상이 아니다.
var hiddenNames = map[string]bool{
	"build": true, ".git": true, "node_modules": true,
}

// FileNode는 코드 뷰어의 파일 트리 항목이다. Path는 base 기준 슬래시 구분 상대 경로.
type FileNode struct {
	Name     string     `json:"name"`
	Path     string     `json:"path"`
	IsDir    bool       `json:"isDir"`
	Children []FileNode `json:"children,omitempty"`
}

// SafeJoin은 base/rel을 만들되 rel이 base 밖으로 나가면 ErrOutside를 돌려준다.
func SafeJoin(base, rel string) (string, error) {
	if strings.HasPrefix(rel, "/") || strings.HasPrefix(rel, `\`) {
		return "", ErrOutside
	}
	rel = filepath.FromSlash(rel)
	if filepath.IsAbs(rel) || filepath.VolumeName(rel) != "" {
		return "", ErrOutside
	}
	joined := filepath.Join(base, rel)
	relBack, err := filepath.Rel(base, joined)
	if err != nil || relBack == ".." || strings.HasPrefix(relBack, ".."+string(filepath.Separator)) {
		return "", ErrOutside
	}
	return joined, nil
}

// Tree는 base 아래 파일 트리를 돌려준다. 디렉터리가 파일보다 먼저, 각각 이름순.
func Tree(base string) ([]FileNode, error) {
	return tree(base, "")
}

func tree(base, rel string) ([]FileNode, error) {
	entries, err := os.ReadDir(filepath.Join(base, filepath.FromSlash(rel)))
	if err != nil {
		return nil, err
	}
	var nodes []FileNode
	for _, e := range entries {
		name := e.Name()
		if hiddenNames[name] {
			continue
		}
		p := name
		if rel != "" {
			p = rel + "/" + name
		}
		n := FileNode{Name: name, Path: p, IsDir: e.IsDir()}
		if e.IsDir() {
			n.Children, err = tree(base, p)
			if err != nil {
				return nil, err
			}
		}
		nodes = append(nodes, n)
	}
	sort.SliceStable(nodes, func(i, j int) bool {
		if nodes[i].IsDir != nodes[j].IsDir {
			return nodes[i].IsDir
		}
		return nodes[i].Name < nodes[j].Name
	})
	return nodes, nil
}

// ReadFile은 base 아래 rel 파일을 읽는다. 경로 탈출은 ErrOutside.
func ReadFile(base, rel string) ([]byte, error) {
	p, err := SafeJoin(base, rel)
	if err != nil {
		return nil, err
	}
	st, err := os.Stat(p)
	if err != nil {
		return nil, err
	}
	if st.IsDir() {
		return nil, os.ErrNotExist
	}
	return os.ReadFile(p)
}
