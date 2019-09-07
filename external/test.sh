#!/bin/bash

if [ $# -gt 1 ]
then
	echo "Too many Argument"
	echo "Usage : ./test.sh 0x[6byte hexadecimal]"
	exit 1
fi

number=$1
if [ ${#number} -ne 14 ]
then
	echo "Usage : ./test.sh 0x[6byte hexadecimal]"
	exit 1
fi

delayMicroseconds(){
	startTime=$((`date +%s%N`/1000))
	while [ $(($((`date +%s%N`/1000))-$startTime)) -lt $1 ]
	do
		:
	done
}

echo "Sending IR Signal : $number"

gpio mode 1 pwm
gpio pwmTone 1 38000

index=47

gpio pwm 1 1024
delayMicroseconds 4500
gpio pwm 1 0
delayMicroseconds 4500

while [ $index -gt 0 ]
do
	gpio pwm 1 1024
	delayMicroseconds 600
	gpio pwm 1 0
	if [ $(($number & 1<<$index)) -eq 0 ]
	then
		delayMicroseconds 1700
	else
		delayMicroseconds 600
	fi

	index=$(($index-1))
done

gpio pwm 1 1024
delayMicroseconds 600
gpio pwm 1 0
delayMicroseconds 5500

gpio pwm 1 1024
delayMicroseconds 4500
gpio pwm 1 0
delayMicroseconds 4500

index=47

while [ $index -gt 0 ]
do
        gpio pwm 1 1024
        delayMicroseconds 600
        gpio pwm 1 0
        if [ $(($number & 1<<$index)) -eq 0 ]
        then
                delayMicroseconds 1700
        else
                delayMicroseconds 600
        fi
done

gpio pwm 1 1024
delayMicroseconds 600
gpio pwm 1 0

echo "Successfully Send Signal"
exit 0


