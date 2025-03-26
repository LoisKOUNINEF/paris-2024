#!/bin/bash

envsubst < .github/workflows/stacks/stack.yml > new-${STACK_NAME}.yml