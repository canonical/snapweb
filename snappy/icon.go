package snappy

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

var (
	ErrDataPathNotSet    = errors.New("package data path not set")
	ErrOnIconDataPathSet = errors.New("cannot prepare icon data path")
	ErrIconNotExist      = errors.New("the icon does not exist")
)

func localIconPath(pkgName, iconPath string) (relativePath string, err error) {
	dataPath, relativePath, err := IconDir()
	if err != nil {
		return "", err
	}

	baseIcon := fmt.Sprintf("%s_%s", pkgName, filepath.Base(iconPath))

	relativePath = filepath.Join(relativePath, baseIcon)
	iconDstPath := filepath.Join(dataPath, baseIcon)

	// if the icon specified is bad, return
	if _, err := os.Stat(iconPath); os.IsNotExist(err) {
		return "", ErrIconNotExist
	}

	// if we already have the icon, return
	if _, err := os.Stat(iconDstPath); err == nil {
		return filepath.Join("/", relativePath), nil
	} else if !os.IsNotExist(err) {
		return "", err
	}

	if err := copyFile(iconPath, iconDstPath); err != nil {
		return "", err
	}

	return filepath.Join("/", relativePath), nil
}

func IconDir() (dataPath, relativeBasePath string, err error) {
	dataPath = os.Getenv("SNAP_APP_DATA_PATH")
	if dataPath == "" {
		return "", "", ErrDataPathNotSet
	}

	dataPath = filepath.Join(dataPath, "icons")
	if err := os.MkdirAll(dataPath, 0755); err != nil {
		fmt.Println("WARNING: cannot create", dataPath)
		return "", "", ErrOnIconDataPathSet
	}

	return dataPath, "icons", nil
}

func copyFile(src, dst string) error {
	dstFile, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer dstFile.Close()

	srcFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer srcFile.Close()

	reader := bufio.NewReader(srcFile)
	writer := bufio.NewWriter(dstFile)
	defer func() {
		if err != nil {
			writer.Flush()
		}
	}()
	if _, err = io.Copy(writer, reader); err != nil {
		return err
	}
	writer.Flush()
	return nil
}
