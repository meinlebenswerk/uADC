#define ANALOG_PIN A0
#define NSAMPLES 64
int adc_value = 0;
unsigned int data = 0xffffffff;

int header = 0xbd;
int footer = 0xed;

int timer = 0;

// ~32.5ksps !!!

void setup() {
  pinMode(ANALOG_PIN, INPUT);
  Serial.begin(1000000);
  analogReadResolution(10);
}

void loop() {
  timer = micros();
  Serial.write(header);
  for(int i=0; i<NSAMPLES; i++){
    adc_value = analogRead(ANALOG_PIN);
    Serial.write((char *) &adc_value, 2);
  }
  timer = micros() - timer;
  Serial.write((char *) &timer, 2);
  Serial.write(footer);

  delayMicroseconds(10);
}
