package main

import (
	"sync"
	"time"
)

type Snapshot struct {
	Timestamp        time.Time `json:"timestamp"`
	Goroutines       uint64    `json:"goroutines"`
	HeapObjectsBytes uint64    `json:"heap_objects_bytes"`
	TotalBytes       uint64    `json:"total_bytes"`
	GCCycles         uint64    `json:"gc_cycles"`
}

type RingBuffer struct {
	mu       sync.RWMutex
	capacity int
	items    []Snapshot
}

func NewRingBuffer(capacity int) *RingBuffer {
	return &RingBuffer{capacity: capacity}
}

func (rb *RingBuffer) Push(s Snapshot) {
	_ = s
}

func (rb *RingBuffer) All() []Snapshot {
	return nil
}

func (rb *RingBuffer) Latest() (Snapshot, bool) {
	return Snapshot{}, false
}

// TODO(step-1): Collector 구조체와 runtime/metrics 수집(Collect, Record, Latest, History) 구현
type Collector struct {
	buffer *RingBuffer
}

func NewCollector(historyCapacity int) *Collector {
	return &Collector{buffer: NewRingBuffer(historyCapacity)}
}

func (c *Collector) Collect() Snapshot {
	return Snapshot{Timestamp: time.Now()}
}

func (c *Collector) Record() Snapshot {
	return c.Collect()
}

func (c *Collector) Latest() Snapshot {
	return c.Collect()
}

func (c *Collector) History() []Snapshot {
	return nil
}
