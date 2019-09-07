#include <unistd.h>
#include <stdio.h>
#include <wiringPi.h>

#define DELAY 12

void delay_(int length){
	for(int i=0; i<length/50; i++){
		delayMicroseconds(50);
	}
}

void pulse(int length){
	while(length>0){
		digitalWrite(1, HIGH);
		delayMicroseconds(DELAY);
		digitalWrite(1, LOW);
		delayMicroseconds(DELAY);
		length -= 26;
	}
//	digitalWrite(1, LOW);
}

int main(int argv, char **args){
	if(argv >= 3){
		printf("Error!!");
		return 1;
	}

	int len = 0;
	for(;args[1][len]; len++);
	if(len != 48) {
		printf("Error!!");
		return 1;
	}

	wiringPiSetup();
	pinMode(1, OUTPUT);

	pulse(4500);
	delay_(4500);
	for(int i=0; i<len; i++){
		pulse(600);
		if(args[1][i] == '0'){
			delay_(1600);
		} else{
			delay_(560);
		}
	}
	pulse(600);
	delay_(5500);
	pulse(4500);
	delay_(4500);

	for(int i=0; i<len; i++){
                pulse(600);
                if(args[1][i] == '0'){
                        delay_(1600);
                } else{
                        delay_(560);
                }
        }
	pulse(600);

	return 0;
}
