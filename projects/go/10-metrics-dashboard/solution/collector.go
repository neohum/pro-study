package main

import (
	"runtime/metrics"
	"sync"
	"time"
)

const (
	metricGoroutines  = "/sched/goroutines:goroutines"
	metricHeapObjects = "/memory/classes/heap/objects:bytes"
	metricTotalBytes  = "/memory/classes/total:bytes"
	metricGCCycles    = "/gc/cycles/total:gc-cycles"
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
	if capacity <= 0 {
		capacity = 60
	}
	return &RingBuffer{
		capacity: capacity,
		items:    make([]Snapshot, 0, capacity),
	}
}

func (rb *RingBuffer) Push(s Snapshot) {
	rb.mu.Lock()
	defer rb.mu.Unlock()

	if len(rb.items) >= rb.capacity {
		// 맨 앞 요소 제거
		copy(rb.items, rb.items[1:])
		rb.items[len(rb.items)-1] = s
	} else {
		rb.items = append(rb.items, s)
	}
}

func (rb *RingBuffer) All() []Snapshot {
	rb.mu.RLock()
	defer rb.mu.RUnlock()

	result := make([]Snapshot, len(rb.items))
	copy(result, rb.items)
	return result
}

func (rb *RingBuffer) Latest() (Snapshot, bool) {
	rb.mu.RLock()
	defer rb.mu.RUnlock()

	if len(rb.items) == 0 {
		return Snapshot{}, false
	}
	return rb.items[len(rb.items)-1], true
}

func (rb *RingBuffer) Len() int {
	rb.mu.RLock()
	defer rb.mu.RUnlock()
	return len(rb.items)
}

type Collector struct {
	buffer  *RingBuffer
	samples []metrics.Sample
}

func NewCollector(historyCapacity int) *Collector {
	return &Collector{
		buffer: NewRingBuffer(historyCapacity),
		samples: []metrics.Sample{
			{Name: metricGoroutines},
			{Name: metricHeapObjects},
			{Name: metricTotalBytes},
			{Name: metricGCCycles},
		},
	}
}

func (c *Collector) Collect() Snapshot {
	metrics.Read(c.samples)

	s := Snapshot{
		Timestamp: time.Now(),
	}

	for _, sample := range c.samples {
		switch sample.Name {
		case metricGoroutines:
			if sample.Value.Kind() == metrics.KindUint64 {
				s.Goroutines = sample.Value.Uint64()
			}
		case metricHeapObjects:
			if sample.Value.Kind() == metrics.KindUint64 {
				s.HeapObjectsBytes = sample.Value.Uint64()
			}
		case metricTotalBytes:
			if sample.Value.Kind() == metrics.KindUint64 {
				s.TotalBytes = sample.Value.Uint64()
			}
		case metricGCCycles:
			if sample.Value.Kind() == metrics.KindUint64 {
				s.GCCycles = sample.Value.Uint64()
			}
		}
	}

	return s
}

func (c *Collector) Record() Snapshot {
	s := c.Collect()
	c.buffer.Push(s)
	return s
}

func (c *Collector) Latest() Snapshot {
	if s, ok := c.buffer.Latest(); ok {
		return s
	}
	return c.Record()
}

func (c *Collector) History() []Snapshot {
	return c.buffer.All()
}
