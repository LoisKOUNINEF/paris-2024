#!/bin/bash

npx jest --coverage --coverageDirectory=./coverage/final --coverageReporters=html --maxWorkers=2 --testPathIgnorePatterns=/apps/server-e2e --silent

mkdir coverage-report

shopt -s extglob

cp -r ./coverage/final/!(apps|libs|tools) ./coverage-report

shopt -u extglob