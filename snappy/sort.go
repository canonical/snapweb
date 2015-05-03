package snappy

type snapPkgsByName []snapPkg

func (s snapPkgsByName) Len() int           { return len(s) }
func (s snapPkgsByName) Swap(i, j int)      { s[i], s[j] = s[j], s[i] }
func (s snapPkgsByName) Less(i, j int) bool { return s[i].Name < s[j].Name }
