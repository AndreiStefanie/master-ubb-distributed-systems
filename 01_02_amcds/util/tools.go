package util

import (
	"regexp"
	"strconv"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
)

// GetRegisterId retrieves the register identifier from the abstraction
// app.nnar[x] -> x
func GetRegisterId(abstractionId string) string {
	re := regexp.MustCompile(`\[(.*)\]`)

	tokens := re.FindStringSubmatch(abstractionId)

	// [0] contains the full capturing group (e.g. "[x]") while [1] contains just the key (e.g. "x")
	return tokens[1]
}

type ProcessMap map[string]*pb.ProcessId

// GetProcessKey retrieves the key of the given process
func GetProcessKey(p *pb.ProcessId) string {
	return p.Owner + Int32ToString(p.Index)
}

// GetMaxRank retrieves the process with highest rank
func GetMaxRank(processes ProcessMap) *pb.ProcessId {
	var maxRank *pb.ProcessId

	for _, v := range processes {
		if maxRank == nil || v.Rank > maxRank.Rank {
			maxRank = v
			continue
		}
	}

	return maxRank
}

// GetMaxRank retrieves the process with highest rank
func GetMaxRankSlice(processes []*pb.ProcessId) *pb.ProcessId {
	var maxRank *pb.ProcessId

	for _, v := range processes {
		if maxRank == nil || v.Rank > maxRank.Rank {
			maxRank = v
			continue
		}
	}

	return maxRank
}

func Int32ToString(i int32) string {
	return strconv.Itoa(int(i))
}
