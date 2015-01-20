Web development how-to
===

Copying files when they change
---

Let's assume you've got the snappy KVM up and running with the `snappyd` app installed (see ../README.md).

Make sure your SSH keys are copied over so you don't need a password to login to the box:

    ssh-copy-id -p 8022 ubuntu@localhost

Next make sure that the app's `www` directory is fully writable:

    ssh -p 8022 ubuntu@localhost sudo chmod -R 777 /apps/snappyd/current/www

Now run the watchers, to watch for when the files have changed and copy them over:

    ./watch.sh

Leave this running in its own terminal window, and start work. Your changes should be copied over live to the snappy box, so you can see them on http://localhost:4200.
