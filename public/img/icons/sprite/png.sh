#! /bin/sh -x
#qlmanage -t -s 75 -o . *.svg
for i in *-minor.svg; do convert $i -transparent white -geometry 75 `echo $i | sed -E 's/^([0-9bs]+)-(.*)/75-keysign-\1.png/g'`; done
for i in *_clef.svg; do convert $i -transparent white -geometry 64 `echo $i | sed -E 's/^(.*).svg$/64-\1.png/g'`; done