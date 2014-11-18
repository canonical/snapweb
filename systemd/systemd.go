package systemd

import (
	"reflect"

	"launchpad.net/go-dbus/v1"
)

const (
	busName           string          = "org.freedesktop.systemd1"
	busPath           dbus.ObjectPath = "/org/freedesktop/systemd1"
	managerInterface  string          = "org.freedesktop.systemd1.Manager"
	unitInterface     string          = "org.freedesktop.systemd1.Unit"
	propertyInterface string          = "org.freedesktop.DBus.Properties"
)

type SystemD struct {
	conn *dbus.Connection
}

type Unit struct {
	ServiceName string
	State       string
	Description string
	objectPath  dbus.ObjectPath
	conn        *dbus.Connection
}

func New(conn *dbus.Connection) *SystemD {
	return &SystemD{
		conn: conn,
	}
}

func (sd *SystemD) Unit(service string) (*Unit, error) {
	mgrObject := sd.conn.Object(busName, busPath)

	reply, err := mgrObject.Call(managerInterface, "LoadUnit", service)
	if err != nil {
		return nil, err
	} else if reply.Type == dbus.TypeError {
		return nil, reply.AsError()
	}

	var unitPath dbus.ObjectPath
	if err := reply.Args(&unitPath); err != nil {
		return nil, err
	}

	unit := &Unit{
		conn:        sd.conn,
		objectPath:  unitPath,
		ServiceName: service,
		State:       "unkown",
	}

	state, err := unit.getStringProperty("ActiveState")
	if err != nil {
		return nil, err
	}

	unit.State = state

	description, err := unit.getStringProperty("Description")
	if err != nil {
		return nil, err
	}

	unit.Description = description

	return unit, nil
}

func (u *Unit) getStringProperty(propertyName string) (string, error) {
	propertyValue, err := u.getProperty(propertyName)
	if err != nil {
		return "", err
	}

	return reflect.ValueOf(propertyValue.Value).String(), nil
}

func (u *Unit) getProperty(propertyName string) (propertyValue dbus.Variant, err error) {
	unitObj := u.conn.Object(busName, u.objectPath)

	reply, err := unitObj.Call(propertyInterface, "Get", unitInterface, propertyName)
	if err != nil {
		return dbus.Variant{}, err
	} else if reply.Type == dbus.TypeError {
		return dbus.Variant{}, reply.AsError()
	}

	if err := reply.Args(&propertyValue); err != nil {
		return dbus.Variant{}, err
	}

	return propertyValue, nil
}
