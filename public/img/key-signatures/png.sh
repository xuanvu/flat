#! /bin/sh
qlmanage -t -s 100 -o . *.svg
for i in *.svg.png; do mv $i `echo $i | sed -E 's/^([0-9bs]+)-(.*)/\1.png/g'`; done
