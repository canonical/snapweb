#!/bin/sh

FILE_PID=kvm.pid
FILE_MONITOR=monitor
PORT_SSH=8022
IMAGE_BOOTABLE=${IMAGE_BOOTABLE:-ubuntu-core-16.img}

is_vm_running() {
    if [ -e $FILE_PID ] && [ -e $FILE_MONITOR ]; then
        return 0
    fi
    return 1
}

send_cmd() {
    QEMU_MONITOR_COMMAND=$1
    echo "${QEMU_MONITOR_COMMAND}" | socat - UNIX-CONNECT:${FILE_MONITOR}
}

stop_vm() {
    send_cmd quit
}

start_vm() {

    if [ ! -e ${IMAGE_BOOTABLE} ]; then
	      IMAGE_BOOTABLE=${HOME}/.spread/qemu/${IMAGE_BOOTABLE}
        if [ ! -e ${IMAGE_BOOTABLE} ]; then
            echo "Unable to find a bootable image"
            exit 1
        fi
    fi

    qemu-system-x86_64 \
        -enable-kvm -snapshot \
        -m 500 \
        -net nic -net user,hostfwd=tcp::$PORT_SSH-:22,hostfwd=tcp::4201-:4201 \
        -drive file=$IMAGE_BOOTABLE,format=raw \
        -pidfile $FILE_PID \
        -monitor unix:$FILE_MONITOR,server,nowait \
        -serial unix:$FILE_MONITOR.serial,server,nowait \
        -nographic &
}

if [ $# -ne 1 ]; then
    echo "Need exactly one argument to run."
    echo "Try running as $0 start|stop|status"
    exit 1
fi

if [ $1 != "start" ] && [ $1 != "stop" ] && [ $1 != "status" ]; then
    echo "Invalid argument provided."
    echo "Try running as $0 start|stop|status"
    exit 1
fi

if [ $1 = "start" ]; then
    if is_vm_running; then
        echo "Cannot start vm is already running."
        exit 1
    fi
    echo "Starting"
    start_vm
fi

if [ $1 = "stop" ]; then
    if is_vm_running; then
        stop_vm
        # If VM still running, force clean
        if is_vm_running; then
            rm $FILE_PID
            rm $FILE_MONITOR
        fi
        echo "Stopped"
        exit 1
    fi
    echo "Nothing to stop."
    exit 1
fi

if [ $1 = "status" ]; then
    if is_vm_running; then
        echo "Running"
    else
        echo "Not running"
    fi
fi
