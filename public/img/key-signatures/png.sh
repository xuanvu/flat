#! /bin/sh
qlmanage -t -s 75 -o . *.svg
for i in *.svg.png; do mv $i `echo $i | sed -E 's/^([0-9bs]+)-(.*)/keysign-\1.png/g'`; done
