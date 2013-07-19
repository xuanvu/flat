#! /bin/sh
#qlmanage -t -s 75 -o . *.svg

for i in *.svg; do convert $i -geometry 64 `echo $i | sed -E 's/^(.*).svg$/\1.png/g'`; done
#for i in *.svg.png; do mv $i `echo $i | sed -E 's/^(.*).svg.png$/\1.png/g'`; done
