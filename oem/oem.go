package oem

type oem struct {
	Name     string `yaml:"name" json:"name"`
	Vendor   string `yaml:"vendor" json:"vendor"`
	Icon     string `yaml:"icon" json:"icon"`
	Version  string `yaml:"version" json:"version"`
	Type     string `yaml:"type" json:"type"`
	Branding struct {
		Name    string `yaml:"name" json:"name"`
		Subname string `yaml:"subname" json:"subname"`
	} `yaml:"branding" json:"branding"`
	Store struct {
		OemKey string `yaml:"oem-key" json:"oem-key"`
	} `yaml:"store" json:"store"`
}
