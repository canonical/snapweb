/*
 * Copyright (C) 2014-2016 Canonical Ltd
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

package main

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"errors"
	"log"
	"math/big"
	"net"
	"os"
	"path/filepath"
	"time"
)

// CreateCertificateIfNeeded creates the certificate & key files, if they don't exist yet
func CreateCertificateIfNeeded() {
	certFilename := filepath.Join(os.Getenv("SNAP_DATA"), "cert.pem")
	keyFilename := filepath.Join(os.Getenv("SNAP_DATA"), "key.pem")

	_, err1 := os.Stat(certFilename)
	_, err2 := os.Stat(keyFilename)

	// skip if both cert and key exist
	if err1 == nil && err2 == nil {
		return
	}

	GenerateCertificate(certFilename, keyFilename)
}

// GenerateCertificate will generate a new self-signed certifiate at startup
func GenerateCertificate(certFilename string, keyFilename string) {
	/* With help from https://golang.org/src/crypto/tls/generate_cert.go */

	priv, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		log.Fatalf("Failed to generate private key: %s", err)
		return
	}

	notBefore := time.Now()
	validFor := 365 * 24 * time.Hour
	notAfter := notBefore.Add(validFor)

	serialNumberLimit := new(big.Int).Lsh(big.NewInt(1), 128)
	serialNumber, err := rand.Int(rand.Reader, serialNumberLimit)
	if err != nil {
		log.Fatalf("Failed to generate serial number: %s", err)
		return
	}

	template := x509.Certificate{
		SerialNumber: serialNumber,
		Subject: pkix.Name{
			Organization: []string{"snapweb"},
		},
		NotBefore:             notBefore,
		NotAfter:              notAfter,
		KeyUsage:              x509.KeyUsageKeyEncipherment | x509.KeyUsageDigitalSignature,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		BasicConstraintsValid: true,
	}

	// TODO: add other IP addresses and hostnames (check Avahi)
	template.IPAddresses = append(template.IPAddresses, net.ParseIP("127.0.0.1"))
	template.IsCA = false

	derBytes, err := x509.CreateCertificate(rand.Reader, &template, &template, &priv.PublicKey, priv)
	if err != nil {
		log.Fatalf("Failed to create certificate: %s", err)
		return
	}

	createPublicKeycertFile(certFilename, derBytes)
	createPrivateKeyFile(keyFilename, priv)
}

func createPublicKeycertFile(filename string, b []byte) error {
	certOut, err := os.Create(filename)
	if err != nil {
		log.Fatalf("failed to open cert.pem for writing: %s", err)
		return err
	}
	pem.Encode(certOut, &pem.Block{Type: "CERTIFICATE", Bytes: b})
	certOut.Close()
	return nil
}

func createPrivateKeyFile(filename string, k *rsa.PrivateKey) error {
	keyOut, err := os.OpenFile(filename, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		log.Fatal("failed to open key.pem for writing:", err)
		return err
	}
	if k == nil {
		return errors.New("Invalid private key context")
	}
	pem.Encode(keyOut, &pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(k)})
	keyOut.Close()
	return nil
}
